package lk.karu.openbay.controller.api;


import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lk.karu.openbay.dto.AdminDTO;
import lk.karu.openbay.service.adminService;
import lk.karu.openbay.util.AppUtil;

@Path("/admin")
public class adminController {


    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response sendCode(String jsonData) {
        AdminDTO adminDTO = AppUtil.GSON.fromJson(jsonData, AdminDTO.class);
        String responseJson = new adminService().sendVCode(adminDTO);
        return Response.ok().entity(responseJson).build();
    }

    @Path("/verify")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response verifyCode(String jsonData, @Context HttpServletRequest request) {
        AdminDTO adminDTO = AppUtil.GSON.fromJson(jsonData, AdminDTO.class);
        String responseJson = new adminService().verifyAccount(adminDTO, request);
        return Response.ok().entity(responseJson).build();
    }

}
