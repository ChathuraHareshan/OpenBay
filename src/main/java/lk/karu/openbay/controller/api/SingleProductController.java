package lk.karu.openbay.controller.api;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lk.karu.openbay.service.SingleProductService;

@Path("/single-products")
public class SingleProductController {

    private final SingleProductService singleProductService = new SingleProductService();

    @Path("/product")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response loadSingleProduct(@QueryParam("Id") String producId){
        String responseJson = singleProductService.getSingleProduct(producId);
        return Response.ok().entity(responseJson).build();
    }



}
