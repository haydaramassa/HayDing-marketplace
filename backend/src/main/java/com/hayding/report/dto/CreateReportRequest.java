package com.hayding.report.dto;

import com.hayding.common.enums.ReportTargetType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateReportRequest {

    @NotNull
    private ReportTargetType targetType;

    @NotNull
    private Long targetId;

    @NotBlank
    @Size(max = 255)
    private String reason;

    @Size(max = 3000)
    private String details;

    public CreateReportRequest() {
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
}