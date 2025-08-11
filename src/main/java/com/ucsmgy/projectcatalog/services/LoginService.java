package com.ucsmgy.projectcatalog.services;

import com.ucsmgy.projectcatalog.dtos.LoginRequest;
import com.ucsmgy.projectcatalog.dtos.RegistrationRequest;
import com.ucsmgy.projectcatalog.dtos.VerificationRequest;
import com.ucsmgy.projectcatalog.entities.RegistrationToken;
import com.ucsmgy.projectcatalog.entities.User;
import com.ucsmgy.projectcatalog.exceptions.DuplicateUserException;
import com.ucsmgy.projectcatalog.repositories.RegistrationTokenRepository;
import com.ucsmgy.projectcatalog.repositories.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Optional;
import java.util.Random;

@Service
@AllArgsConstructor
public class LoginService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RegistrationTokenRepository tokenRepository;
    private final EmailService emailService;

    public void requestCode(LoginRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());

        if (userOptional.isEmpty()) {
            throw new AccessDeniedException("Invalid email or password");
        }
        User user = userOptional.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new AccessDeniedException("Invalid email or password");
        }

        tokenRepository.findByEmail(request.getEmail()).ifPresent(tokenRepository::delete);

        String code = String.format("%06d", new Random().nextInt(1000000));
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        RegistrationToken token = new RegistrationToken();
        token.setName("Temp");
        token.setEmail(request.getEmail());
        token.setHashedPassword(hashedPassword);
        token.setVerificationCode(code);
        tokenRepository.save(token);

        emailService.sendVerificationCode(request.getEmail(), code);
    }

    public User verifyAndGetUser(VerificationRequest request) {
        Optional<RegistrationToken> tokenOpt = tokenRepository.findByEmailAndVerificationCode(
                request.getEmail(), request.getCode()
        );

        if (tokenOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid code or email.");
        }

        RegistrationToken token = tokenOpt.get();

        if (token.getExpiryDate().before(Timestamp.from(Instant.now()))) {
            tokenRepository.delete(token);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification code has expired.");
        }

        tokenRepository.delete(token);


        return userRepository.findByEmail(request.getEmail()).orElseThrow(() -> new AccessDeniedException("User not found"));
    }
}
