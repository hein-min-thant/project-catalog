package com.ucsmgy.projectcatalog.controllers;


import com.ucsmgy.projectcatalog.dtos.*;
import com.ucsmgy.projectcatalog.entities.User;
import com.ucsmgy.projectcatalog.exceptions.DuplicateUserException;
import com.ucsmgy.projectcatalog.exceptions.UserNotFoundException;
import com.ucsmgy.projectcatalog.services.LoginService;
import com.ucsmgy.projectcatalog.services.RegistrationService;
import com.ucsmgy.projectcatalog.services.UserService;
import com.ucsmgy.projectcatalog.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

@RestController
@AllArgsConstructor
@RequestMapping("/users")
public class UserController {
    private final UserService userService;
    private final RegistrationService registrationService;
    private final LoginService loginService;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    @PostMapping("/login/request-code")
    public ResponseEntity<String> requestCodeForLogin(@Valid @RequestBody LoginRequest request) {
        loginService.requestCode(request);
        return ResponseEntity.ok("Verification code sent to your email.");
    }

    @GetMapping("login/test")
    public String test(){
        UserDetails user = userDetailsService.loadUserByUsername("hmt9733@gmail.com");
        String token = jwtUtil.generateToken(user);
        boolean valid = jwtUtil.validateToken(token , user);
        return "token" + token + "valid" + valid;
    }

    @PostMapping("/login/verify")
    public ResponseEntity<?> verifyAndAuthenticate(@Valid @RequestBody VerificationRequest request) {
        try {
            User user = loginService.verifyAndGetUser(request);

            final UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
            final String jwt = jwtUtil.generateToken(userDetails);

            return ResponseEntity.ok(new JwtResponse(jwt));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @GetMapping
    public Iterable<UserDto> getAllUsers(
            @RequestParam(required = false, defaultValue = "", name = "sort") String sortBy
    ) {
        return userService.getAllUsers(sortBy);
    }

    @GetMapping("/{id}")
    public UserDto getUser(@PathVariable Long id) {
        return userService.getUser(id);
    }

    @PostMapping("/register/request-code")
    public ResponseEntity<String> requestCode(@Valid @RequestBody RegistrationRequest request) {
        registrationService.requestCode(request);
        return ResponseEntity.ok("Verification code sent to your email.");
    }

    @PostMapping("/register/verify-and-create")
    public ResponseEntity<UserDto> verifyAndCreate(
            @Valid @RequestBody VerificationRequest request,
            UriComponentsBuilder uriBuilder) {
        var userDto = registrationService.verifyAndCreate(request);
        var uri = uriBuilder.path("/users/{id}").buildAndExpand(userDto.getId()).toUri();
        return ResponseEntity.created(uri).body(userDto);
    }


    @PatchMapping("/{id}")
    public UserDto updateUser(
            @PathVariable(name = "id") Long id,
            @RequestBody UpdateUserRequest request) {
        return userService.updateUser(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or #id == principal.id")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    @PostMapping("/{id}/change-password")
    public void changePassword(
            @PathVariable Long id,
            @RequestBody ChangePasswordRequest request) {
        userService.changePassword(id, request);
    }

    @ExceptionHandler(DuplicateUserException.class)
    public ResponseEntity<Map<String, String>> handleDuplicateUser() {
        return ResponseEntity.badRequest().body(
                Map.of("email", "Email is already registered.")
        );
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Void> handleUserNotFound() {
        return ResponseEntity.notFound().build();
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<String> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
    }
}
