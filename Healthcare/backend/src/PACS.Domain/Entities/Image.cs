namespace PACS.Domain.Entities;

public class Image : BaseEntity
{
    public string SopInstanceUid { get; set; } = string.Empty;
    public Guid SeriesId { get; set; }
    public Series? Series { get; set; }
    public int InstanceNumber { get; set; }
    public string StoragePath { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string? SopClassUid { get; set; }
    public string TransferSyntaxUid { get; set; } = string.Empty;
    public int? Rows { get; set; }
    public int? Columns { get; set; }
    public string? PhotometricInterpretation { get; set; }
}
