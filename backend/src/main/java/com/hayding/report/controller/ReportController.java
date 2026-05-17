package com.hayding.report.controller;

import com.hayding.common.dto.ApiResponse;
import com.hayding.report.dto.CreateReportRequest;
import com.hayding.report.dto.ReportResponse;
import com.hayding.report.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping
    public ApiResponse<ReportResponse> createReport(@Valid @RequestBody CreateReportRequest request,
                                                    Authentication authentication) {
        ReportResponse report = reportService.createReport(request, authentication.getName());
        return ApiResponse.success("Report created successfully", report);
    }
}