package lk.karu.openbay.service;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import lk.karu.openbay.entity.Order;
import lk.karu.openbay.entity.OrderItem;
import lk.karu.openbay.entity.Status;
import lk.karu.openbay.entity.User;
import lk.karu.openbay.util.AppUtil;
import lk.karu.openbay.util.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.hibernate.query.Query;
import java.util.List;

public class OrderManagementService {

    public String getAllOrders() {
        JsonObject response = new JsonObject();
        JsonArray ordersArray = new JsonArray();

        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            String hql = "SELECT o FROM Order o " +
                    "LEFT JOIN FETCH o.user u " +
                    "LEFT JOIN FETCH o.status s " +
                    "ORDER BY o.createdAt DESC";

            Query<Order> query = session.createQuery(hql, Order.class);
            List<Order> orders = query.getResultList();

            for (Order order : orders) {
                JsonObject orderJson = new JsonObject();
                orderJson.addProperty("id", order.getId());
                orderJson.addProperty("orderId", "ORD-" + String.format("%06d", order.getId()));


                User user = order.getUser();
                if (user != null) {
                    orderJson.addProperty("customerName", user.getFname() + " " + user.getLname());
                    orderJson.addProperty("customerEmail", user.getEmail());
                    orderJson.addProperty("customerId", user.getId());
                } else {
                    orderJson.addProperty("customerName", "Guest User");
                    orderJson.addProperty("customerEmail", "N/A");
                    orderJson.addProperty("customerId", 0);
                }


                Status status = order.getStatus();
                orderJson.addProperty("status", status != null ? status.getValue() : "PENDING");

                orderJson.addProperty("shippingFee", order.getShippingFee());

                List<OrderItem> items = order.getOrderItems();
                int itemCount = items != null ? items.size() : 0;
                orderJson.addProperty("itemCount", itemCount);

                double total = order.getShippingFee();
                if (items != null) {
                    for (OrderItem item : items) {
                        if (item.getVariantSize() != null) {
                            total += item.getVariantSize().getPrice() * item.getQty();
                        }
                    }
                }
                orderJson.addProperty("totalAmount", Math.round(total * 100.0) / 100.0);

                if (order.getCreatedAt() != null) {
                    orderJson.addProperty("createdAt", order.getFormattedCreatedAt());
                } else {
                    orderJson.addProperty("createdAt", "N/A");
                }

                ordersArray.add(orderJson);
            }

            response.addProperty("status", true);
            response.add("data", ordersArray);
            response.addProperty("total", ordersArray.size());

        } catch (Exception e) {
            response.addProperty("status", false);
            response.addProperty("message", "Error fetching orders: " + e.getMessage());
            e.printStackTrace();
        }

