package lk.karu.openbay.service;

import com.google.gson.JsonObject;
import jakarta.servlet.http.HttpServletRequest;
import lk.karu.openbay.dto.AddressDTO;
import lk.karu.openbay.dto.CartDTO;
import lk.karu.openbay.entity.*;
import lk.karu.openbay.util.AppUtil;
import lk.karu.openbay.util.HibernateUtil;
import org.hibernate.Session;

import java.util.ArrayList;
import java.util.List;

public class checkoutService {

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

}
