using PACS.Domain.Enums;

namespace PACS.Domain.Entities;

public class Appointment : BaseEntity
{
    public Guid PatientId { get; set; }
    public Patient? Patient { get; set; }
    public DateTime ScheduledAtUtc { get; set; }
    public Modality ModalityRequested { get; set; }
    public string Reason { get; set; } = string.Empty;
    public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;
    public Guid? AssignedTechnologistId { get; set; }
}
