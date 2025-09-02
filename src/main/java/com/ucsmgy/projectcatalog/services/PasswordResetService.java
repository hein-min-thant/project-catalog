package com.ucsmgy.projectcatalog.services;

import com.ucsmgy.projectcatalog.dtos.ForgotPasswordRequest;
import com.ucsmgy.projectcatalog.dtos.ResetPasswordRequest;
import com.ucsmgy.projectcatalog.entities.PasswordResetToken;
import com.ucsmgy.projectcatalog.entities.User;
import com.ucsmgy.projectcatalog.repositories.PasswordResetTokenRepository;
import com.ucsmgy.projectcatalog.repositories.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Optional;
import java.util.Random;

@Service
@AllArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;

    public void requestPasswordReset(ForgotPasswordRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());

        if (userOptional.isEmpty()) {
            // Don't reveal if email exists or not for security reasons
            return;
        }

        User user = userOptional.get();
        if (!user.isActive()) {
            // Don't reveal if user is banned for security reasons
            return;
        }

        // Delete any existing reset tokens for this email
        tokenRepository.findByEmail(request.getEmail()).ifPresent(tokenRepository::delete);

        // Generate 6-digit reset code
        String code = String.format("%06d", new Random().nextInt(1000000));

        // Create new password reset token
        PasswordResetToken token = new PasswordResetToken();
        token.setEmail(request.getEmail());
        token.setResetCode(code);
        tokenRepository.save(token);

        // Send email
        emailService.sendPasswordResetCode(request.getEmail(), code);
    }

    public void resetPassword(ResetPasswordRequest request) {
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByEmailAndResetCode(
                request.getEmail(), request.getCode()
        );

        if (tokenOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid reset code or email.");
        }

        PasswordResetToken token = tokenOpt.get();

        // Check if token has expired
        if (token.getExpiryDate().before(Timestamp.from(Instant.now()))) {
            tokenRepository.delete(token);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset code has expired. Please request a new one.");
        }

        // Verify user still exists and is active
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isEmpty()) {
            tokenRepository.delete(token);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found.");
        }

        User user = userOptional.get();
        if (!user.isActive()) {
            tokenRepository.delete(token);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Account is not active.");
        }

        // Update password
        String hashedPassword = passwordEncoder.encode(request.getNewPassword());
        user.setPasswordHash(hashedPassword);
        userRepository.save(user);

        // Delete the used token
        tokenRepository.delete(token);
    }
}
