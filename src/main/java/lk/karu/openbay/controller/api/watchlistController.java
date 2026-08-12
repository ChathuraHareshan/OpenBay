package lk.karu.openbay.controller.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lk.karu.openbay.annotation.IsUser;
import lk.karu.openbay.dto.ProductDTO;
import lk.karu.openbay.service.watchlistService;
import lk.karu.openbay.util.AppUtil;

@Path("/watchlist")
public class watchlistController {

    public final watchlistService watchlistService = new watchlistService();

    @IsUser
    @Path("/add-to-watchlist")
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public Response addToWatchlist(String jsonData, @Context HttpServletRequest request){
        ProductDTO productDTO = AppUtil.GSON.fromJson(jsonData, ProductDTO.class);
        String responseJson = watchlistService.addToWatchlist(productDTO, request);
        return Response.ok().entity(responseJson).build();
    }

    @Path("/all-watchlists")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response loadAllCarts(@Context HttpServletRequest request){
        String responseJson = watchlistService.getAllUserwatchlists(request);
        return Response.ok().entity(responseJson).build();
    }

    @DELETE
    @Path("/remove/{watchlistId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response removeCartItem(
            @PathParam("watchlistId") int cartId,
            @Context HttpServletRequest request) {


        String responseJson = watchlistService.removeCartItem(cartId, request);
        return Response.ok(responseJson).build();
    }

}
