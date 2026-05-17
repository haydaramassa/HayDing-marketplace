package com.hayding.report.dto;

import com.hayding.common.enums.ReportStatus;
import com.hayding.common.enums.ReportTargetType;
import com.hayding.report.model.Report;
import com.hayding.user.dto.UserResponse;

import java.time.LocalDateTime;

public class ReportResponse {

    private Long id;
    private UserResponse reporter;
    private ReportTargetType targetType;
    private Long targetId;
    private String reason;
    private String details;
    private ReportStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ReportResponse() {
    }

    public ReportResponse(Long id,
                          UserResponse reporter,
                          ReportTargetType targetType,
                          Long targetId,
                          String reason,
                          String details,
                          ReportStatus status,
                          LocalDateTime createdAt,
                          LocalDateTime updatedAt) {
        this.id = id;
        this.reporter = reporter;
        this.targetType = targetType;
        this.targetId = targetId;
        this.reason = reason;
        this.details = details;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static ReportResponse fromEntity(Report report) {
        if (report == null) {
            return null;
        }

        return new ReportResponse(
                report.getId(),
                UserResponse.fromEntity(report.getReporter()),
                report.getTargetType(),
                report.getTargetId(),
                report.getReason(),
                report.getDetails(),
                report.getStatus(),
                report.getCreatedAt(),
                report.getUpdatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public UserResponse getReporter() {
        return reporter;
    }

    public ReportTargetType getTargetType() {
        return targetType;
    }

    public Long getTargetId() {
        return targetId;
    }

    public String getReason() {
        return reason;
    }

    public String getDetails() {
        return details;
    }

    public ReportStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}