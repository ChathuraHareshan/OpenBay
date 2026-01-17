package lk.karu.openbay.service;

import com.google.gson.JsonObject;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.ws.rs.core.Context;
import lk.karu.openbay.dto.CartDTO;
import lk.karu.openbay.dto.ProductDTO;
import lk.karu.openbay.entity.*;
import lk.karu.openbay.util.AppUtil;
import lk.karu.openbay.util.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;

import java.util.ArrayList;
import java.util.List;

public class CartService {

    public String getCartCount(HttpSession httpSession) {
        JsonObject responseObject = new JsonObject();

        try {
            User user = (User) httpSession.getAttribute("user");
            int totalCount = 0;

            if (user == null) {
                List<Cart> sessionCart = (List<Cart>) httpSession.getAttribute("sessionCart");
                if (sessionCart != null) {
                    for (Cart cart : sessionCart) {
                        totalCount += cart.getQty();
                    }
                }
            } else {
                // Logged user - database cart
                Session hibernateSession = HibernateUtil.getSessionFactory().openSession();

                Long totalQty = hibernateSession.createQuery(
                                "SELECT SUM(c.qty) FROM Cart c WHERE c.user.id = :userId", Long.class)
                        .setParameter("userId", user.getId())
                        .getSingleResult();

                hibernateSession.close();

                totalCount = (totalQty != null) ? totalQty.intValue() : 0;
            }

            responseObject.addProperty("status", true);
            responseObject.addProperty("count", totalCount);

        } catch (Exception e) {
            responseObject.addProperty("status", false);
            responseObject.addProperty("count", 0);
            responseObject.addProperty("message", e.getMessage());
        }

        return AppUtil.GSON.toJson(responseObject);
    }

    public void mergeUserCarts(HttpServletRequest request){
        HttpSession httpSession = request.getSession();
        User sessionUser = (User) httpSession.getAttribute("user");
        if(sessionUser != null){
            List<Cart> sessionCart = getSessionAttribute(httpSession);
            if(sessionCart != null && !sessionCart.isEmpty()){
                Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
                User dbUser = hibernateSession.find(User.class, sessionUser.getId());
                Transaction transaction = hibernateSession.beginTransaction();
                for(Cart cart : sessionCart){
                    VariantSize variantSize = hibernateSession.find(VariantSize.class, cart.getVariantSize().getId());
                    Cart existingCart = hibernateSession.createQuery("FROM Cart c WHERE c.user=:user AND c.variantSize=:variantSize", Cart.class)
                            .setParameter("user", dbUser)
                            .setParameter("variantSize", variantSize)
                            .getSingleResultOrNull();

                    if(existingCart == null){
                        existingCart = new Cart();
                        existingCart.setQty(cart.getQty());
                        existingCart.setUser(dbUser);
                        existingCart.setVariantSize(variantSize);
                        hibernateSession.persist(existingCart);
                    }else{
                        int newQty = existingCart.getQty() + cart.getQty();
                        if(newQty <= variantSize.getQuantity()){
                            existingCart.setQty(newQty);
                            hibernateSession.merge(existingCart);
                        }
                    }
                }

                transaction.commit();
                hibernateSession.close();
            }
            httpSession.setAttribute("sessionCart", null);
        }
    }

