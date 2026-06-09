package com.hayding.user.controller;

import com.hayding.common.dto.ApiResponse;
import com.hayding.favorite.repository.FavoriteRepository;
import com.hayding.message.repository.ConversationRepository;
import com.hayding.message.repository.MessageRepository;
import com.hayding.notification.repository.NotificationRepository;
import com.hayding.product.repository.ProductImageRepository;
import com.hayding.product.repository.ProductRepository;
import com.hayding.report.repository.ReportRepository;
import com.hayding.request.repository.RequestRepository;
import com.hayding.user.dto.UpdateUserProfileRequest;
import com.hayding.user.dto.UserProfileResponse;
import com.hayding.user.model.User;
import com.hayding.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserProfileController {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final FavoriteRepository favoriteRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final NotificationRepository notificationRepository;
    private final RequestRepository requestRepository;
    private final ReportRepository reportRepository;

    public UserProfileController(UserRepository userRepository,
                                 ProductRepository productRepository,
                                 ProductImageRepository productImageRepository,
                                 FavoriteRepository favoriteRepository,
                                 ConversationRepository conversationRepository,
                                 MessageRepository messageRepository,
                                 NotificationRepository notificationRepository,
                                 RequestRepository requestRepository,
                                 ReportRepository reportRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.favoriteRepository = favoriteRepository;
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.notificationRepository = notificationRepository;
        this.requestRepository = requestRepository;
        this.reportRepository = reportRepository;
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

    @DeleteMapping("/me")
    @Transactional
    public ApiResponse<Void> deleteCurrentUser(Authentication authentication) {
        System.out.println("DELETE ACCOUNT ENDPOINT HIT");

        User user = getAuthenticatedUser(authentication);
        Long userId = user.getId();

        List<Long> productIds = productRepository.findIdsBySellerId(userId);
        List<Long> conversationIds = conversationRepository.findIdsRelatedToUser(userId);

        notificationRepository.deleteByRecipientIdOrActorId(userId, userId);

        if (!conversationIds.isEmpty()) {
            notificationRepository.deleteByConversationIdIn(conversationIds);
        }

        if (!productIds.isEmpty()) {
            notificationRepository.deleteByProductIdIn(productIds);
        }

        requestRepository.deleteByBuyerIdOrSellerId(userId, userId);

        if (!productIds.isEmpty()) {
            requestRepository.deleteByProductIdIn(productIds);
        }

        favoriteRepository.deleteByUserId(userId);

        if (!productIds.isEmpty()) {
            favoriteRepository.deleteByProductIdIn(productIds);
        }

        reportRepository.deleteByReporterId(userId);

        if (!conversationIds.isEmpty()) {
            messageRepository.deleteByConversationIdIn(conversationIds);
            conversationRepository.deleteByIdIn(conversationIds);
        }

        if (!productIds.isEmpty()) {
            productImageRepository.deleteByProductIdIn(productIds);
            productRepository.deleteByIdIn(productIds);
        }

        userRepository.delete(user);

        return ApiResponse.success("Account deleted successfully", null);
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

        Path uploadDirectory = Path.of(
                System.getProperty("user.dir"),
                "uploads",
                "profile-images"
        ).toAbsolutePath().normalize();

        Files.createDirectories(uploadDirectory);

        Path targetPath = uploadDirectory.resolve(filename).normalize();

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
            return ".webp";
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

        return ".webp";
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