package lk.karu.openbay.mail;

import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import lk.karu.openbay.util.Env;

public class VerificationMail extends Mailable {
    private final String to;
    private final String verificationCode;

    public VerificationMail(String to, String verificationCode) {
        this.to = to;
        this.verificationCode = verificationCode;
    }

    @Override
    public void build(Message message) throws MessagingException {
        message.setRecipient(Message.RecipientType.TO, new InternetAddress(to));
        message.setSubject("Email Verification Code - " + Env.get("app.name"));

        String appURL = Env.get("app.url");
        String appName = Env.get("app.name");
        String verifyURL = appURL + "/verify-account.html?email=" + to + "&verificationCode=" + verificationCode;

        String htmlContent = buildModernEmailTemplate(to, verificationCode, verifyURL, appURL, appName);

        message.setContent(htmlContent, "text/html; charset=utf-8");
    }

    private String buildModernEmailTemplate(String email, String code, String verifyURL, String appURL, String appName) {
        return "<!DOCTYPE html>" +
                "<html lang=\"en\">" +
                "<head>" +
                "    <meta charset=\"UTF-8\">" +
                "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                "    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">" +
                "    <title>Email Verification</title>" +
                "    <style>" +
                "        * { margin: 0; padding: 0; box-sizing: border-box; }" +
                "        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; background-color: #f4f7fa; margin: 0; padding: 0; }" +
                "        table { border-collapse: collapse; }" +
                "        img { max-width: 100%; height: auto; display: block; }" +
                "        .email-wrapper { width: 100%; background-color: #f4f7fa; padding: 40px 20px; }" +
                "        .email-container { max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08); }" +
                "        .header { background: linear-gradient(135deg, #1cc0a0 0%, #0d9b82 100%); padding: 40px 30px; text-align: center; }" +
                "        .header-icon { width: 80px; height: 80px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; }" +
                "        .header-icon svg { width: 40px; height: 40px; fill: white; }" +
                "        .header h1 { color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; }" +
                "        .content { padding: 50px 40px; text-align: center; }" +
                "        .logo-image { width: 140px; max-width: 140px; height: auto; margin: 0 auto 25px; display: block; }" +
                "        .greeting { font-size: 24px; font-weight: 600; color: #1a1a1a; margin-bottom: 20px; text-align: center; }" +
                "        .message { font-size: 16px; color: #4a5568; text-align: center; margin-bottom: 30px; line-height: 1.8; }" +
                "        .code-container { background: linear-gradient(135deg, #e6f9f5 0%, #d1f4ed 100%); border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center; border: 2px dashed #1cc0a0; }" +
                "        .code-label { font-size: 14px; color: #1cc0a0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }" +
                "        .code { font-size: 32px; font-weight: 700; color: #1cc0a0; letter-spacing: 8px; font-family: 'Courier New', monospace; }" +
                "        .button-container { text-align: center; margin: 40px 0; }" +
                "        .button { display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #1cc0a0 0%, #0d9b82 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(28, 192, 160, 0.4); }" +
                "        .divider { height: 1px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent); margin: 40px 0; }" +
                "        .info-box { background-color: #fff8e1; border-left: 4px solid #ffc107; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: left; }" +
                "        .info-box p { font-size: 14px; color: #856404; margin: 0; line-height: 1.6; }" +
                "        .link-container { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center; }" +
                "        .link-text { font-size: 13px; color: #64748b; margin-bottom: 10px; }" +
                "        .link { font-size: 13px; color: #1cc0a0; word-break: break-all; text-decoration: none; }" +
                "        .footer { background-color: #1a1a1a; padding: 40px 30px; text-align: center; }" +
                "        .footer-content { font-size: 14px; color: #a0aec0; line-height: 1.8; }" +
                "        .footer-content a { color: #1cc0a0; text-decoration: none; }" +
                "        @media only screen and (max-width: 600px) {" +
                "            .email-wrapper { padding: 20px 10px !important; }" +
                "            .email-container { border-radius: 12px !important; }" +
                "            .content { padding: 30px 20px !important; }" +
                "            .header { padding: 30px 20px !important; }" +
                "            .header h1 { font-size: 22px !important; }" +
                "            .header-icon { width: 60px !important; height: 60px !important; margin-bottom: 15px !important; }" +
                "            .header-icon svg { width: 30px !important; height: 30px !important; }" +
                "            .logo-image { width: 100px !important; max-width: 100px !important; margin-bottom: 20px !important; }" +
                "            .greeting { font-size: 20px !important; }" +
                "            .message { font-size: 15px !important; }" +
                "            .code-container { padding: 20px !important; }" +
                "            .code { font-size: 24px !important; letter-spacing: 4px !important; }" +
                "            .button { padding: 14px 32px !important; font-size: 15px !important; }" +
                "            .button-container { margin: 30px 0 !important; }" +
                "            .footer { padding: 30px 20px !important; }" +
                "            .info-box { padding: 15px !important; }" +
                "            .info-box p { font-size: 13px !important; }" +
                "            .link-container { padding: 15px !important; }" +
                "            .link { font-size: 12px !important; }" +
                "        }" +
                "    </style>" +
                "</head>" +
                "<body>" +
                "    <table role=\"presentation\" class=\"email-wrapper\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">" +
                "        <tr>" +
                "            <td align=\"center\">" +
                "                <table role=\"presentation\" class=\"email-container\" cellpadding=\"0\" cellspacing=\"0\" style=\"width: 100%; max-width: 600px;\">" +
                "                    <!-- Header -->" +
                "                    <tr>" +
                "                        <td class=\"header\">" +
                "                            <div class=\"header-icon\">" +
                "                                <svg viewBox=\"0 0 24 24\" fill=\"white\" xmlns=\"http://www.w3.org/2000/svg\">" +
                "                                    <path d=\"M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z\"/>" +
                "                                </svg>" +
                "                            </div>" +
                "                            <h1>Verify Your Email</h1>" +
                "                        </td>" +
                "                    </tr>" +
                "                    <!-- Content -->" +
                "                    <tr>" +
                "                        <td class=\"content\">" +
                "                            <img src=\"https://res.cloudinary.com/dqt6oe6cd/image/upload/v1765691885/2_t3d0ne.png\" " +
                "                                 alt=\"" + appName + " Logo\" class=\"logo-image\">" +
                "                            <div class=\"greeting\">Welcome to " + appName + "!</div>" +
                "                            <p class=\"message\">" +
                "                                Thank you for registering with us. We're excited to have you on board! " +
                "                                To complete your registration and ensure the security of your account, " +
                "                                please verify your email address." +
                "                            </p>" +
                "                            " +
                "                            <div class=\"code-container\">" +
                "                                <div class=\"code-label\">Your Verification Code</div>" +
                "                                <div class=\"code\">" + code + "</div>" +
                "                            </div>" +
                "                            " +
                "                            <div class=\"button-container\">" +
                "                                <a href=\"" + verifyURL + "\" class=\"button\">Verify Email Address</a>" +
                "                            </div>" +
                "                            " +
                "                            <div class=\"divider\"></div>" +
                "                            " +
                "                            <div class=\"info-box\">" +
                "                                <p><strong>⚠️ Security Notice:</strong> This verification code will expire in 24 hours. " +
                "                                If you didn't create an account with " + appName + ", please ignore this email.</p>" +
                "                            </div>" +
                "                            " +
                "                            <div class=\"link-container\">" +
                "                                <div class=\"link-text\">If the button doesn't work, copy and paste this link into your browser:</div>" +
                "                                <a href=\"" + verifyURL + "\" class=\"link\">" + verifyURL + "</a>" +
                "                            </div>" +
                "                        </td>" +
                "                    </tr>" +
                "                    <!-- Footer -->" +
                "                    <tr>" +
                "                        <td class=\"footer\">" +
                "                            <div class=\"footer-content\">" +
                "                                <p style=\"margin-bottom: 15px;\"><strong>" + appName + "</strong></p>" +
                "                                <p>This is an automated email. Please do not reply to this message.</p>" +
                "                                <p style=\"margin-top: 20px;\">© 2024 " + appName + ". All Rights Reserved.</p>" +
                "                                <p style=\"margin-top: 10px;\">" +
                "                                    <a href=\"" + appURL + "\">Visit Website</a> | " +
                "                                    <a href=\"" + appURL + "/privacy\">Privacy Policy</a> | " +
                "                                    <a href=\"" + appURL + "/support\">Support</a>" +
                "                                </p>" +
                "                            </div>" +
                "                        </td>" +
                "                    </tr>" +
                "                </table>" +
                "            </td>" +
                "        </tr>" +
                "    </table>" +
                "</body>" +
                "</html>";
    }
}