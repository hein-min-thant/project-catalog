package com.ucsmgy.projectcatalog.services;

import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.springframework.stereotype.Service;

import java.util.Properties;
import java.util.Arrays;
import java.io.UnsupportedEncodingException;

@Service
public class EmailService {

    private static final String SMTP_HOST = "smtp.gmail.com";
    private static final String SMTP_PORT = "587";
    private static final String SENDER_EMAIL = "heinminthant4646@gmail.com";
    private static final String SENDER_NAME = "Project Catalog";
    private static final char[] SENDER_PASSWORD_CHARS = "dehwtfoaxrqyyawe".toCharArray();

    public void sendVerificationCode(String to, String code) {
        Properties properties = new Properties();
        properties.put("mail.smtp.auth", "true");
        properties.put("mail.smtp.starttls.enable", "true"); // Use TLS for security
        properties.put("mail.smtp.host", SMTP_HOST);
        properties.put("mail.smtp.port", SMTP_PORT);

        Session session = Session.getInstance(properties, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(SENDER_EMAIL, new String(SENDER_PASSWORD_CHARS));
            }
        });

        try {
            MimeMessage message = new MimeMessage(session);
            message.setFrom(new InternetAddress(SENDER_EMAIL, SENDER_NAME));
            message.setRecipient(Message.RecipientType.TO, new InternetAddress(to));
            message.setSubject("Your Verification Code");
            String htmlContent = "<html>"
                    + "<body style=\"font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;\">"
                    + "<div style=\"background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center;\">"
                    + "<h1 style=\"color: #333333;\">Email Verification</h1>"
                    + "<p style=\"color: #666666;\">Hello,</p>"
                    + "<p style=\"color: #666666;\">Thank you for registering. Please use the following code to verify your account:</p>"
                    + "<div style=\"background-color: #007bff; color: #ffffff; padding: 10px; border-radius: 5px; font-size: 24px; font-weight: bold; margin: 20px auto; display: inline-block;\">"
                    + code
                    + "</div>"
                    + "<p style=\"color: #666666;\">The code is valid for 10 minutes. Please do not share it with anyone.</p>"
                    + "</div>"
                    + "</body>"
                    + "</html>";
            message.setContent(htmlContent, "text/html");

            Transport.send(message);

            System.out.println("Verification email sent successfully to: " + to);
        } catch (AuthenticationFailedException e) {
            System.err.println("Authentication failed. Please check your App Password and email address.");
            e.printStackTrace();
        } catch (UnsupportedEncodingException e) {
            System.err.println("Unsupported encoding error. The specified sender name might be invalid.");
            e.printStackTrace();
        } catch (MessagingException e) {
            System.err.println("Failed to send email. Check your SMTP server settings and network connection.");
            e.printStackTrace();
        }
    }
}