package com.ucsmgy.projectcatalog.services;

import com.ucsmgy.projectcatalog.dtos.ChangePasswordRequest;
import com.ucsmgy.projectcatalog.dtos.CreateUserDto;
import com.ucsmgy.projectcatalog.dtos.UpdateUserRequest;
import com.ucsmgy.projectcatalog.dtos.UserDto;
import com.ucsmgy.projectcatalog.entities.User;
import com.ucsmgy.projectcatalog.exceptions.DuplicateUserException;
import com.ucsmgy.projectcatalog.exceptions.UserNotFoundException;
import com.ucsmgy.projectcatalog.mappers.UserMapper;
import com.ucsmgy.projectcatalog.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Set;

@AllArgsConstructor
@Service
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserDto login(String email, String password) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Invalid email or password"));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new AccessDeniedException("Invalid email or password");
        }
        return userMapper.toDto(user);
    }

    public Iterable<UserDto> getAllUsers(String sortBy) {
        if (!Set.of("name", "email").contains(sortBy))
            sortBy = "name";

        return userRepository.findAll(Sort.by(sortBy))
                .stream()
                .map(userMapper::toDto)
                .toList();
    }

    public UserDto getUser(Long userId) {
        var user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);
        return userMapper.toDto(user);
    }

    @Transactional
    public UserDto updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (userRepository.existsByEmail(request.getEmail()) && !user.getEmail().equals(request.getEmail())) {
                throw new DuplicateUserException();
            }
            user.setEmail(request.getEmail());
        }

        if (request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        if (request.getBio() != null && !request.getBio().isBlank()) {
            user.setBio(request.getBio());
        }

        User updatedUser = userRepository.save(user);

        return userMapper.toDto(updatedUser);
    }

    public void deleteUser(Long userId) {
        var user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);
        userRepository.delete(user);
    }

    public void changePassword(Long userId, ChangePasswordRequest request){
        var user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
                throw new AccessDeniedException("Password does not match");
        }
        String passwordHash = passwordEncoder.encode(request.getNewPassword());
        user.setPasswordHash(passwordHash);
        userRepository.save(user);
    }
}
