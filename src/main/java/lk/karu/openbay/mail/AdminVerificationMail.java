package lk.karu.openbay.mail;

import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import lk.karu.openbay.util.Env;

public class AdminVerificationMail extends Mailable {
    private final String to;
    private final String verificationCode;

    public AdminVerificationMail(String to, String verificationCode) {
        this.to = to;
        this.verificationCode = verificationCode;
    }

    @Override
    public void build(Message message) throws MessagingException {
        message.setRecipient(Message.RecipientType.TO, new InternetAddress(to));
        message.setSubject("Admin Login Verification - " + Env.get("app.name"));

        String appName = Env.get("app.name");
        String htmlContent = buildAdminVerificationTemplate(to, verificationCode, appName);

        message.setContent(htmlContent, "text/html; charset=utf-8");
    }

    private String buildAdminVerificationTemplate(String email, String code, String appName) {
        return "<!DOCTYPE html>" +
                "<html lang=\"en\">" +
                "<head>" +
                "    <meta charset=\"UTF-8\">" +
                "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                "    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">" +
                "    <title>Admin Login Verification</title>" +
                "    <style>" +
                "        * { margin: 0; padding: 0; box-sizing: border-box; }" +
                "        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; background-color: #0f172a; margin: 0; padding: 0; }" +
                "        table { border-collapse: collapse; }" +
                "        img { max-width: 100%; height: auto; display: block; }" +
                "        .email-wrapper { width: 100%; background-color: #0f172a; padding: 40px 20px; }" +
                "        .email-container { max-width: 600px; width: 100%; margin: 0 auto; background-color: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4); border: 1px solid #334155; }" +
                "        .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 30px; text-align: center; position: relative; }" +
                "        .header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,%3Csvg width=\"40\" height=\"40\" xmlns=\"http://www.w3.org/2000/svg\"/%3E%3Cpath d=\"M0 0h40v40H0z\" fill=\"none\"/%3E%3Cpath d=\"M20 0L40 20 20 40 0 20z\" fill=\"%23ffffff\" opacity=\"0.05\"/%3E%3C/svg%3E'); opacity: 0.1; }" +
                "        .header-icon { width: 80px; height: 80px; background-color: rgba(255, 255, 255, 0.15); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; position: relative; z-index: 1; backdrop-filter: blur(10px); }" +
                "        .header-icon svg { width: 40px; height: 40px; fill: white; }" +
                "        .header h1 { color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; position: relative; z-index: 1; text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3); }" +
                "        .content { padding: 50px 40px; text-align: center; }" +
                "        .logo-image { width: 140px; max-width: 140px; height: auto; margin: 0 auto 25px; display: block; }" +
                "        .greeting { font-size: 24px; font-weight: 600; color: #f1f5f9; margin-bottom: 20px; text-align: center; }" +
                "        .message { font-size: 16px; color: #cbd5e1; text-align: center; margin-bottom: 30px; line-height: 1.8; }" +
                "        .code-container { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 12px; padding: 35px; margin: 35px 0; text-align: center; border: 2px solid #dc2626; box-shadow: 0 0 30px rgba(220, 38, 38, 0.2), inset 0 0 20px rgba(220, 38, 38, 0.05); position: relative; }" +
                "        .code-container::before { content: ''; position: absolute; top: -2px; left: -2px; right: -2px; bottom: -2px; background: linear-gradient(45deg, #dc2626, #991b1b, #dc2626); border-radius: 12px; z-index: -1; opacity: 0.3; filter: blur(10px); }" +
                "        .code-label { font-size: 14px; color: #ef4444; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; }" +
                "        .code { font-size: 38px; font-weight: 700; color: #ffffff; letter-spacing: 12px; font-family: 'Courier New', monospace; text-shadow: 0 0 20px rgba(239, 68, 68, 0.5); padding: 10px; background: linear-gradient(90deg, transparent, rgba(220, 38, 38, 0.1), transparent); border-radius: 8px; }" +
                "        .security-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(220, 38, 38, 0.1); border: 1px solid rgba(220, 38, 38, 0.3); border-radius: 50px; padding: 8px 20px; margin: 25px 0; }" +
                "        .security-badge svg { width: 16px; height: 16px; fill: #ef4444; }" +
                "        .security-badge span { font-size: 13px; color: #fca5a5; font-weight: 600; }" +
                "        .divider { height: 1px; background: linear-gradient(90deg, transparent, #334155, transparent); margin: 40px 0; }" +
                "        .info-box { background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: left; border-right: 1px solid rgba(251, 191, 36, 0.2); }" +
                "        .info-box p { font-size: 14px; color: #fde68a; margin: 0; line-height: 1.6; }" +
                "        .info-box strong { color: #fbbf24; }" +
                "        .details-grid { display: table; width: 100%; margin: 30px 0; background: rgba(15, 23, 42, 0.5); border-radius: 8px; border: 1px solid #334155; overflow: hidden; }" +
                "        .detail-row { display: table-row; }" +
                "        .detail-label { display: table-cell; padding: 15px 20px; font-size: 14px; color: #94a3b8; font-weight: 600; border-bottom: 1px solid #334155; width: 40%; }" +
                "        .detail-value { display: table-cell; padding: 15px 20px; font-size: 14px; color: #e2e8f0; border-bottom: 1px solid #334155; }" +
                "        .detail-row:last-child .detail-label, .detail-row:last-child .detail-value { border-bottom: none; }" +
                "        .footer { background-color: #0f172a; padding: 40px 30px; text-align: center; border-top: 1px solid #334155; }" +
                "        .footer-content { font-size: 14px; color: #64748b; line-height: 1.8; }" +
                "        .footer-content strong { color: #94a3b8; }" +
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
                "            .code-container { padding: 25px 15px !important; }" +
                "            .code { font-size: 28px !important; letter-spacing: 6px !important; }" +
                "            .footer { padding: 30px 20px !important; }" +
                "            .info-box { padding: 15px !important; }" +
                "            .info-box p { font-size: 13px !important; }" +
                "            .details-grid { font-size: 13px !important; }" +
                "            .detail-label, .detail-value { padding: 12px 15px !important; display: block !important; width: 100% !important; }" +
                "            .detail-label { background: rgba(15, 23, 42, 0.8); font-weight: 700; }" +
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
                "                                    <path d=\"M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z\"/>" +
                "                                </svg>" +
                "                            </div>" +
                "                            <h1>Admin Login Verification</h1>" +
                "                        </td>" +
                "                    </tr>" +
                "                    <!-- Content -->" +
                "                    <tr>" +
                "                        <td class=\"content\">" +
                "                            <img src=\"https://res.cloudinary.com/dqt6oe6cd/image/upload/v1765691885/2_t3d0ne.png\" " +
                "                                 alt=\"" + appName + " Logo\" class=\"logo-image\">" +
                "                            " +
                "                            <div class=\"security-badge\">" +
                "                                <svg viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\">" +
                "                                    <path d=\"M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z\"/>" +
                "                                </svg>" +
                "                                <span>SECURE LOGIN ATTEMPT</span>" +
                "                            </div>" +
                "                            " +
                "                            <div class=\"greeting\">Admin Authentication Required</div>" +
                "                            <p class=\"message\">" +
                "                                A login attempt to the admin panel has been detected from your account. " +
                "                                For security purposes, please use the verification code below to complete your login." +
                "                            </p>" +
                "                            " +
                "                            <div class=\"code-container\">" +
                "                                <div class=\"code-label\">Your Verification Code</div>" +
                "                                <div class=\"code\">" + code + "</div>" +
                "                            </div>" +
                "                            " +
                "                            <div class=\"details-grid\">" +
                "                                <div class=\"detail-row\">" +
                "                                    <div class=\"detail-label\">Account Email:</div>" +
                "                                    <div class=\"detail-value\">" + email + "</div>" +
                "                                </div>" +
                "                                <div class=\"detail-row\">" +
                "                                    <div class=\"detail-label\">Code Validity:</div>" +
                "                                    <div class=\"detail-value\">10 minutes</div>" +
                "                                </div>" +
                "                                <div class=\"detail-row\">" +
                "                                    <div class=\"detail-label\">Access Level:</div>" +
                "                                    <div class=\"detail-value\">Administrator</div>" +
                "                                </div>" +
                "                            </div>" +
                "                            " +
                "                            <div class=\"divider\"></div>" +
                "                            " +
                "                            <div class=\"info-box\">" +
                "                                <p><strong>⚠️ Security Alert:</strong> This verification code will expire in 10 minutes. " +
                "                                If you did not attempt to log in to the admin panel, please secure your account immediately and contact support.</p>" +
                "                            </div>" +
                "                        </td>" +
                "                    </tr>" +
                "                    <!-- Footer -->" +
                "                    <tr>" +
                "                        <td class=\"footer\">" +
                "                            <div class=\"footer-content\">" +
                "                                <p style=\"margin-bottom: 15px;\"><strong>" + appName + " Admin System</strong></p>" +
                "                                <p>This is an automated security email. Please do not reply to this message.</p>" +
                "                                <p style=\"margin-top: 20px;\">© 2024 " + appName + ". All Rights Reserved.</p>" +
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