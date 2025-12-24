package lk.karu.openbay.service;

import com.google.gson.JsonObject;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.ws.rs.core.Context;
import lk.karu.openbay.dto.UserDTO;
import lk.karu.openbay.entity.Address;
import lk.karu.openbay.entity.City;
import lk.karu.openbay.entity.User;
import lk.karu.openbay.util.AppUtil;
import lk.karu.openbay.util.HibernateUtil;
import lk.karu.openbay.validation.Validator;
import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.hibernate.Transaction;

import javax.management.Query;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class ProfileService {

    public String updatePassword(UserDTO userDTO, @Context HttpServletRequest request){
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        if(userDTO.getPassword() == null){
            message = "Password is required!";
        }else if(userDTO.getPassword().isBlank()){
            message = "Password can not be empty!";
        }else if(userDTO.getNewPassword() == null){
            message = "New password is required!";
        }else if(userDTO.getNewPassword().isBlank()){
            message = "New password can not be empty!";
        }else if(userDTO.getConfirmPassword() == null){
            message = "Confirm password is required!";
        }else if(userDTO.getConfirmPassword().isBlank()){
            message = "Confirm password can not be empty!";
        }else if (userDTO.getPassword().equals(userDTO.getNewPassword())) {
            message = "New password must be different from current password!";
        }
        else if(!userDTO.getNewPassword().equals(userDTO.getConfirmPassword())){
            message = "New password and confirm password do not match!";
        }else if(!userDTO.getPassword().matches(Validator.PASSWORD_VALIDATION)){
            message = "Please provide valid password";
        }else if(!userDTO.getNewPassword().matches(Validator.PASSWORD_VALIDATION)){
            message = "Please provide valid  New password";
        }else if(!userDTO.getConfirmPassword().matches(Validator.PASSWORD_VALIDATION)){
            message = "Please provide valid confirm password";
        }else {

            HttpSession httpSession = request.getSession(false);

            if (httpSession == null) {
                message = "Please login first";
            } else if (httpSession.getAttribute("user") == null) {
                message = "Please login first";
            } else {


                User sessionUser = (User) httpSession.getAttribute("user");

                Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
                User dbUser = hibernateSession.createNamedQuery("User.getByEmail", User.class)
                        .setParameter("email", sessionUser.getEmail())
                        .getSingleResult();

                dbUser.setPassword(userDTO.getNewPassword());

                Transaction transaction = hibernateSession.beginTransaction();



                try {
                    hibernateSession.merge(dbUser);
                    transaction.commit();
                    httpSession.setAttribute("user", dbUser);
                    httpSession.invalidate();

                    status = true;
                    message = "Password update successful...";

                } catch (HibernateException e) {
                    transaction.rollback();
                    message = "Password update failed!";
                }
                hibernateSession.close();

            }
        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }

    public String makePrimaryAddress(int addressId, HttpServletRequest request) {

        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        HttpSession httpSession = request.getSession(false);
        if (httpSession == null || httpSession.getAttribute("user") == null) {
            message = "Session expired! Please login.";
        } else {

            User sessionUser = (User) httpSession.getAttribute("user");

            try (Session session = HibernateUtil.getSessionFactory().openSession()) {
                User dbUser = session.createNamedQuery("User.getByEmail", User.class)
                        .setParameter("email", sessionUser.getEmail())
                        .getSingleResult();

                Address address = session.get(Address.class, addressId);

                if (address == null) {
                    message = "Address not found!";
                } else if (!address.getUser().equals(dbUser)) {
                    message = "Unauthorized request!";
                } else if (address.isPrimary()) {
                    message = "This address is already primary!";
                } else {

                    Transaction tx = session.beginTransaction();

                    session.createQuery(
                                    "UPDATE Address a SET a.isPrimary = false WHERE a.user = :user")
                            .setParameter("user", dbUser)
                            .executeUpdate();

                    address.setPrimary(true);
                    session.merge(address);

                    tx.commit();

                    status = true;
                    message = "Primary address updated successfully!";
                }

            } catch (Exception e) {
                message = "Primary address update failed!";
            }
        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }

    public String deleteAddress(int addressId, HttpServletRequest request) {

        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        HttpSession httpSession = request.getSession(false);
        if (httpSession == null || httpSession.getAttribute("user") == null) {
            message = "Session expired! Please login.";
        } else {

            User sessionUser = (User) httpSession.getAttribute("user");

            try (Session session = HibernateUtil.getSessionFactory().openSession()) {

                User dbUser = session.createNamedQuery("User.getByEmail", User.class)
                        .setParameter("email", sessionUser.getEmail())
                        .getSingleResult();

                Address address = session.get(Address.class, addressId);

                if (address == null) {
                    message = "Address not found!";
                } else if (!address.getUser().equals(dbUser)) {
                    message = "Unauthorized delete attempt!";
                }else if(address.isPrimary()){
                    message = "Primary address can not be deleted! First add another primary address.";
                }else {
                    Transaction tx = session.beginTransaction();
                    session.remove(address);
                    tx.commit();

                    status = true;
                    message = "Address deleted successfully!";
                }

            } catch (Exception e) {
                message = "Address deletion failed!";
            }
        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }

    public String addNewAddress(UserDTO userDTO, @Context HttpServletRequest request) {

        JsonObject responseObject = new JsonObject();

        boolean status = false;
        String message = "";

        if (userDTO.getLineOne() == null) {
            message = "Address line One is required!";
        } else if (userDTO.getLineOne().isBlank()) {
            message = "Address line One can not be empty!";
        } else if (userDTO.getLineTwo() == null) {
            message = "Address line Two is required!";
        } else if (userDTO.getLineTwo().isBlank()) {
            message = "Address line Two can not be empty!";
        } else if (userDTO.getCityId() == null || userDTO.getCityId() == 0) {
            message = "City is required!";
        } else if (userDTO.getPostalCode() == null) {
            message = "Postal code is required!";
        } else if (userDTO.getPostalCode().isBlank()) {
            message = "Postal code can not be empty!";
        } else if (userDTO.getMobile() == null) {
            message = "Mobile number is required!";
        } else if (userDTO.getMobile().isBlank()) {
            message = "Mobile number can not be empty!";
        } else {

            HttpSession httpSession = request.getSession(false);
            if (httpSession == null) {
                message = "Session expired! Please logged in";
            } else if (httpSession.getAttribute("user") == null) {
                message = "Session expired! Please logged in";
            } else {

                User sessionUser = (User) httpSession.getAttribute("user");
                Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
                User dbuser = hibernateSession.createNamedQuery("User.getByEmail", User.class)
                        .setParameter("email", sessionUser.getEmail())
                        .getSingleResult();


                City city = hibernateSession.get(City.class, userDTO.getCityId());
                if (city == null) {
                    message = "Invalid city selected!";
                } else if (dbuser == null) {
                    message = "User not found!";
                } else {

                    Long count = hibernateSession.createQuery(
                                    "SELECT COUNT(a) FROM Address a WHERE a.user = :user " +
                                            "AND a.lineOne = :lineOne " +
                                            "AND a.lineTwo = :lineTwo " +
                                            "AND a.city = :city " +
                                            "AND a.mobile = :mobile " +
                                            "AND a.postalCode = :postalCode",
                                    Long.class)
                            .setParameter("user", dbuser)
                            .setParameter("lineOne", userDTO.getLineOne())
                            .setParameter("lineTwo", userDTO.getLineTwo())
                            .setParameter("city", city)
                            .setParameter("mobile", userDTO.getMobile())
                            .setParameter("postalCode", userDTO.getPostalCode())
                            .getSingleResult();


                    if (count > 0) {
                        message = "This address already exists!";
                    } else {
                        Address address = new Address();
                        address.setLineOne(userDTO.getLineOne());
                        address.setLineTwo(userDTO.getLineTwo());
                        address.setCity(city);
                        address.setMobile(userDTO.getMobile());
                        address.setUser(dbuser);
                        address.setPostalCode(userDTO.getPostalCode());
                        address.setPrimary(false);

                        Transaction transaction = hibernateSession.beginTransaction();

                        try {
                            hibernateSession.persist(address);
                            transaction.commit();
                            status = true;
                            message = "Address details Added successful...";


                        } catch (HibernateException e) {

                            transaction.rollback();
                            message = "Address details added failed!";

                        }
                    }


                    hibernateSession.close();

                }

            }

        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }

    public String updateAddress(UserDTO userDTO, @Context HttpServletRequest request) {
        JsonObject responseObject = new JsonObject();

        boolean status = false;
        String message = "";

        System.out.println("CityId received: " + userDTO.getCityId());


        if (userDTO.getLineOne() == null) {
            message = "Address line One is required!";
        } else if (userDTO.getLineOne().isBlank()) {
            message = "Address line One can not be empty!";
        } else if (userDTO.getLineTwo() == null) {
            message = "Address line Two is required!";
        } else if (userDTO.getLineTwo().isBlank()) {
            message = "Address line Two can not be empty!";
        } else if (userDTO.getCityId() == null || userDTO.getCityId() == 0) {
            message = "City is required!";
        } else if (userDTO.getPostalCode() == null) {
            message = "Postal code is required!";
        } else if (userDTO.getPostalCode().isBlank()) {
            message = "Postal code can not be empty!";
        } else if (userDTO.getMobile() == null) {
            message = "Mobile number is required!";
        } else if (userDTO.getMobile().isBlank()) {
            message = "Mobile number can not be empty!";
        } else {

            HttpSession httpSession = request.getSession(false);
            if (httpSession == null) {
                message = "Please login first";
            } else if (httpSession.getAttribute("user") == null) {
                message = "Please login first";
            } else {
                User sessionUser = (User) httpSession.getAttribute("user");
                Session hibernateSession = HibernateUtil.getSessionFactory().openSession();


                Transaction transaction = hibernateSession.beginTransaction();

                try {

                    Address address = hibernateSession.get(Address.class, userDTO.getAddressId());

                    if (address == null) {
                        message = "Address not found!";
                    } else {

                        City city = hibernateSession.get(City.class, userDTO.getCityId());
                        if (city == null) {
                            message = "Invalid city selected!";
                        } else {

                            address.setLineOne(userDTO.getLineOne());
                            address.setLineTwo(userDTO.getLineTwo());
                            address.setCity(city);
                            address.setPostalCode(userDTO.getPostalCode());
                            address.setMobile(userDTO.getMobile());

                            hibernateSession.merge(address);
                            transaction.commit();

                            status = true;
                            message = "Address updated successfully!";
                        }
                    }

                } catch (Exception e) {
                    transaction.rollback();
                    message = "Address update failed!";
//                    e.printStackTrace();
                }


                hibernateSession.close();
            }

        }
        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);

    }

    public String updateProfile(UserDTO userDTO, @Context HttpServletRequest request) {

        JsonObject responseObject = new JsonObject();

        boolean status = false;
        String message = "";

        if (userDTO.getFname() == null) {
            message = "First name is required!";
        } else if (userDTO.getFname().isBlank()) {
            message = "First name can not be empty!";
        } else if (userDTO.getLname() == null) {
            message = "Last name is required!";
        } else if (userDTO.getLname().isBlank()) {
            message = "Last name can not be empty!";
        } else {
            HttpSession httpSession = request.getSession(false);
            if (httpSession == null) {
                message = "Please login first";
            } else if (httpSession.getAttribute("user") == null) {
                message = "Please login first";
            } else {
                User sessionUser = (User) httpSession.getAttribute("user");
                Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
                User dbUser = hibernateSession.createNamedQuery("User.getByEmail", User.class)
                        .setParameter("email", sessionUser.getEmail())
                        .getSingleResult();

                dbUser.setFname(userDTO.getFname());
                dbUser.setLname(userDTO.getLname());

                Transaction transaction = hibernateSession.beginTransaction();

                try {
                    hibernateSession.merge(dbUser);
                    transaction.commit();
                    httpSession.setAttribute("user", dbUser);
                    status = true;
                    message = "Profile details update successful...";
                } catch (HibernateException e) {
                    transaction.rollback();
                    message = "Profile details update failed!";
                }

                hibernateSession.close();
            }
        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }

    public String userProfile(@Context HttpServletRequest request) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        HttpSession httpSession = request.getSession(false);
        User user = (User) httpSession.getAttribute("user");

        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setFname(user.getFname());
        userDTO.setLname(user.getLname());
        userDTO.setPassword(user.getPassword());

        Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
        List<Address> addressList = hibernateSession.createQuery("FROM Address a WHERE a.user=:user", Address.class)
                .setParameter("user", user).getResultList();


        Address primaryAddress = null;
        for (Address address : addressList) {
            if (address.isPrimary()) {
                primaryAddress = address;
                break;
            }
        }
        if (primaryAddress != null) {
            userDTO.setLineOne(primaryAddress.getLineOne());
            userDTO.setLineTwo(primaryAddress.getLineTwo());
            userDTO.setPostalCode(primaryAddress.getPostalCode());
            userDTO.setMobile(primaryAddress.getMobile());
            userDTO.setPrimary(primaryAddress.isPrimary());
            userDTO.setCityId(primaryAddress.getCity().getId());
            userDTO.setCityName(primaryAddress.getCity().getName());
        }

        LocalDateTime createdAt = user.getCreatedAt();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MMMM");
        String sinceAt = createdAt.format(formatter);
        userDTO.setSinceAt(sinceAt);

        responseObject.add("user", AppUtil.GSON.toJsonTree(userDTO));
        hibernateSession.close();
        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }

    public String loadUserAddresses(@Context HttpServletRequest request) {
        JsonObject responseObject = new JsonObject();
        HttpSession httpSession = request.getSession(false);
        if (httpSession != null && httpSession.getAttribute("user") != null) {
            User sessionUser = (User) httpSession.getAttribute("user");

            responseObject.addProperty("name", sessionUser.getFname() + " " + sessionUser.getLname());
            responseObject.addProperty("email", sessionUser.getEmail());

            Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
            List<Address> addressList = hibernateSession.createQuery("FROM Address a WHERE a.user=:user", Address.class)
                    .setParameter("user", sessionUser)
                    .getResultList();

            List<JsonObject> addresses = new ArrayList<>();
            for (Address a : addressList) {
                JsonObject jo = new JsonObject();
                jo.addProperty("addressId", a.getId());
                jo.addProperty("lineOne", a.getLineOne());
                jo.addProperty("lineTwo", a.getLineTwo());
                jo.addProperty("mobile", a.getMobile());
                jo.addProperty("cityId", a.getCity().getId());
                jo.addProperty("cityName", a.getCity().getName());
                jo.addProperty("postalCode", a.getPostalCode());
                jo.addProperty("isPrimary", a.isPrimary());
                addresses.add(jo);
            }

            responseObject.add("addresses", AppUtil.GSON.toJsonTree(addresses));

            hibernateSession.close();
        }
        return AppUtil.GSON.toJson(responseObject);
    }

}
