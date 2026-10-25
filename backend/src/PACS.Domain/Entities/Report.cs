using PACS.Domain.Enums;

namespace PACS.Domain.Entities;

public class Report : BaseEntity
{
    public Guid StudyId { get; set; }
    public Study? Study { get; set; }
    public string Findings { get; set; } = string.Empty;
    public string? Impression { get; set; }
    public ReportStatus Status { get; set; } = ReportStatus.Draft;
    public Guid AuthorId { get; set; }
    public Guid? SignedById { get; set; }
    public DateTime? SignedAtUtc { get; set; }
    public string? DigitalSignature { get; set; }
    public int Version { get; set; } = 1;
}
