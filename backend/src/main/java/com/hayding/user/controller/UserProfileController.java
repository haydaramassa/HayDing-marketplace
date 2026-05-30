package com.hayding.user.controller;

import com.hayding.common.dto.ApiResponse;
import com.hayding.user.dto.UpdateUserProfileRequest;
import com.hayding.user.dto.UserProfileResponse;
import com.hayding.user.model.User;
import com.hayding.user.repository.UserRepository;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserProfileController {

    private final UserRepository userRepository;

    public UserProfileController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> getCurrentUser(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);

        return ApiResponse.success(
                "User profile loaded successfully",
                toResponse(user)
        );
    }

    @PutMapping("/me")
    public ApiResponse<UserProfileResponse> updateCurrentUser(
            Authentication authentication,
            @RequestBody UpdateUserProfileRequest request
    ) {
        User user = getAuthenticatedUser(authentication);

        user.setFullName(request.fullName());
        user.setCity(request.city());
        user.setBio(request.bio());
        user.setPreferredLanguage(request.preferredLanguage());

        User savedUser = userRepository.save(user);

        return ApiResponse.success(
                "User profile updated successfully",
                toResponse(savedUser)
        );
    }

    @PostMapping(
            value = "/me/profile-image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ApiResponse<UserProfileResponse> uploadProfileImage(
            Authentication authentication,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        User user = getAuthenticatedUser(authentication);

        validateImage(file);

        String originalFilename = file.getOriginalFilename();
        String extension = getExtension(originalFilename);
        String filename = UUID.randomUUID() + extension;

        Path uploadDirectory = Path.of("uploads", "profile-images");
        Files.createDirectories(uploadDirectory);

        Path targetPath = uploadDirectory.resolve(filename);
        file.transferTo(targetPath.toFile());

        String profileImageUrl = "/uploads/profile-images/" + filename;

        user.setProfileImageUrl(profileImageUrl);
        User savedUser = userRepository.save(user);

        return ApiResponse.success(
                "Profile image uploaded successfully",
                toResponse(savedUser)
        );
    }

    private User getAuthenticatedUser(Authentication authentication) {
        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file is required");
        }

        long maxSize = 5 * 1024 * 1024;

        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("Image must be 5MB or smaller");
        }

        String contentType = file.getContentType();

        if (
                contentType == null ||
                        !(
                                contentType.equals("image/jpeg") ||
                                        contentType.equals("image/png") ||
                                        contentType.equals("image/webp")
                        )
        ) {
            throw new IllegalArgumentException("Only JPG, PNG and WEBP images are allowed");
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return ".png";
        }

        String extension = filename.substring(filename.lastIndexOf(".")).toLowerCase(Locale.ROOT);

        if (
                extension.equals(".jpg") ||
                        extension.equals(".jpeg") ||
                        extension.equals(".png") ||
                        extension.equals(".webp")
        ) {
            return extension;
        }

        return ".png";
    }

    private UserProfileResponse toResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getCity(),
                user.getBio(),
                user.getProfileImageUrl(),
                user.getPreferredLanguage()
        );
    }
}