package com.ucsmgy.projectcatalog.controllers;


import com.ucsmgy.projectcatalog.dtos.*;
import com.ucsmgy.projectcatalog.entities.User;
import com.ucsmgy.projectcatalog.exceptions.DuplicateUserException;
import com.ucsmgy.projectcatalog.exceptions.UserNotFoundException;
import com.ucsmgy.projectcatalog.services.*;
import com.ucsmgy.projectcatalog.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
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
    private final ImgbbService imgbbService;
    private final UserRoleService userRoleService;

    @PostMapping("/login/request-code")
    public ResponseEntity<String> requestCodeForLogin(@Valid @RequestBody LoginRequest request) {
        loginService.requestCode(request);
        return ResponseEntity.ok("Verification code sent to your email.");
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



@PostMapping("/upload-avatar")
public ResponseEntity<Map<String, String>> uploadAvatar(
        @RequestParam("image") MultipartFile file,
        Authentication authentication) {
    try {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        // Convert file to base64
        byte[] fileBytes = file.getBytes();
        String base64Image = java.util.Base64.getEncoder().encodeToString(fileBytes);
        String mimeType = file.getContentType();

        // Add data URL prefix
        String dataUrl = "data:" + mimeType + ";base64," + base64Image;

        // Upload to imgbb
        String imageUrl = imgbbService.uploadBase64Image(dataUrl);

        return ResponseEntity.ok(Map.of("url", imageUrl));
    } catch (Exception e) {
        System.out.println("Avatar upload failed" + e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to upload image: " + e.getMessage()));
    }
}


    @GetMapping("/supervisors")
    public ResponseEntity<List<User>> getAllSupervisors() {

        List<User> supervisors = userService.getAllSupervisors("SUPERVISOR");
        return ResponseEntity.ok(supervisors);
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


    @PutMapping("/{id}")
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

    @GetMapping("/me")
    public UserDto getCurrentUser(Authentication authentication) {
        String email = authentication.getName();

        return userService.findByEmail(email);
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
