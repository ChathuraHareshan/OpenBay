package lk.karu.openbay.controller.api;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lk.karu.openbay.dto.ProductDTO;
import lk.karu.openbay.service.SingleProductService;
import lk.karu.openbay.util.AppUtil;

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


    @Path("/loadSize")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response loadColorHasSize(String jsonData){
        ProductDTO productDTO = AppUtil.GSON.fromJson(jsonData, ProductDTO.class);
        String responseJson = singleProductService.getColorHasSize(productDTO);
        return Response.ok().entity(responseJson).build();
    }

}
