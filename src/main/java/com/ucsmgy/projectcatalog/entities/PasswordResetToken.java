package com.ucsmgy.projectcatalog.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Entity
@Setter
@Getter
@Table(name = "password_reset_token")
public class PasswordResetToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email", nullable = false, length = 255, unique = true)
    private String email;

    @Column(name = "reset_code", nullable = false, length = 6)
    private String resetCode;

    @Column(name = "expiry_date", nullable = false)
    private Timestamp expiryDate;

    public PasswordResetToken() {
        this.expiryDate = Timestamp.from(Instant.now().plus(15, ChronoUnit.MINUTES));
    }
}
