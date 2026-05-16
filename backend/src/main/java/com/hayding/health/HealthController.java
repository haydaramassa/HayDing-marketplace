package com.hayding.health;

import com.hayding.common.dto.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/api/health")
    public ApiResponse<Map<String, String>> health() {
        Map<String, String> data = Map.of(
                "status", "UP",
                "app", "HayDing Backend",
                "version", "0.0.1"
        );

        return ApiResponse.success("Backend is running successfully", data);
    }
}