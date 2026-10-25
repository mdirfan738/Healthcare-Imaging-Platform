using FellowOakDicom;
using Microsoft.Extensions.Configuration;
using PACS.Application.Interfaces;
using PACS.Domain.Entities;
using PACS.Infrastructure.Data;

namespace PACS.Infrastructure.Dicom;

// Handles DICOM Part 10 file validation, storage, and metadata extraction using fo-dicom.
// Files are stored on disk under a per-series directory; StoragePath/metadata are persisted to Postgres.
public class DicomStorageService : IDicomStorageService
{
    private readonly ApplicationDbContext _db;
    private readonly string _storagePath;

    public DicomStorageService(ApplicationDbContext db, IConfiguration config)
    {
        _db = db;
        _storagePath = config["Dicom:StoragePath"] ?? "/dicom-storage";
        Directory.CreateDirectory(_storagePath);
    }

    public bool IsValidDicom(Stream stream)
    {
        try
        {
            stream.Position = 0;
            var file = DicomFile.Open(stream, FileReadOption.ReadAll);
            stream.Position = 0;
            return file is not null;
        }
        catch
        {
            return false;
        }
    }

    public async Task<Image> StoreDicomFileAsync(Stream dicomStream, Guid seriesId, Guid studyId)
    {
        if (!IsValidDicom(dicomStream))
            throw new InvalidOperationException("Uploaded file is not a valid DICOM Part 10 file.");

        dicomStream.Position = 0;
        var dicomFile = await DicomFile.OpenAsync(dicomStream);
        var dataset = dicomFile.Dataset;

        var sopInstanceUid = dataset.GetSingleValueOrDefault(DicomTag.SOPInstanceUID, Guid.NewGuid().ToString());
        var sopClassUid = dataset.GetSingleValueOrDefault(DicomTag.SOPClassUID, string.Empty);
        var instanceNumber = dataset.GetSingleValueOrDefault(DicomTag.InstanceNumber, 0);
        var rows = dataset.GetSingleValueOrDefault<ushort>(DicomTag.Rows, 0);
        var cols = dataset.GetSingleValueOrDefault<ushort>(DicomTag.Columns, 0);
        var photometric = dataset.GetSingleValueOrDefault(DicomTag.PhotometricInterpretation, string.Empty);
        var transferSyntax = dicomFile.FileMetaInfo.TransferSyntax.UID.UID;

        var seriesDir = Path.Combine(_storagePath, seriesId.ToString());
        Directory.CreateDirectory(seriesDir);
        var filePath = Path.Combine(seriesDir, $"{sopInstanceUid}.dcm");

        dicomStream.Position = 0;
        await using (var fileStream = File.Create(filePath))
        {
            await dicomStream.CopyToAsync(fileStream);
        }

        var image = new Image
        {
            SopInstanceUid = sopInstanceUid,
            SopClassUid = sopClassUid,
            InstanceNumber = instanceNumber,
            StoragePath = filePath,
            FileSizeBytes = new FileInfo(filePath).Length,
            TransferSyntaxUid = transferSyntax,
            Rows = rows,
            Columns = cols,
            PhotometricInterpretation = photometric,
            SeriesId = seriesId
        };

        _db.Images.Add(image);
        await _db.SaveChangesAsync();
        return image;
    }

    public async Task<Stream> RetrieveDicomFileAsync(Guid imageId)
    {
        var image = await _db.Images.FindAsync(imageId)
            ?? throw new FileNotFoundException("DICOM image record not found.");

        if (!File.Exists(image.StoragePath))
            throw new FileNotFoundException("DICOM file missing from storage.");

        return File.OpenRead(image.StoragePath);
    }
}
