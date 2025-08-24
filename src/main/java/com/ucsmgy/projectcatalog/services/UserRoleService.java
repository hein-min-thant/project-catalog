package com.ucsmgy.projectcatalog.services;

import com.ucsmgy.projectcatalog.entities.User;
import com.ucsmgy.projectcatalog.exceptions.EntityNotFoundException;
import com.ucsmgy.projectcatalog.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserRoleService {

    private final UserRepository userRepository;

    @Transactional
    public User setUserRole(Long userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User with ID " + userId + " not found"));
        
        // Validate role
        if (!isValidRole(role)) {
            throw new IllegalArgumentException("Invalid role: " + role + ". Valid roles are: USER, ADMIN, SUPERVISOR");
        }
        
        user.setRole(role);
        return userRepository.save(user);
    }

    @Transactional
    public User setUserAsSupervisor(Long userId) {
        return setUserRole(userId, "SUPERVISOR");
    }

    @Transactional
    public User setUserAsAdmin(Long userId) {
        return setUserRole(userId, "ADMIN");
    }

    @Transactional
    public User setUserAsRegularUser(Long userId) {
        return setUserRole(userId, "USER");
    }

    public List<User> getAllSupervisors() {
        return userRepository.findByRole("SUPERVISOR");
    }

    public List<User> getAllAdmins() {
        return userRepository.findByRole("ADMIN");
    }

    public List<User> getAllRegularUsers() {
        return userRepository.findByRole("USER");
    }

    private boolean isValidRole(String role) {
        return "USER".equals(role) || "ADMIN".equals(role) || "SUPERVISOR".equals(role);
    }
}
