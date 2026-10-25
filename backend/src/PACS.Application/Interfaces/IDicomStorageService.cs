using PACS.Domain.Entities;

namespace PACS.Application.Interfaces;

public interface IDicomStorageService
{
    bool IsValidDicom(Stream stream);
    Task<Image> StoreDicomFileAsync(Stream dicomStream, Guid seriesId, Guid studyId);
    Task<Stream> RetrieveDicomFileAsync(Guid imageId);
}
