package lk.karu.openbay.service;

import com.google.gson.JsonObject;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.ws.rs.core.Context;
import lk.karu.openbay.dto.AdminDTO;
import lk.karu.openbay.entity.Admin;
import lk.karu.openbay.mail.AdminVerificationMail;
import lk.karu.openbay.provider.MailServiceProvider;
import lk.karu.openbay.util.AppUtil;
import lk.karu.openbay.util.HibernateUtil;
import lk.karu.openbay.validation.Validator;
import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.hibernate.Transaction;

public class adminService {

    public String sendVCode(AdminDTO adminDTO) {
        JsonObject responseObject = new JsonObject();

        boolean status = false;
        String message;

        if (adminDTO.getEmail() == null) {
            message = "Email is required!";
        } else if (adminDTO.getEmail().isBlank()) {
            message = "Email can not be empty!";
        } else if (!adminDTO.getEmail().matches(Validator.EMAIL_VALIDATION)) {
            message = "Invalid Email!";
        } else {
            Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
            Admin singleAdmin = hibernateSession.createNamedQuery("Admin.getByEmail", Admin.class)
                    .setParameter("email", adminDTO.getEmail())
                    .getSingleResultOrNull();

            if (singleAdmin == null) {
                message = "You are not a Admin. Please ignore this page.";
            } else {


                String verificationCode = AppUtil.generateCode();

                singleAdmin.setVerificationCode(verificationCode);

                Transaction transaction = hibernateSession.beginTransaction();

                try {
                    hibernateSession.persist(singleAdmin);
                    transaction.commit();

                    AdminVerificationMail adminVerificationMail = new AdminVerificationMail(singleAdmin.getEmail(), verificationCode);
                    MailServiceProvider.getInstance().sendMail(adminVerificationMail);

                    status = true;
                    message = "Verification code has been sent to the your email. " +
                            "Please verify before access your admin account!";


                } catch (HibernateException e) {
                    transaction.rollback();
                    message = "Account access failed. Please try again!";
                }


            }
            hibernateSession.close();
        }
        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }

    public String verifyAccount(AdminDTO adminDTO, @Context HttpServletRequest request) {

        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        if (adminDTO.getEmail() == null) {
            message = "Email is required.";
        } else if (adminDTO.getEmail().isBlank()) {
            message = "Email cant be empty";
        } else if (!adminDTO.getEmail().matches(Validator.EMAIL_VALIDATION)) {
            message = "Invalid Email";
        } else if (adminDTO.getVerificationCode() == null) {
            message = "verification code is required.";
        } else if (adminDTO.getVerificationCode().isBlank()) {
            message = "Verification can't be empty";
        } else if (!adminDTO.getVerificationCode().matches(Validator.VERIFICATION_CODE_VALIDATION)) {
            message = "enter valid code";
        } else {
            Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
            Admin admin = hibernateSession.createQuery("FROM Admin a WHERE a.email=:email AND a.verificationCode=:verificationCode", Admin.class)
                    .setParameter("email", adminDTO.getEmail())
                    .setParameter("verificationCode", adminDTO.getVerificationCode())
                    .getSingleResultOrNull();

            if (admin == null) {
                message = "Account not found.";
            } else {

                HttpSession httpSession = request.getSession();
                httpSession.setAttribute("admin", admin);
                admin.setVerificationCode("");
                Transaction transaction = hibernateSession.beginTransaction();

                try {
                    hibernateSession.merge(admin);
                    transaction.commit();
                    status = true;
                    message = "Account Verify Completed";
                } catch (HibernateException e) {
                    transaction.rollback();
                    message = "something went wronmg.";

                }
            }
            hibernateSession.close();
        }
        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);

    }

}
