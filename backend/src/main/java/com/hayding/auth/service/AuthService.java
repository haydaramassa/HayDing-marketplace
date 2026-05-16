package com.hayding.auth.service;

import com.hayding.auth.dto.RegisterRequest;
import com.hayding.user.dto.UserResponse;
import com.hayding.user.model.User;
import com.hayding.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already in use");
        }

        User user = new User(
                request.getFullName(),
                request.getEmail().toLowerCase().trim(),
                passwordEncoder.encode(request.getPassword()),
                request.getCity(),
                request.getPreferredLanguage()
        );

        User savedUser = userRepository.save(user);

        return UserResponse.fromEntity(savedUser);
    }
}