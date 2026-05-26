package com.hayding.user.controller;

import com.hayding.common.dto.ApiResponse;
import com.hayding.user.dto.PublicUserProfileResponse;
import com.hayding.user.model.User;
import com.hayding.user.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/users")
public class PublicUserProfileController {

    private final UserRepository userRepository;

    public PublicUserProfileController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/{userId}")
    public ApiResponse<PublicUserProfileResponse> getPublicUserProfile(
            @PathVariable Long userId
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return ApiResponse.success(
                "Public user profile loaded successfully",
                PublicUserProfileResponse.fromEntity(user)
        );
    }
}