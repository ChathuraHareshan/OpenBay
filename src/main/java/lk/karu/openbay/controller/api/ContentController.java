package lk.karu.openbay.controller.api;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lk.karu.openbay.service.ContentService;

@Path("/data")
public class ContentController {

    @Path("/cities")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response loadCities(){
        String loadAllCities = new ContentService().loadAllCities();
        return Response.ok().entity(loadAllCities).build();
    }

}
