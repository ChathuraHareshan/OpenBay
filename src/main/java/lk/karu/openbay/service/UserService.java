package lk.karu.openbay.service;

import com.google.gson.JsonObject;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.servlet.jsp.tagext.TryCatchFinally;
import jakarta.ws.rs.core.Context;
import lk.karu.openbay.dto.UserDTO;
import lk.karu.openbay.entity.Admin;
import lk.karu.openbay.entity.Status;
import lk.karu.openbay.entity.User;
import lk.karu.openbay.mail.VerificationMail;
import lk.karu.openbay.provider.MailServiceProvider;
import lk.karu.openbay.util.AppUtil;
import lk.karu.openbay.util.HibernateUtil;
import lk.karu.openbay.validation.Validator;
import org.hibernate.Hibernate;
import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.hibernate.Transaction;

public class UserService {


    public String RegisterUser(UserDTO userDTO) {


        JsonObject responseObject = new JsonObject();

        boolean status = false;
        String message = "";

        if (userDTO.getFname() == null) {
            message = "First Name is required";
        } else if (userDTO.getFname().isBlank()) {
            message = "First Name can't be empty";
        } else if (userDTO.getLname() == null) {
            message = "Last Name is required";
        } else if (userDTO.getLname().isBlank()) {
            message = "Last Name can't be empty";
        } else if (userDTO.getEmail() == null) {
            message = "Email is required";
        } else if (userDTO.getEmail().isBlank()) {
            message = "Email can't be empty";
        } else if (!userDTO.getEmail().matches(Validator.EMAIL_VALIDATION)) {
            message = "Please enter a valid email address";
        } else if (userDTO.getPassword() == null) {
            message = "Password is required";
        } else if (userDTO.getPassword().isBlank()) {
            message = "Password can't be empty";
        } else if (!userDTO.getPassword().matches(Validator.PASSWORD_VALIDATION)) {
            message = "Please provide valid password. \n" +
                    "The password must be at least 8 characters long and include at least one uppercase letter," +
                    "One lowercase letter, one digit, and one special character";
        } else {
            Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
            User singleUser = hibernateSession.createNamedQuery("User.getByEmail", User.class)
                    .setParameter("email", userDTO.getEmail())
                    .getSingleResultOrNull();

            if (singleUser != null) { // Already exists
                message = "This email already exists! Please try another email";
            } else {
                User u = new User();
                u.setFname(userDTO.getFname());
                u.setLname(userDTO.getLname());
                u.setEmail(userDTO.getEmail());
                u.setPassword(userDTO.getPassword());

                String verificationCode = AppUtil.generateCode();
                u.setVerificationCode(verificationCode);

                Status pendingStatus = hibernateSession.createNamedQuery("Status.findByValue", Status.class)
                        .setParameter("value", String.valueOf(Status.Type.PENDING)).getSingleResult();

                u.setStatus(pendingStatus);

                Transaction transaction = hibernateSession.beginTransaction();

                try {

                    hibernateSession.persist(u);
                    transaction.commit();

                    VerificationMail verificationMail = new VerificationMail(u.getEmail(), verificationCode);
                    MailServiceProvider.getInstance().sendMail(verificationMail);

                    status = true;

                    responseObject.addProperty("uId", u.getId());

                    responseObject.addProperty("status", true);
                    message = "Account crated Successfully.";

                } catch (HibernateException e) {
                    transaction.rollback();
                    message = "Account creation failed. Please try again";
                }


            }

            hibernateSession.close();
        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);


    }

    public String resendVerificationEmail(String email) {

        JsonObject response = new JsonObject();
        boolean status = false;
        String message = "";

        if (email == null || email.isBlank()) {
            message = "Email is required";
        } else if (!email.matches(Validator.EMAIL_VALIDATION)) {
            message = "Invalid email address";
        } else {

            Session session = HibernateUtil.getSessionFactory().openSession();

            User user = session.createNamedQuery("User.getByEmail", User.class)
                    .setParameter("email", email)
                    .getSingleResultOrNull();

            if (user == null) {
                message = "User not found";
            } else if (user.getStatus().getValue().equals(Status.Type.ACTIVE.name())) {
                message = "Account already verified";
            } else {

                Transaction tx = session.beginTransaction();

                try {
                    String newCode = AppUtil.generateCode();
                    user.setVerificationCode(newCode);

                    session.merge(user);
                    tx.commit();

                    VerificationMail mail =
                            new VerificationMail(user.getEmail(), newCode);
                    MailServiceProvider.getInstance().sendMail(mail);

                    status = true;
                    message = "Verification email sent again";

                } catch (Exception e) {
                    tx.rollback();
                    message = "Failed to resend verification email";
                }
            }
            session.close();
        }

        response.addProperty("status", status);
        response.addProperty("message", message);
        return AppUtil.GSON.toJson(response);
    }