    public String addToCart(ProductDTO productDTO, HttpServletRequest request){

        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        if(productDTO.getProductId() == null){
            message = "Product ID not found!";
        }else if(productDTO.getColorName() == null){
            message = "Please Select color.";
        }else if(productDTO.getSize() == null){
            message = "Please select size.";
        }else if(productDTO.getQty() == 0){
            message = "Invalid quantity value!";
        }else{

            Session hibernateSession = HibernateUtil.getSessionFactory().openSession();



            Product product = hibernateSession.find(Product.class, productDTO.getProductId());

            ProductVariant variant = hibernateSession.createQuery("FROM ProductVariant pv WHERE pv.product=:product AND pv.colorName=:color", ProductVariant.class)
                    .setParameter("color", productDTO.getColorName())
                    .setParameter("product", product)
                    .getSingleResultOrNull();

            VariantSize variantSize = hibernateSession.createQuery("FROM VariantSize vs WHERE vs.variant=:variant AND vs.size=:size", VariantSize.class)
                    .setParameter("size", productDTO.getSize())
                    .setParameter("variant", variant )
                    .getSingleResultOrNull();

            if(product == null){
                message = "Product not found.";
            }else if(variant == null){
                message = "Product Color not found.";
            }else if(variantSize == null){
                message = "Product has size not found.";
            }else{

                HttpSession httpSession = request.getSession();
                User user = (User) httpSession.getAttribute("user");
                List<Cart> sessionCart = getSessionAttribute(httpSession);

                if(user == null){
                    if(sessionCart == null){
                        return guestUserFirstTime(variantSize, productDTO.getQty(), httpSession);

                    }else{
                        return guestUserSecondTime(variantSize, productDTO.getQty(), httpSession);
                    }
                }else{
                    return loggedUserCart(variantSize, productDTO.getQty(), httpSession, hibernateSession);
                }

            }
            hibernateSession.close();

        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }

    private String loggedUserCart(VariantSize variantSize, int requestQty, HttpSession httpSession, Session hibernateSession){
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        User sessionUser = (User) httpSession.getAttribute("user");
        if(sessionUser != null){
            User dbuser = hibernateSession.find(User.class, sessionUser.getId());
            Cart existingCart = hibernateSession.createQuery("FROM Cart c WHERE c.user=:user AND c.variantSize=:variantSize", Cart.class)
                    .setParameter("user", dbuser)
                    .setParameter("variantSize",variantSize)
                    .getSingleResultOrNull();

            Transaction transaction = hibernateSession.beginTransaction();
            if(existingCart == null){
                existingCart = new Cart();
                existingCart.setUser(dbuser);
                existingCart.setVariantSize(variantSize);
                existingCart.setQty(requestQty);
                hibernateSession.persist(existingCart);
                status = true;
                message = "Product add to Cart.";
            }else{
                int newQty = existingCart.getQty() + requestQty;
                if(newQty > variantSize.getQuantity()){
                    message = "Product Quantity exceeded!";
                }else{
                    existingCart.setQty(newQty);
                    hibernateSession.merge(existingCart);
                    status = true;
                    message = "User cart Updated.";
                }
            }
            transaction.commit();
        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }

    private String guestUserFirstTime(VariantSize variantSize, int requestQty, HttpSession httpSession){

        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        if(requestQty > variantSize.getQuantity()){
            message = "Product Quantity exceeded!";
        }else{
            List<Cart> cartList = new ArrayList<>();
            Cart cart = new Cart();
            cart.setId(1);
            cart.setVariantSize(variantSize);
            cart.setQty(requestQty);
            cart.setUser(null);
            cartList.add(cart);
            httpSession.setAttribute("sessionCart", cartList);
            status = true;
            message = "Product add to the cart.";
        }
        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);

    }

    private String  guestUserSecondTime(VariantSize variantSize, int requestQty, HttpSession httpSession){
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        List<Cart> sessionCart = getSessionAttribute(httpSession);
        boolean found = false;
        Cart cart = null;
        for (Cart c : sessionCart){
            if(c.getVariantSize().getId() == variantSize.getId()){
                found = true;
                cart = c;
                break;
            }
        }

        if(found){
            int newQty = cart.getQty() + requestQty;
            if(newQty > variantSize.getQuantity()){
                message = "Product quantity exceeded!";

            }else{
                cart.setQty(newQty);
                status = true;
                message = "User cart updated!";
            }
        }else{
            cart =  new Cart();
            cart.setId(sessionCart.size() + 1);
            cart.setVariantSize(variantSize);
            cart.setQty(requestQty);
            cart.setUser(null);
            sessionCart.add(cart);
            httpSession.setAttribute("sessionCart", sessionCart);
            status = true;
            message = "Product add to the Cart.";
        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }

    @SuppressWarnings("unchecked")
    private <T> T getSessionAttribute(HttpSession httpSession) {
        return (T) httpSession.getAttribute("sessionCart");
    }
}
