using Microsoft.EntityFrameworkCore;
using PACS.Application.DTOs;
using PACS.Application.Interfaces;
using PACS.Infrastructure.Data;

namespace PACS.Infrastructure.Services;

public class ImageService : IImageService
{
    private readonly ApplicationDbContext _db;
    private readonly IDicomStorageService _dicomStorage;
    private readonly IAuditLogService _audit;

    public ImageService(ApplicationDbContext db, IDicomStorageService dicomStorage, IAuditLogService audit)
    {
        _db = db; _dicomStorage = dicomStorage; _audit = audit;
    }

    public async Task<ImageUploadResponse> UploadDicomAsync(Stream fileStream, Guid seriesId, Guid studyId, string actor, string ip)
    {
        var series = await _db.SeriesList.FindAsync(seriesId) ?? throw new KeyNotFoundException("Series not found.");

        var image = await _dicomStorage.StoreDicomFileAsync(fileStream, seriesId, studyId);
        await _audit.LogAsync(null, actor, "IMAGE_UPLOAD", "Image", image.Id.ToString(), ip,
            details: $"sopInstanceUid={image.SopInstanceUid}");

        return new ImageUploadResponse(image.Id, image.SopInstanceUid, image.SeriesId, image.FileSizeBytes);
    }

    public async Task<(Stream FileStream, string ContentType, string FileName)> DownloadDicomAsync(Guid imageId, string actor, string ip)
    {
        var image = await _db.Images.FindAsync(imageId) ?? throw new KeyNotFoundException("Image not found.");
        var stream = await _dicomStorage.RetrieveDicomFileAsync(imageId);
        await _audit.LogAsync(null, actor, "IMAGE_DOWNLOAD", "Image", imageId.ToString(), ip);
        return (stream, "application/dicom", $"{image.SopInstanceUid}.dcm");
    }

    public async Task<PagedResult<ImageMetadataResponse>> SearchAsync(ImageSearchQuery query)
    {
        var q = _db.Images.AsNoTracking().Include(i => i.Series).ThenInclude(s => s!.Study).AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.StudyInstanceUid))
            q = q.Where(i => i.Series!.Study!.StudyInstanceUid == query.StudyInstanceUid);
        if (!string.IsNullOrWhiteSpace(query.SeriesInstanceUid))
            q = q.Where(i => i.Series!.SeriesInstanceUid == query.SeriesInstanceUid);
        if (!string.IsNullOrWhiteSpace(query.Modality))
            q = q.Where(i => i.Series!.Modality == query.Modality);

        var total = await q.CountAsync();
        var items = await q.OrderBy(i => i.InstanceNumber)
            .Skip((query.Page - 1) * query.PageSize).Take(query.PageSize)
            .Select(i => new ImageMetadataResponse(i.Id, i.SopInstanceUid, i.InstanceNumber, i.Rows, i.Columns, i.TransferSyntaxUid, i.FileSizeBytes))
            .ToListAsync();

        return new PagedResult<ImageMetadataResponse>(items, total, query.Page, query.PageSize);
    }
}
