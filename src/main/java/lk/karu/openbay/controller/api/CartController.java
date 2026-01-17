package lk.karu.openbay.controller.api;

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


}
