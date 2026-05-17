package com.hayding.admin.controller;

import com.hayding.common.dto.ApiResponse;
import com.hayding.report.dto.ReportResponse;
import com.hayding.report.service.ReportService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reports")
public class AdminReportController {

    private final ReportService reportService;

    public AdminReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping
    public ApiResponse<List<ReportResponse>> getAllReports() {
        List<ReportResponse> reports = reportService.getAllReports();
        return ApiResponse.success("Reports fetched successfully", reports);
    }

    @GetMapping("/open")
    public ApiResponse<List<ReportResponse>> getOpenReports() {
        List<ReportResponse> reports = reportService.getOpenReports();
        return ApiResponse.success("Open reports fetched successfully", reports);
    }

    @PatchMapping("/{id}/review")
    public ApiResponse<ReportResponse> markAsReviewed(@PathVariable Long id) {
        ReportResponse report = reportService.markAsReviewed(id);
        return ApiResponse.success("Report marked as reviewed successfully", report);
    }

    @PatchMapping("/{id}/resolve")
    public ApiResponse<ReportResponse> resolveReport(@PathVariable Long id) {
        ReportResponse report = reportService.resolveReport(id);
        return ApiResponse.success("Report resolved successfully", report);
    }

    @PatchMapping("/{id}/reject")
    public ApiResponse<ReportResponse> rejectReport(@PathVariable Long id) {
        ReportResponse report = reportService.rejectReport(id);
        return ApiResponse.success("Report rejected successfully", report);
    }
}