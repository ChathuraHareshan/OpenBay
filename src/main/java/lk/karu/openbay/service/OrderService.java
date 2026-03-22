package lk.karu.openbay.service;

import com.google.gson.JsonObject;
import lk.karu.openbay.dto.PayHereDTO;
import lk.karu.openbay.entity.*;
import lk.karu.openbay.util.AppUtil;
import lk.karu.openbay.util.Env;
import lk.karu.openbay.util.HibernateUtil;
import lk.karu.openbay.validation.Validator;
import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.hibernate.Transaction;

import java.util.List;

public class OrderService {
    public Order createPendingOrder(User user, Session hibernateSession, double shippingFee) {
        try {
            Status pendingStatus = hibernateSession.createNamedQuery("Status.findByValue", Status.class)
                    .setParameter("value", String.valueOf(Status.Type.PENDING))
                    .getSingleResult();
            Order order = new Order();
            order.setUser(user);
            order.setShippingFee(shippingFee);
            order.setStatus(pendingStatus);

            hibernateSession.persist(order);

            List<Cart> cartList = hibernateSession.createQuery("FROM Cart c WHERE c.user=:user", Cart.class)
                    .setParameter("user", user)
                    .getResultList();

            if (cartList.isEmpty()) {
                throw new RuntimeException("Cart is empty!");
            }

            for (Cart cart : cartList) {
                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setQty(cart.getQty());
                orderItem.setRating(AppUtil.DEFAULT_RATING_VALUE);
                orderItem.setVariantSize(cart.getVariantSize());
                hibernateSession.persist(orderItem);
            }



            return order;
        } catch (Exception e) {
            throw new RuntimeException("Failed to create order: " + e.getMessage(), e);
        }
    }

    public void completeOrder(String orderId){

        int oId = Integer.parseInt(orderId.replaceAll(Validator.NON_DIGIT_PATTERN, ""));

        try(Session hibernateSession = HibernateUtil.getSessionFactory().openSession()){

            Transaction transaction = hibernateSession.beginTransaction();

            try{
                Order order = hibernateSession.find(Order.class, oId);
                if(order == null){
                    throw new RuntimeException("Order not found for order ID:" + oId);

                }

                List<OrderItem> orderItems = order.getOrderItems();
                if(orderItems != null && !orderItems.isEmpty()){
                    for (OrderItem orderItem : orderItems){
                        VariantSize variantSize = orderItem.getVariantSize();
                        int updateQty = variantSize.getQuantity() - orderItem.getQty();
                        if(updateQty < 0){
                            throw new RuntimeException("Insufficient stock for product: " + variantSize.getVariant().getProduct().getTitle());
                        }
                        variantSize.setQuantity(updateQty);
                        hibernateSession.merge(variantSize);
                    }
                }

                Status completeStatus = hibernateSession.createNamedQuery("Status.findByValue", Status.class)
                        .setParameter("value", String.valueOf(Status.Type.COMPLETED))
                        .getSingleResult();
                order.setStatus(completeStatus);
                hibernateSession.merge(order);

                List<Cart> cartList = hibernateSession.createQuery("FROM Cart c where c.user=:user", Cart.class)
                        .setParameter("user", order.getUser())
                        .getResultList();

                for(Cart cart : cartList){
                    hibernateSession.remove(cart);
                }
                transaction.commit();
            }catch (HibernateException e){
                transaction.rollback();
                throw new RuntimeException("Failed to complete order: " + e.getMessage(), e);
            }

        }

    }

    public void failedOrder(String orderId) {
        int oId = Integer.parseInt(orderId.replaceAll(Validator.NON_DIGIT_PATTERN, ""));
        try (Session hibernateSession = HibernateUtil.getSessionFactory().openSession()) {
            Transaction transaction = hibernateSession.beginTransaction();
            try {
                Order order = hibernateSession.find(Order.class, oId);
                if (order == null) {
                    throw new RuntimeException("Order not foud for Order Id: " + oId);
                }
                Status rejectedStatus = hibernateSession.createNamedQuery("Status.findByValue", Status.class)
                        .setParameter("value", String.valueOf(Status.Type.REJECTED)).getSingleResult();
                order.setStatus(rejectedStatus);
                hibernateSession.merge(order);
                transaction.commit();
            } catch (HibernateException e) {
                transaction.rollback();
                throw new RuntimeException("Failed to reject order: " + oId);
            }
        }
    }

    public String verifyOrderDetails(String orderId){
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";
        int oId = Integer.parseInt(orderId.replaceAll(Validator.NON_DIGIT_PATTERN,""));
        Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
        Order order = hibernateSession.find(Order.class, oId);
        if(order==null){
            message="Incorrect oder details. Please check credentials!";
        }else{
            if(order.getStatus().getValue().equals(String.valueOf(Status.Type.COMPLETED))){
                status=true;
            }
        }
        hibernateSession.close();
        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }

}
