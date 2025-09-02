package com.ucsmgy.projectcatalog.repositories;

import com.ucsmgy.projectcatalog.entities.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByEmailAndResetCode(String email, String code);
    Optional<PasswordResetToken> findByEmail(String email);
}
