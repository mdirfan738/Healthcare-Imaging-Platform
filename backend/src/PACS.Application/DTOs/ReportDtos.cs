using PACS.Domain.Enums;

namespace PACS.Application.DTOs;

public record CreateReportRequest(Guid StudyId, string Findings, string? Impression);
public record UpdateReportRequest(string Findings, string? Impression);
public record SignReportRequest(string AttestationNote);
public record ReportResponse(Guid Id, Guid StudyId, string Findings, string? Impression, ReportStatus Status,
    Guid AuthorId, Guid? SignedById, DateTime? SignedAtUtc, int Version);
