using PACS.Application.DTOs;

namespace PACS.Application.Interfaces;

public interface IImageService
{
    Task<ImageUploadResponse> UploadDicomAsync(Stream fileStream, Guid seriesId, Guid studyId, string actor, string ip);
    Task<(Stream FileStream, string ContentType, string FileName)> DownloadDicomAsync(Guid imageId, string actor, string ip);
    Task<PagedResult<ImageMetadataResponse>> SearchAsync(ImageSearchQuery query);
}
