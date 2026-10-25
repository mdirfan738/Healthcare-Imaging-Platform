namespace PACS.Application.DTOs;

public record ImageUploadResponse(Guid ImageId, string SopInstanceUid, Guid SeriesId, long FileSizeBytes);
public record ImageSearchQuery(string? StudyInstanceUid, string? SeriesInstanceUid, string? Modality, int Page = 1, int PageSize = 50);
public record ImageMetadataResponse(Guid Id, string SopInstanceUid, int InstanceNumber, int? Rows, int? Columns, string TransferSyntaxUid, long FileSizeBytes);