    public String verifyUserAccount(UserDTO userDTO) {

        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        if (userDTO.getEmail() == null) {
            message = "Email is required";
        } else if (userDTO.getEmail().isBlank()) {
            message = "Email address cannot be empty";
        } else if (!userDTO.getEmail().matches(Validator.EMAIL_VALIDATION)) {
            message = "Email address is not valid";
        } else if (userDTO.getVerificationCode() == null) {
            message = "Verification code is required";
        } else if (userDTO.getVerificationCode().isBlank()) {
            message = "Verification code cannot be empty";
        } else if (!userDTO.getVerificationCode().matches(Validator.VERIFICATION_CODE_VALIDATION)) {
            message = "Please provide valid verification code!. Verification code must have 6 digits";
        } else {
            Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
            User user = hibernateSession.createQuery("FROM User u WHERE u.email=:email", User.class)
                    .setParameter("email", userDTO.getEmail())
                    .uniqueResult();

            if (user == null) {
                message = "Account not found. Please register first!";
            } else {
                Status verifiedStatus = hibernateSession.createNamedQuery("Status.findByValue", Status.class)
                        .setParameter("value", String.valueOf(Status.Type.VERIFIED))
                        .getSingleResult();

                if (user.getStatus().equals(verifiedStatus)) {
                    message = "Account already verified!";
                } else {
                    user.setStatus(verifiedStatus);
                    user.setVerificationCode("");
                    Transaction transaction = hibernateSession.beginTransaction();

                    try {
                        hibernateSession.merge(user);
                        transaction.commit();
                        status = true;
                        message = "Account verification Successful";
                    } catch (HibernateException e) {
                        transaction.rollback();
                        message = "Something went wrong. Verification process failed!";
                    }
                }


            }

            hibernateSession.close();
        }


        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);

    }

    public String loginUser(UserDTO userDTO, @Context HttpServletRequest request) {

        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";


        if (userDTO.getEmail() == null) {
            message = "Email is required";
        } else if (userDTO.getEmail().isBlank()) {
            message = "Email address cannot be empty";
        } else if (!userDTO.getEmail().matches(Validator.EMAIL_VALIDATION)) {
            message = "Email address is not valid";
        } else if (userDTO.getPassword() == null) {
            message = "Password is required";
        } else if (userDTO.getPassword().isBlank()) {
            message = "Password address cannot be empty";
        } else if (!userDTO.getPassword().matches(Validator.PASSWORD_VALIDATION)) {
            message = "Please provide valid password. \n" +
                    "The password must be at least 8 characters long and include at least one uppercase letter," +
                    "One lowercase letter, one digit, and one special character";
        } else {
            Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
            User singleUser = hibernateSession.createNamedQuery("User.getByEmail", User.class)
                    .setParameter("email", userDTO.getEmail())
                    .getSingleResultOrNull();

            if (singleUser == null) {
                message = "Account not found. Please register first!";
            } else {
                if (!singleUser.getPassword().equals(userDTO.getPassword())) {
                    message = "Something went wrong. Pleae Check your login credentials";
                } else {
                    Status verificationStatus = hibernateSession.createNamedQuery("Status.findByValue", Status.class)
                            .setParameter("value", String.valueOf(Status.Type.VERIFIED))
                            .getSingleResult();

                    if (!singleUser.getStatus().equals(verificationStatus)) {
                        message = "Your account is not verified. Please verify first!";
                    } else {
                        HttpSession httpSession = request.getSession();
                        httpSession.setAttribute("user", singleUser);


                        status = true;
                        message = "Login Successful";
                    }
                }
            }

            hibernateSession.close();
        }


        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);

    }

}
