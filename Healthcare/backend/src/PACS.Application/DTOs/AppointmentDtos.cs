using PACS.Domain.Enums;

namespace PACS.Application.DTOs;

public record CreateAppointmentRequest(Guid PatientId, DateTime ScheduledAtUtc, Modality ModalityRequested, string Reason);
public record UpdateAppointmentRequest(DateTime ScheduledAtUtc, AppointmentStatus Status, Guid? AssignedTechnologistId);
public record AppointmentResponse(Guid Id, Guid PatientId, string PatientName, DateTime ScheduledAtUtc,
    Modality ModalityRequested, string Reason, AppointmentStatus Status, Guid? AssignedTechnologistId);
