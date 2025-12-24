package lk.karu.openbay.controller.api;


import com.google.gson.JsonObject;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lk.karu.openbay.dto.UserDTO;
import lk.karu.openbay.service.UserService;
import lk.karu.openbay.util.AppUtil;

@Path("/user")
public class UserController {

    @Path("/register")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response registerUser(String jsonData) {
        UserDTO userDTO = AppUtil.GSON.fromJson(jsonData, UserDTO.class);
        String responseJson = new UserService().RegisterUser(userDTO);
        return Response.ok().entity(responseJson).build();
    }

    @Path("/resend")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response resendVerificationEmail(String jsonData) {

        JsonObject json = AppUtil.GSON.fromJson(jsonData, JsonObject.class);
        String email = json.get("email").getAsString();

        String responseJson = new UserService().resendVerificationEmail(email);
        return Response.ok(responseJson).build();
    }

    @Path("/verify-account")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response verifyAccount(String jsonData) {
        UserDTO userDTO = AppUtil.GSON.fromJson(jsonData, UserDTO.class);
        String responseJson = new UserService().verifyUserAccount(userDTO);
        return Response.ok().entity(responseJson).build();
    }


    @Path("/login")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response login(String jsonData, @Context HttpServletRequest request) {
        UserDTO userDTO = AppUtil.GSON.fromJson(jsonData, UserDTO.class);
        String responseJson = new UserService().loginUser(userDTO, request);
        return Response.ok().entity(responseJson).build();
    }

}
