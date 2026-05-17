package com.hayding.report.service;

import com.hayding.common.enums.ReportStatus;
import com.hayding.common.enums.ReportTargetType;
import com.hayding.message.repository.MessageRepository;
import com.hayding.product.repository.ProductRepository;
import com.hayding.report.dto.CreateReportRequest;
import com.hayding.report.dto.ReportResponse;
import com.hayding.report.model.Report;
import com.hayding.report.repository.ReportRepository;
import com.hayding.user.repository.UserRepository;
import com.hayding.user.model.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final MessageRepository messageRepository;

    public ReportService(ReportRepository reportRepository,
                         UserRepository userRepository,
                         ProductRepository productRepository,
                         MessageRepository messageRepository) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.messageRepository = messageRepository;
    }

    @Transactional
    public ReportResponse createReport(CreateReportRequest request, String reporterEmail) {
        User reporter = getUserByEmail(reporterEmail);

        validateTargetExists(request.getTargetType(), request.getTargetId());

        Report report = new Report(
                reporter,
                request.getTargetType(),
                request.getTargetId(),
                request.getReason(),
                request.getDetails()
        );

        Report savedReport = reportRepository.save(report);

        return ReportResponse.fromEntity(savedReport);
    }

    @Transactional(readOnly = true)
    public List<ReportResponse> getAllReports() {
        return reportRepository.findAll()
                .stream()
                .map(ReportResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReportResponse> getOpenReports() {
        return reportRepository.findByStatusOrderByCreatedAtDesc(ReportStatus.OPEN)
                .stream()
                .map(ReportResponse::fromEntity)
                .toList();
    }

    @Transactional
    public ReportResponse markAsReviewed(Long reportId) {
        Report report = getReportById(reportId);
        report.setStatus(ReportStatus.REVIEWED);
        return ReportResponse.fromEntity(reportRepository.save(report));
    }

    @Transactional
    public ReportResponse resolveReport(Long reportId) {
        Report report = getReportById(reportId);
        report.setStatus(ReportStatus.RESOLVED);
        return ReportResponse.fromEntity(reportRepository.save(report));
    }

    @Transactional
    public ReportResponse rejectReport(Long reportId) {
        Report report = getReportById(reportId);
        report.setStatus(ReportStatus.REJECTED);
        return ReportResponse.fromEntity(reportRepository.save(report));
    }

    private Report getReportById(Long reportId) {
        return reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private void validateTargetExists(ReportTargetType targetType, Long targetId) {
        if (targetType == ReportTargetType.PRODUCT) {
            if (!productRepository.existsById(targetId)) {
                throw new IllegalArgumentException("Reported product not found");
            }
            return;
        }

        if (targetType == ReportTargetType.USER) {
            if (!userRepository.existsById(targetId)) {
                throw new IllegalArgumentException("Reported user not found");
            }
            return;
        }

        if (targetType == ReportTargetType.MESSAGE) {
            if (!messageRepository.existsById(targetId)) {
                throw new IllegalArgumentException("Reported message not found");
            }
            return;
        }

        throw new IllegalArgumentException("Invalid report target type");
    }
}
