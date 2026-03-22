package lk.karu.openbay.service;

import com.google.gson.JsonObject;
import jakarta.servlet.http.HttpServletRequest;
import lk.karu.openbay.dto.AddressDTO;
import lk.karu.openbay.dto.CartDTO;
import lk.karu.openbay.dto.CheckoutRequestDTO;
import lk.karu.openbay.dto.PayHereDTO;
import lk.karu.openbay.entity.*;
import lk.karu.openbay.util.AppUtil;
import lk.karu.openbay.util.Env;
import lk.karu.openbay.util.HibernateUtil;
import lk.karu.openbay.util.PayHereUtil;
import lk.karu.openbay.validation.Validator;
import org.hibernate.Session;

import java.util.ArrayList;
import java.util.List;

public class checkoutService {

    private OrderService orderService = new OrderService();

    public String getCheckoutUerData(HttpServletRequest request){

        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        User sessionUser = (User) request.getSession().getAttribute("user");
        if(sessionUser == null){
            message = "Please login first!";
        }else{
            Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
            Address primaryAddress = hibernateSession.createQuery("FROM Address a WHERE a.user.id=:userId AND a.isPrimary=:primary", Address.class)
                    .setParameter("userId", sessionUser.getId())
                    .setParameter("primary", true)
                    .getSingleResultOrNull();

            if(primaryAddress == null){
                message = "You haven't a primary Address!";
            }else{
                AddressDTO addressDTO = new AddressDTO();

                addressDTO.setId(primaryAddress.getId());
                addressDTO.setUserId(sessionUser.getId());
                addressDTO.setFirstName(sessionUser.getFname());
                addressDTO.setLastName(sessionUser.getLname());
                addressDTO.setEmail(sessionUser.getEmail());
                addressDTO.setLineOne(primaryAddress.getLineOne());
                addressDTO.setLineTwo(primaryAddress.getLineTwo());
                addressDTO.setPostalCode(primaryAddress.getPostalCode());
                addressDTO.setMobile(primaryAddress.getMobile());
                addressDTO.setCityName(primaryAddress.getCity().getName());
                addressDTO.setCityId(primaryAddress.getCity().getId());

                List<Cart> cartList = hibernateSession.createQuery("FROM Cart c WHERE c.user.id=:userId", Cart.class)
                        .setParameter("userId", sessionUser.getId())
                        .getResultList();

                if(cartList.isEmpty()){
                    message = "Your cart is empty. Please add items first.";
                }else{

                    int totalQty = 0;
                    double subTotal = 0;

                    List<CartDTO> cartDTOList = new ArrayList<>();

                    for(Cart cart : cartList){

                        totalQty += cart.getQty();

                        VariantSize variantSize = hibernateSession.find(VariantSize.class, cart.getVariantSize().getId());

                        ProductVariant variant = hibernateSession.find(ProductVariant.class,
                                variantSize.getVariant().getId());

                        CartDTO cartDTO = new CartDTO();
                        cartDTO.setCartId(cart.getId());
                        cartDTO.setProductId(variantSize.getVariant().getProduct().getId());
                        cartDTO.setVariantSizeId(variantSize.getId());
                        cartDTO.setTitle(variantSize.getVariant().getProduct().getTitle());

                        if(variant.getImages() != null && !variant.getImages().isEmpty()){
                            VariantImage image = variant.getImages().iterator().next();
                            cartDTO.setImage(image.getFilePath());
                        }

                        cartDTO.setQty(cart.getQty());
                        cartDTO.setColor(variantSize.getVariant().getColorHex());
                        cartDTO.setPrice(variantSize.getPrice());
                        cartDTO.setSize(variantSize.getSize());

                        double itemTotal = variantSize.getPrice() * cart.getQty();
                        cartDTO.setTotalPrice(itemTotal);

                        subTotal += itemTotal;

                        cartDTOList.add(cartDTO);

                    }

                    List<Shipping> shippingList = hibernateSession.createQuery("from Shipping s where s.minQty=:qty", Shipping.class)
                            .setParameter("qty", totalQty)
                            .getResultList();

                    responseObject.addProperty("totalQty", totalQty);
                    responseObject.addProperty("subTotal", subTotal);

                    status = true;
                    responseObject.add("userPrimaryAddress", AppUtil.GSON.toJsonTree(addressDTO));
                    responseObject.add("cartList", AppUtil.GSON.toJsonTree(cartDTOList));


                }


            }

            hibernateSession.close();

        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);

    }


