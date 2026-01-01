package lk.karu.openbay.controller.api;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lk.karu.openbay.service.ContentService;

@Path("/data")
public class ContentController {

    @Path("/topProduct")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response loadNewArrivals() {
        String responseJson = new ContentService().loadTopProduct();
        return Response.ok().entity(responseJson).build();
    }

    @Path("/cities")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response loadCities(){
        String loadAllCities = new ContentService().loadAllCities();
        return Response.ok().entity(loadAllCities).build();
    }

    @Path("/category")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response loadCategory(){
        String loadAllCategory = new ContentService().loadAllCategory();
        return Response.ok().entity(loadAllCategory).build();
    }

    @GET
    @Path("/colors")
    @Produces(MediaType.APPLICATION_JSON)
    public Response loadColors() {
        String colorsJson = new ContentService().loadAllColors();
        return Response.ok().entity(colorsJson).build();
    }

    @GET
    @Path("/sizes")
    @Produces(MediaType.APPLICATION_JSON)
    public Response loadSizes() {
        String sizesJson = new ContentService().loadAllSizes();
        return Response.ok().entity(sizesJson).build();
    }




}
