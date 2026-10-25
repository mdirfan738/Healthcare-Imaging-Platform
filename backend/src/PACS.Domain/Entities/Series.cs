namespace PACS.Domain.Entities;

public class Series : BaseEntity
{
    public string SeriesInstanceUid { get; set; } = string.Empty;
    public Guid StudyId { get; set; }
    public Study? Study { get; set; }
    public int SeriesNumber { get; set; }
    public string Modality { get; set; } = string.Empty;
    public string? SeriesDescription { get; set; }
    public string? BodyPartExamined { get; set; }

    public ICollection<Image> Images { get; set; } = new List<Image>();
}
