package lk.karu.openbay.controller.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lk.karu.openbay.annotation.IsUser;
import lk.karu.openbay.service.checkoutService;

@Path("/checkouts")
public class CheckoutController {
    private final checkoutService checkoutService = new checkoutService();


    @IsUser
    @Path("/user-checkout-data")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response loadUserCheckoutData(@Context HttpServletRequest request) {
        String responseJson = checkoutService.getCheckoutUerData(request);
        return Response.ok().entity(responseJson).build();
    }
}