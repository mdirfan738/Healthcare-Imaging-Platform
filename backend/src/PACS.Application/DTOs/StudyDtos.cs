using PACS.Domain.Enums;

namespace PACS.Application.DTOs;

public record CreateStudyRequest(Guid PatientId, Modality Modality, string StudyDescription, DateTime ScheduledDateUtc, string? ReferringPhysician);
public record UpdateStudyRequest(StudyStatus Status, DateTime? PerformedDateUtc, Guid? AssignedRadiologistId);
public record StudyResponse(Guid Id, string StudyInstanceUid, string AccessionNumber, Guid PatientId, string PatientName,
    Modality Modality, string StudyDescription, DateTime ScheduledDateUtc, DateTime? PerformedDateUtc, StudyStatus Status, Guid? AssignedRadiologistId);
public record StudySearchQuery(string? PatientNumber, Modality? Modality, StudyStatus? Status, DateTime? FromDateUtc, DateTime? ToDateUtc, Guid? AssignedRadiologistId, int Page = 1, int PageSize = 20);
