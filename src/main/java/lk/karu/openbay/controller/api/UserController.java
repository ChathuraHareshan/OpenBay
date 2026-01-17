package lk.karu.openbay.controller.api;


import com.google.gson.JsonObject;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lk.karu.openbay.annotation.IsUser;
import lk.karu.openbay.dto.UserDTO;
import lk.karu.openbay.service.CartService;
import lk.karu.openbay.service.UserService;
import lk.karu.openbay.util.AppUtil;

@Path("/user")
public class UserController {


    @IsUser
    @Path("/logout")
    @GET
    public Response logout(@Context HttpServletRequest request) {

        HttpSession httpSession = request.getSession(false);
        if (httpSession != null && httpSession.getAttribute("user") != null) {
            httpSession.invalidate();
            return Response.status(Response.Status.OK).build();
        } else {
            System.out.println("else");
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
    }


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
        new CartService().mergeUserCarts(request);
        return Response.ok().entity(responseJson).build();
    }

}
