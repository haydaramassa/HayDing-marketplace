package com.hayding.user.controller;

import com.hayding.common.dto.ApiResponse;
import com.hayding.user.dto.UpdateUserProfileRequest;
import com.hayding.user.dto.UserProfileResponse;
import com.hayding.user.model.User;
import com.hayding.user.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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

    private User getAuthenticatedUser(Authentication authentication) {
        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private UserProfileResponse toResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getCity(),
                user.getBio(),
                user.getPreferredLanguage()
        );
    }
}