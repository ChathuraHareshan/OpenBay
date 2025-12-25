package lk.karu.openbay.controller.api;


import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lk.karu.openbay.annotation.IsUser;
import lk.karu.openbay.dto.ProductDTO;
import lk.karu.openbay.service.ProductService;
import lk.karu.openbay.util.AppUtil;

@Path("/product")
public class ProductController {

    @IsUser
    @Path("/add-product")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response addProduct(String jsonData, @Context HttpServletRequest request) {
        ProductDTO productDTO = AppUtil.GSON.fromJson(jsonData,ProductDTO.class);
        String responseJson = new ProductService().addProduct(productDTO, request);
        return Response.ok().entity(responseJson).build();
    }
}


