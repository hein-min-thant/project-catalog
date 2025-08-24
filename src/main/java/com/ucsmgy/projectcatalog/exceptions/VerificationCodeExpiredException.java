package com.ucsmgy.projectcatalog.exceptions;

public class VerificationCodeExpiredException extends RuntimeException {
    public VerificationCodeExpiredException() {
        super("Verification code has expired.");
    }
}
