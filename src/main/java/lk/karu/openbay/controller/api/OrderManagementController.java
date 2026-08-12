package lk.karu.openbay.controller.api;

import com.google.gson.JsonObject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lk.karu.openbay.service.OrderManagementService;
import lk.karu.openbay.util.AppUtil;

@Path("/admin/orders")
public class OrderManagementController {

    private final OrderManagementService orderManagementService = new OrderManagementService();

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllOrders() {
        String response = orderManagementService.getAllOrders();
        return Response.ok(response).build();
    }

    @GET
    @Path("/{orderId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getOrderDetails(@PathParam("orderId") int orderId) {
        String response = orderManagementService.getOrderDetails(orderId);
        return Response.ok(response).build();
    }

    @PUT
    @Path("/{orderId}/status")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateOrderStatus(@PathParam("orderId") int orderId, String requestBody) {
        JsonObject json = AppUtil.GSON.fromJson(requestBody, JsonObject.class);
        String newStatus = json.get("status").getAsString();
        String response = orderManagementService.updateOrderStatus(orderId, newStatus);
        return Response.ok(response).build();
    }

    @GET
    @Path("/statistics")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getOrderStatistics() {
        String response = orderManagementService.getOrderStatistics();
        return Response.ok(response).build();
    }

    @GET
    @Path("/search")
    @Produces(MediaType.APPLICATION_JSON)
    public Response searchOrders(@QueryParam("keyword") String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllOrders();
        }
        String response = orderManagementService.searchOrders(keyword.trim());
        return Response.ok(response).build();
    }
}