    public String processCheckout(CheckoutRequestDTO requestDTO, HttpServletRequest request){
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        Session hibernateSession = null;

        double shippingFee = requestDTO.getShippingFee();

        try {
            hibernateSession = HibernateUtil.getSessionFactory().openSession();
            hibernateSession.beginTransaction();

            User sessionUser = (User) request.getSession().getAttribute("user");

            if(sessionUser == null){
                message = "Session expired. Please login again and try!";
            } else {
                User dbUser = hibernateSession.find(User.class, sessionUser.getId());

                if (requestDTO.isCurrentAddress()) {
                    Address address = hibernateSession.createQuery(
                                    "FROM Address a WHERE a.user.id=:user AND a.isPrimary=:primary",
                                    Address.class)
                            .setParameter("user", dbUser.getId())
                            .setParameter("primary", true)
                            .getSingleResultOrNull();

                    if (address == null) {
                        message = "Primary address not found. Please check again!";

                    } else {
                        Order pendingOrder = orderService.createPendingOrder(dbUser, hibernateSession, shippingFee);
                        PayHereDTO paymentDetails = createPaymentDetails(hibernateSession, pendingOrder, shippingFee);
                        responseObject.add("paymentDetails", AppUtil.GSON.toJsonTree(paymentDetails));
                        status = true;
                        message = "Checkout successful";
                    }
                } else {

                    if (requestDTO.getFirstName() == null || requestDTO.getFirstName().isBlank()) {
                        message = "First Name is required!";
                    } else if (requestDTO.getLastName() == null || requestDTO.getLastName().isBlank()) {
                        message = "Last Name is required!";
                    } else if (requestDTO.getEmail() == null || requestDTO.getEmail().isBlank()) {
                        message = "Email is required!";
                    } else if (!requestDTO.getEmail().matches(Validator.EMAIL_VALIDATION)) {
                        message = "Enter a valid email address!";
                    } else if (requestDTO.getCity() ==0 || requestDTO.getCity() == AppUtil.DEFAULT_SELECTOR_VALUE) {
                        message = "Please select a city!";
                    } else if (requestDTO.getLineOne() == null || requestDTO.getLineOne().isBlank()) {
                        message = "Address line one is required!";
                    } else if (requestDTO.getPostalCode() == null || requestDTO.getPostalCode().isBlank()) {
                        message = "Postal code is required!";
                    } else if (!requestDTO.getPostalCode().matches(Validator.POSTAL_CODE_VALIDATION)) {
                        message = "Enter a valid postal code!";
                    } else if (requestDTO.getMobile() == null || requestDTO.getMobile().isBlank()) {
                        message = "Mobile number is required!";
                    } else if (!requestDTO.getMobile().matches(Validator.MOBILE_VALIDATION)) {
                        message = "Enter a valid mobile number!";
                    } else {
                        City city = hibernateSession.find(City.class, requestDTO.getCity());
                        if(city == null){
                            message = "City not found. Select correct city!";
                        } else {
                            Address existingPrimary = hibernateSession.createQuery(
                                            "FROM Address a WHERE a.user=:user AND a.isPrimary=:primary",
                                            Address.class)
                                    .setParameter("user", dbUser)
                                    .setParameter("primary", true)
                                    .getSingleResultOrNull();

                            if(existingPrimary != null){
                                existingPrimary.setPrimary(false);
                                hibernateSession.merge(existingPrimary);
                            }

                            Address address = new Address();
                            address.setPrimary(true);
                            address.setLineOne(requestDTO.getLineOne());
                            address.setLineTwo(requestDTO.getLineTwo() != null ? requestDTO.getLineTwo() : "");
                            address.setPostalCode(requestDTO.getPostalCode());
                            address.setMobile(requestDTO.getMobile());
                            address.setCity(city);
                            address.setUser(dbUser);
                            hibernateSession.persist(address);

                            Order pendingOrder = orderService.createPendingOrder(dbUser, hibernateSession, shippingFee);
                            PayHereDTO paymentDetails = createPaymentDetails(hibernateSession, pendingOrder, shippingFee);
                            responseObject.add("paymentDetails", AppUtil.GSON.toJsonTree(paymentDetails));
                            status = true;
                            message = "Checkout successful";
                        }
                    }
                }
            }

            if (hibernateSession != null && hibernateSession.getTransaction().isActive()) {
                hibernateSession.getTransaction().commit();
            }

        } catch (Exception e) {
            if (hibernateSession != null && hibernateSession.getTransaction().isActive()) {
                hibernateSession.getTransaction().rollback();
            }
            e.printStackTrace();
            message = "Internal server error: " + e.getMessage();
            status = false;
        } finally {
            if (hibernateSession != null && hibernateSession.isOpen()) {
                hibernateSession.close();
            }
        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }

    private PayHereDTO createPaymentDetails(Session hibernateSession, Order o, double shippingFee) {
        String orderId = "000" + o.getId();
//        String returnURL = Env.get("app.public.url") + "/api/payments/return";
//        String cancelURL = Env.get("app.public.url") + "/api/payments/cancel";
//        String notifyURL = Env.get("app.public.url") + "/api/payments/notify";


        String baseUrl = Env.get("app.public.url");
        String returnURL = baseUrl + "/api/payments/return";
        String cancelURL = baseUrl + "/api/payments/cancel";
        String notifyURL = baseUrl + "/api/payments/notify";

        Order order = hibernateSession.find(lk.karu.openbay.entity.Order.class, o.getId());
        User user = hibernateSession.find(User.class, order.getUser().getId());
        Address address = hibernateSession.createQuery("FROM Address a WHERE a.user=:user AND a.isPrimary=:primary", Address.class)
                .setParameter("user", user)
                .setParameter("primary", true)
                .getSingleResult();

        StringBuilder userAddress = new StringBuilder(address.getLineOne());
        if (!address.getLineTwo().isBlank()) {
            userAddress.append(",").append(address.getLineTwo());
        }

        StringBuilder items = new StringBuilder();
        double amount = 0;
        List<OrderItem> orderItems = hibernateSession.createQuery("FROM OrderItem oi WHERE oi.order=:order", OrderItem.class)
                .setParameter("order", order)
                .getResultList();



        for (OrderItem orderItem : orderItems) {
            if (items.length() > 0) {
                items.append(", ");
            }
            items.append(orderItem.getVariantSize().getVariant().getProduct().getTitle())
                    .append(" x ")
                    .append(orderItem.getQty());
            amount += (orderItem.getVariantSize().getPrice() * orderItem.getQty()) + shippingFee;


        }

        String amountStr = String.valueOf(Math.round(amount));

        String hashValue = PayHereUtil.generateHash(orderId, amount);
        PayHereDTO payHereDTO = new PayHereDTO();
        payHereDTO.setSandbox(true);
        payHereDTO.setMerchant_id(PayHereUtil.getMerchantId());
        payHereDTO.setReturn_url(returnURL);
        payHereDTO.setCancel_url(cancelURL);
        payHereDTO.setNotify_url(notifyURL);
        payHereDTO.setOrder_id(orderId);
        payHereDTO.setItems(items.toString());
        payHereDTO.setAmount(amountStr);
        payHereDTO.setCurrency(PayHereUtil.APP_CURRENCY);
        payHereDTO.setHash(hashValue);
        payHereDTO.setFirst_name(user.getFname());
        payHereDTO.setLast_name(user.getLname());
        payHereDTO.setEmail(user.getEmail());
        payHereDTO.setPhone(address.getMobile());
        payHereDTO.setAddress(userAddress.toString());
        payHereDTO.setCity(address.getCity().getName());
        payHereDTO.setCountry(PayHereUtil.APP_COUNTRY);
        return payHereDTO;
    }


}