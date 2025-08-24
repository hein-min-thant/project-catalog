package com.ucsmgy.projectcatalog.services;

import com.ucsmgy.projectcatalog.dtos.RegistrationRequest;
import com.ucsmgy.projectcatalog.dtos.UserDto; // Import UserDto
import com.ucsmgy.projectcatalog.dtos.VerificationRequest;
import com.ucsmgy.projectcatalog.entities.RegistrationToken;
import com.ucsmgy.projectcatalog.entities.User;
import com.ucsmgy.projectcatalog.exceptions.DuplicateUserException;
import com.ucsmgy.projectcatalog.exceptions.InvalidVerificationCodeException;
import com.ucsmgy.projectcatalog.exceptions.VerificationCodeExpiredException;
import com.ucsmgy.projectcatalog.repositories.RegistrationTokenRepository;
import com.ucsmgy.projectcatalog.repositories.UserRepository;
import com.ucsmgy.projectcatalog.mappers.UserMapper;
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
public class RegistrationService {

    private final RegistrationTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final UserMapper userMapper;

    public void requestCode(RegistrationRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateUserException();
        }

        tokenRepository.findByEmail(request.getEmail()).ifPresent(tokenRepository::delete);

        String code = String.format("%06d", new Random().nextInt(1000000));
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        RegistrationToken token = new RegistrationToken();
        token.setName(request.getName());
        token.setEmail(request.getEmail());
        token.setHashedPassword(hashedPassword);
        token.setVerificationCode(code);
        tokenRepository.save(token);

        emailService.sendVerificationCode(request.getEmail(), code);
    }



    public UserDto verifyAndCreate(VerificationRequest request) {
        Optional<RegistrationToken> tokenOpt = tokenRepository.findByEmailAndVerificationCode(
                request.getEmail(), request.getCode()
        );

        if (tokenOpt.isEmpty()) {
            throw new InvalidVerificationCodeException();
        }

        RegistrationToken token = tokenOpt.get();

        if (token.getExpiryDate().before(Timestamp.from(Instant.now()))) {
            tokenRepository.delete(token);
            throw new VerificationCodeExpiredException();
        }

        User newUser = new User();
        newUser.setEmail(token.getEmail());
        newUser.setName(token.getName());
        newUser.setPasswordHash(token.getHashedPassword());
        newUser.setRole("USER");
        User createdUser = userRepository.save(newUser);

        tokenRepository.delete(token);

        return userMapper.toDto(createdUser);
    }
}