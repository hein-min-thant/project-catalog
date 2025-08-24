package com.ucsmgy.projectcatalog.controllers;

import com.ucsmgy.projectcatalog.exceptions.DuplicateUserException;
import com.ucsmgy.projectcatalog.exceptions.InvalidVerificationCodeException;
import com.ucsmgy.projectcatalog.exceptions.UserNotFoundException;
import com.ucsmgy.projectcatalog.exceptions.VerificationCodeExpiredException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DuplicateUserException.class)
    public ResponseEntity<Map<String, String>> handleDuplicateUser() {
        return ResponseEntity.badRequest()
                .body(Map.of("email", "Email is already registered."));
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleUserNotFound() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "User not found."));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An unexpected error occurred"));
    }

    @ExceptionHandler(InvalidVerificationCodeException.class)
    public ResponseEntity<Map<String, String>> handleInvalidCode() {
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid code or email."));
    }

    @ExceptionHandler(VerificationCodeExpiredException.class)
    public ResponseEntity<Map<String, String>> handleExpiredCode() {
        return ResponseEntity.badRequest().body(Map.of("error", "Verification code has expired."));
    }

}
