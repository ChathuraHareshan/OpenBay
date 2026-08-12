package lk.karu.openbay.controller.api;

import com.google.gson.JsonObject;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lk.karu.openbay.dto.ProductDTO;
import lk.karu.openbay.service.CartService;
import lk.karu.openbay.util.AppUtil;

@Path("/carts")
public class CartController {
    private final CartService cartService= new CartService();

    @GET
    @Path("/shipping")
    @Produces(MediaType.APPLICATION_JSON)
    public Response loadShippingData(){
        String responseJson = cartService.getShippingData();
        return Response.ok().entity(responseJson).build();
    }

    @DELETE
    @Path("/remove/{cartId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response removeCartItem(
            @PathParam("cartId") int cartId,
            @Context HttpServletRequest request) {


        String responseJson = cartService.removeCartItem(cartId, request);
        return Response.ok(responseJson).build();
    }


    @PUT
    @Path("/update-quantity/{cartId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateQuantity(
            @PathParam("cartId") int cartId,
            String jsonData,
            @Context HttpServletRequest request) {

        JsonObject json = AppUtil.GSON.fromJson(jsonData, JsonObject.class);
        int qty = json.get("qty").getAsInt();

        String responseJson = cartService.updateQuantity(cartId, qty, request);
        return Response.ok(responseJson).build();
    }



    @Path("/add-to-cart")
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public Response addToCart(String jsonData, @Context HttpServletRequest request){
        ProductDTO productDTO = AppUtil.GSON.fromJson(jsonData, ProductDTO.class);
        String responseJson = cartService.addToCart(productDTO, request);
        return Response.ok().entity(responseJson).build();
    }
    @GET
    @Path("/get-count")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getCartCount(@Context HttpServletRequest request) {
        String responseJson = cartService.getCartCount(request.getSession());
        return Response.ok().entity(responseJson).build();
    }

    @Path("/all-carts")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response loadAllCarts(@Context HttpServletRequest request){
        String responseJson = cartService.getAllUserCarts(request);
        return Response.ok().entity(responseJson).build();
    }


}
