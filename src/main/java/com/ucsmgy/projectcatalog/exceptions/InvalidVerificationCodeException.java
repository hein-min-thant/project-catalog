package com.ucsmgy.projectcatalog.exceptions;

public class InvalidVerificationCodeException extends RuntimeException {
    public InvalidVerificationCodeException() {
        super("Invalid verification code or email.");
    }
}
