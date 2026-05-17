package com.hayding.request.controller;

import com.hayding.common.dto.ApiResponse;
import com.hayding.request.dto.CreateRequestDto;
import com.hayding.request.dto.RequestResponse;
import com.hayding.request.service.RequestService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
public class RequestController {

    private final RequestService requestService;

    public RequestController(RequestService requestService) {
        this.requestService = requestService;
    }

    @PostMapping
    public ApiResponse<RequestResponse> createRequest(@Valid @RequestBody CreateRequestDto dto,
                                                      Authentication authentication) {
        RequestResponse request = requestService.createRequest(dto, authentication.getName());
        return ApiResponse.success("Request created successfully", request);
    }

    @GetMapping("/sent")
    public ApiResponse<List<RequestResponse>> getSentRequests(Authentication authentication) {
        List<RequestResponse> requests = requestService.getSentRequests(authentication.getName());
        return ApiResponse.success("Sent requests fetched successfully", requests);
    }

    @GetMapping("/received")
    public ApiResponse<List<RequestResponse>> getReceivedRequests(Authentication authentication) {
        List<RequestResponse> requests = requestService.getReceivedRequests(authentication.getName());
        return ApiResponse.success("Received requests fetched successfully", requests);
    }

    @PatchMapping("/{id}/accept")
    public ApiResponse<RequestResponse> acceptRequest(@PathVariable Long id,
                                                      Authentication authentication) {
        RequestResponse request = requestService.acceptRequest(id, authentication.getName());
        return ApiResponse.success("Request accepted successfully", request);
    }

    @PatchMapping("/{id}/reject")
    public ApiResponse<RequestResponse> rejectRequest(@PathVariable Long id,
                                                      Authentication authentication) {
        RequestResponse request = requestService.rejectRequest(id, authentication.getName());
        return ApiResponse.success("Request rejected successfully", request);
    }

    @PatchMapping("/{id}/cancel")
    public ApiResponse<RequestResponse> cancelRequest(@PathVariable Long id,
                                                      Authentication authentication) {
        RequestResponse request = requestService.cancelRequest(id, authentication.getName());
        return ApiResponse.success("Request cancelled successfully", request);
    }

    @PatchMapping("/{id}/complete")
    public ApiResponse<RequestResponse> completeRequest(@PathVariable Long id,
                                                        Authentication authentication) {
        RequestResponse request = requestService.completeRequest(id, authentication.getName());
        return ApiResponse.success("Request completed successfully", request);
    }
}