        return AppUtil.GSON.toJson(response);
    }


    public String getOrderDetails(int orderId) {
        JsonObject response = new JsonObject();

        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            String hql = "SELECT DISTINCT o FROM Order o " +
                    "LEFT JOIN FETCH o.user u " +
                    "LEFT JOIN FETCH o.status s " +
                    "LEFT JOIN FETCH o.orderItems oi " +
                    "LEFT JOIN FETCH oi.variantSize vs " +
                    "LEFT JOIN FETCH vs.variant v " +
                    "LEFT JOIN FETCH v.product p " +
                    "WHERE o.id = :id";

            Query<Order> query = session.createQuery(hql, Order.class);
            query.setParameter("id", orderId);
            Order order = query.uniqueResult();

            if (order == null) {
                response.addProperty("status", false);
                response.addProperty("message", "Order not found with ID: " + orderId);
                return AppUtil.GSON.toJson(response);
            }

            JsonObject data = new JsonObject();
            data.addProperty("id", order.getId());
            data.addProperty("orderId", "ORD-" + String.format("%06d", order.getId()));

            User user = order.getUser();
            if (user != null) {
                data.addProperty("customerName", user.getFname() + " " + user.getLname());
                data.addProperty("customerEmail", user.getEmail());
            } else {
                data.addProperty("customerName", "Guest User");
                data.addProperty("customerEmail", "N/A");
            }

            Status status = order.getStatus();
            data.addProperty("status", status != null ? status.getValue() : "PENDING");

            data.addProperty("shippingFee", order.getShippingFee());

            JsonArray itemsArray = new JsonArray();
            double subtotal = 0;

            if (order.getOrderItems() != null) {
                for (OrderItem item : order.getOrderItems()) {
                    JsonObject itemJson = new JsonObject();
                    itemJson.addProperty("id", item.getId());
                    itemJson.addProperty("qty", item.getQty());
                    itemJson.addProperty("rating", item.getRating());

                    if (item.getVariantSize() != null) {
                        var vs = item.getVariantSize();
                        itemJson.addProperty("size", vs.getSize());
                        itemJson.addProperty("price", vs.getPrice());
                        itemJson.addProperty("total", vs.getPrice() * item.getQty());

                        if (vs.getVariant() != null) {
                            var variant = vs.getVariant();
                            itemJson.addProperty("colorName", variant.getColorName());
                            itemJson.addProperty("colorHex", variant.getColorHex());

                            if (variant.getProduct() != null) {
                                itemJson.addProperty("productTitle", variant.getProduct().getTitle());
                            }
                        }

                        subtotal += vs.getPrice() * item.getQty();
                    }

                    itemsArray.add(itemJson);
                }
            }

            data.add("items", itemsArray);
            data.addProperty("subtotal", Math.round(subtotal * 100.0) / 100.0);
            data.addProperty("shippingFee", order.getShippingFee());
            data.addProperty("total", Math.round((subtotal + order.getShippingFee()) * 100.0) / 100.0);

            if (order.getCreatedAt() != null) {
                data.addProperty("createdAt", order.getFormattedCreatedAt());
            } else {
                data.addProperty("createdAt", "N/A");
            }

            response.addProperty("status", true);
            response.add("data", data);

        } catch (Exception e) {
            response.addProperty("status", false);
            response.addProperty("message", "Error fetching order details: " + e.getMessage());
            e.printStackTrace();
        }

        return AppUtil.GSON.toJson(response);
    }


    public String updateOrderStatus(int orderId, String newStatus) {
        JsonObject response = new JsonObject();

        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Transaction transaction = session.beginTransaction();

            try {
                Order order = session.find(Order.class, orderId);
                if (order == null) {
                    response.addProperty("status", false);
                    response.addProperty("message", "Order not found with ID: " + orderId);
                    return AppUtil.GSON.toJson(response);
                }


                boolean validStatus = false;
                for (Status.Type type : Status.Type.values()) {
                    if (type.name().equalsIgnoreCase(newStatus)) {
                        validStatus = true;
                        break;
                    }
                }

                if (!validStatus) {
                    response.addProperty("status", false);
                    response.addProperty("message", "Invalid status: " + newStatus);
                    return AppUtil.GSON.toJson(response);
                }


                String hql = "FROM Status s WHERE s.value = :value";
                Query<Status> query = session.createQuery(hql, Status.class);
                query.setParameter("value", newStatus.toUpperCase());
                Status status = query.uniqueResult();

                if (status == null) {
                    response.addProperty("status", false);
                    response.addProperty("message", "Status not found: " + newStatus);
                    return AppUtil.GSON.toJson(response);
                }

                order.setStatus(status);
                session.merge(order);
                transaction.commit();

                response.addProperty("status", true);
                response.addProperty("message", "Order status updated successfully!");
                response.addProperty("newStatus", newStatus.toUpperCase());

            } catch (Exception e) {
                transaction.rollback();
                throw e;
            }

        } catch (Exception e) {
            response.addProperty("status", false);
            response.addProperty("message", "Error updating order status: " + e.getMessage());
            e.printStackTrace();
        }

        return AppUtil.GSON.toJson(response);
    }


    public String getOrderStatistics() {
        JsonObject response = new JsonObject();

        try (Session session = HibernateUtil.getSessionFactory().openSession()) {

            Long totalOrders = session.createQuery("SELECT COUNT(o) FROM Order o", Long.class).uniqueResult();

            String hql = "SELECT s.value, COUNT(o) FROM Order o JOIN o.status s GROUP BY s.value";
            Query<Object[]> query = session.createQuery(hql, Object[].class);
            List<Object[]> results = query.getResultList();

            JsonObject stats = new JsonObject();
            stats.addProperty("total", totalOrders != null ? totalOrders : 0);

            JsonObject statusCounts = new JsonObject();
            for (Object[] row : results) {
                String status = (String) row[0];
                Long count = (Long) row[1];
                statusCounts.addProperty(status.toLowerCase(), count);
            }
            stats.add("byStatus", statusCounts);

            String revenueHql = "SELECT SUM(oi.variantSize.price * oi.qty) FROM OrderItem oi " +
                    "JOIN oi.order o " +
                    "JOIN o.status s " +
                    "WHERE s.value = 'COMPLETED'";
            Double totalRevenue = session.createQuery(revenueHql, Double.class).uniqueResult();
            stats.addProperty("totalRevenue", totalRevenue != null ? Math.round(totalRevenue * 100.0) / 100.0 : 0.0);

            response.addProperty("status", true);
            response.add("data", stats);

        } catch (Exception e) {
            response.addProperty("status", false);
            response.addProperty("message", "Error getting statistics: " + e.getMessage());
            e.printStackTrace();
        }

        return AppUtil.GSON.toJson(response);
    }


    public String searchOrders(String keyword) {
        JsonObject response = new JsonObject();
        JsonArray ordersArray = new JsonArray();

        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            String hql = "SELECT DISTINCT o FROM Order o " +
                    "LEFT JOIN FETCH o.user u " +
                    "LEFT JOIN FETCH o.status s " +
                    "WHERE LOWER(u.fname) LIKE :keyword " +
                    "OR LOWER(u.lname) LIKE :keyword " +
                    "OR LOWER(u.email) LIKE :keyword " +
                    "OR CAST(o.id AS string) LIKE :keyword " +
                    "ORDER BY o.createdAt DESC";

            Query<Order> query = session.createQuery(hql, Order.class);
            query.setParameter("keyword", "%" + keyword.toLowerCase() + "%");
            List<Order> orders = query.getResultList();

            for (Order order : orders) {
                JsonObject orderJson = new JsonObject();
                orderJson.addProperty("id", order.getId());
                orderJson.addProperty("orderId", "ORD-" + String.format("%06d", order.getId()));

                User user = order.getUser();
                if (user != null) {
                    orderJson.addProperty("customerName", user.getFname() + " " + user.getLname());
                    orderJson.addProperty("customerEmail", user.getEmail());
                } else {
                    orderJson.addProperty("customerName", "Guest User");
                    orderJson.addProperty("customerEmail", "N/A");
                }

                Status status = order.getStatus();
                orderJson.addProperty("status", status != null ? status.getValue() : "PENDING");
                orderJson.addProperty("shippingFee", order.getShippingFee());

                List<OrderItem> items = order.getOrderItems();
                double total = order.getShippingFee();
                if (items != null) {
                    for (OrderItem item : items) {
                        if (item.getVariantSize() != null) {
                            total += item.getVariantSize().getPrice() * item.getQty();
                        }
                    }
                }
                orderJson.addProperty("totalAmount", Math.round(total * 100.0) / 100.0);

                if (order.getCreatedAt() != null) {
                    orderJson.addProperty("createdAt", order.getFormattedCreatedAt());
                } else {
                    orderJson.addProperty("createdAt", "N/A");
                }

                ordersArray.add(orderJson);
            }

            response.addProperty("status", true);
            response.add("data", ordersArray);
            response.addProperty("total", ordersArray.size());

        } catch (Exception e) {
            response.addProperty("status", false);
            response.addProperty("message", "Error searching orders: " + e.getMessage());
            e.printStackTrace();
        }

        return AppUtil.GSON.toJson(response);
    }
}