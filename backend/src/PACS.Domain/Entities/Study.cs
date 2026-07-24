using PACS.Domain.Enums;

namespace PACS.Domain.Entities;

public class Study : BaseEntity
{
    public string StudyInstanceUid { get; set; } = string.Empty;
    public string AccessionNumber { get; set; } = string.Empty;
    public Guid PatientId { get; set; }
    public Patient? Patient { get; set; }
    public Modality Modality { get; set; }
    public string StudyDescription { get; set; } = string.Empty;
    public DateTime ScheduledDateUtc { get; set; }
    public DateTime? PerformedDateUtc { get; set; }
    public StudyStatus Status { get; set; } = StudyStatus.Scheduled;
    public string? ReferringPhysician { get; set; }
    public Guid? AssignedRadiologistId { get; set; }

    public ICollection<Series> SeriesList { get; set; } = new List<Series>();
    public ICollection<Report> Reports { get; set; } = new List<Report>();
}
