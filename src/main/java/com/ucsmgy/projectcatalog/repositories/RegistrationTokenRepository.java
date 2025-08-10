
package com.ucsmgy.projectcatalog.repositories;

import com.ucsmgy.projectcatalog.entities.RegistrationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RegistrationTokenRepository extends JpaRepository<RegistrationToken, Long> {
    Optional<RegistrationToken> findByEmailAndVerificationCode(String email, String code);
    Optional<RegistrationToken> findByEmail(String email);
}
