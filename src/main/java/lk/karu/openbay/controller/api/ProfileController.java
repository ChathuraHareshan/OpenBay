package lk.karu.openbay.controller.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lk.karu.openbay.annotation.IsUser;
import lk.karu.openbay.dto.UserDTO;
import lk.karu.openbay.service.ProfileService;
import lk.karu.openbay.util.AppUtil;

@Path("/profile")
public class ProfileController {

    @IsUser
    @Path("/user-profile")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response loadUserProfile(@Context HttpServletRequest request) {
        String responseJson = new ProfileService().userProfile(request);
        return Response.ok().entity(responseJson).build();
    }

    @IsUser
    @Path("/addresses")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response loadAddresses(@Context HttpServletRequest request) {
        String responseJson = new ProfileService().loadUserAddresses(request);
        return Response.ok().entity(responseJson).build();
    }

    @IsUser
    @Path("/update-profile")
    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateUserProfile(String jsonData, @Context HttpServletRequest request) {
        UserDTO userDTO = AppUtil.GSON.fromJson(jsonData, UserDTO.class);
        String responseJson = new ProfileService().updateProfile(userDTO, request);
        return Response.ok().entity(responseJson).build();
    }

    @IsUser
    @Path("/update-address")
    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateUserAddress(String jsonData, @Context HttpServletRequest request) {
        UserDTO userDTO = AppUtil.GSON.fromJson(jsonData, UserDTO.class);
        String responseJson = new ProfileService().updateAddress(userDTO, request);
        return Response.ok().entity(responseJson).build();
    }

    @IsUser
    @Path("/save-address")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response saveNewAddress(String jsonData, @Context HttpServletRequest request) {
        UserDTO userDTO = AppUtil.GSON.fromJson(jsonData, UserDTO.class);
        String responseJson = new ProfileService().addNewAddress(userDTO, request);
        return Response.ok().entity(responseJson).build();
    }

    @IsUser
    @Path("/delete-address/{addressId}")
    @DELETE
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteAddress(@PathParam("addressId") int addressId, @Context HttpServletRequest request) {
        String responseJson = new ProfileService().deleteAddress(addressId, request);
        return Response.ok().entity(responseJson).build();
    }

    @IsUser
    @Path("/make-primary-address/{addressId}")
    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response makePrimary(@PathParam("addressId") int addressId, @Context HttpServletRequest request) {
        String responseJson = new ProfileService().makePrimaryAddress(addressId, request);
        return Response.ok().entity(responseJson).build();
    }

    @IsUser
    @Path("update-password")
    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updatePassword(String jsonData, @Context HttpServletRequest request) {
        UserDTO userDTO = AppUtil.GSON.fromJson(jsonData, UserDTO.class);
        String responseJson = new ProfileService().updatePassword(userDTO, request);
        return Response.ok().entity(responseJson).build();
    }

}
