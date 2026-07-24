using Microsoft.EntityFrameworkCore;
using PACS.Application.DTOs;
using PACS.Application.Interfaces;
using PACS.Domain.Entities;
using PACS.Infrastructure.Data;

namespace PACS.Infrastructure.Services;

public class StudyService : IStudyService
{
    private readonly ApplicationDbContext _db;
    private readonly IAuditLogService _audit;

    public StudyService(ApplicationDbContext db, IAuditLogService audit)
    {
        _db = db; _audit = audit;
    }

    private static StudyResponse ToResponse(Study s, string patientName) => new(
        s.Id, s.StudyInstanceUid, s.AccessionNumber, s.PatientId, patientName, s.Modality,
        s.StudyDescription, s.ScheduledDateUtc, s.PerformedDateUtc, s.Status, s.AssignedRadiologistId);

    public async Task<StudyResponse> CreateAsync(CreateStudyRequest request, string actor, string ip)
    {
        var patient = await _db.Patients.FindAsync(request.PatientId) ?? throw new KeyNotFoundException("Patient not found.");

        var study = new Study
        {
            StudyInstanceUid = $"1.2.840.PACS.{Guid.NewGuid():N}",
            AccessionNumber = $"ACC{DateTime.UtcNow:yyyyMMddHHmmssfff}",
            PatientId = request.PatientId,
            Modality = request.Modality,
            StudyDescription = request.StudyDescription,
            ScheduledDateUtc = request.ScheduledDateUtc,
            ReferringPhysician = request.ReferringPhysician
        };
        _db.Studies.Add(study);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(null, actor, "STUDY_CREATE", "Study", study.Id.ToString(), ip);

        return ToResponse(study, $"{patient.FirstName} {patient.LastName}");
    }

    public async Task<StudyResponse> UpdateAsync(Guid id, UpdateStudyRequest request, string actor, string ip)
    {
        var study = await _db.Studies.Include(s => s.Patient).FirstOrDefaultAsync(s => s.Id == id)
            ?? throw new KeyNotFoundException("Study not found.");

        study.Status = request.Status;
        study.PerformedDateUtc = request.PerformedDateUtc;
        study.AssignedRadiologistId = request.AssignedRadiologistId;
        study.UpdatedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        await _audit.LogAsync(null, actor, "STUDY_UPDATE", "Study", id.ToString(), ip);

        return ToResponse(study, $"{study.Patient!.FirstName} {study.Patient.LastName}");
    }

    public async Task<StudyResponse?> GetByIdAsync(Guid id)
    {
        var study = await _db.Studies.AsNoTracking().Include(s => s.Patient).FirstOrDefaultAsync(s => s.Id == id);
        return study is null ? null : ToResponse(study, $"{study.Patient!.FirstName} {study.Patient.LastName}");
    }

    public async Task<PagedResult<StudyResponse>> SearchAsync(StudySearchQuery query)
    {
        var q = _db.Studies.AsNoTracking().Include(s => s.Patient).AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.PatientNumber))
            q = q.Where(s => s.Patient!.PatientNumber == query.PatientNumber);
        if (query.Modality.HasValue)
            q = q.Where(s => s.Modality == query.Modality.Value);
        if (query.Status.HasValue)
            q = q.Where(s => s.Status == query.Status.Value);
        if (query.FromDateUtc.HasValue)
            q = q.Where(s => s.ScheduledDateUtc >= query.FromDateUtc.Value);
        if (query.ToDateUtc.HasValue)
            q = q.Where(s => s.ScheduledDateUtc <= query.ToDateUtc.Value);
        if (query.AssignedRadiologistId.HasValue)
            q = q.Where(s => s.AssignedRadiologistId == query.AssignedRadiologistId.Value);

        var total = await q.CountAsync();
        var entities = await q.OrderByDescending(s => s.ScheduledDateUtc)
            .Skip((query.Page - 1) * query.PageSize).Take(query.PageSize)
            .ToListAsync();
        var items = entities.Select(s => ToResponse(s, $"{s.Patient!.FirstName} {s.Patient.LastName}"));

        return new PagedResult<StudyResponse>(items, total, query.Page, query.PageSize);
    }

    public async Task<PagedResult<StudyResponse>> GetWorklistAsync(Guid radiologistId, int page, int pageSize)
    {
        var q = _db.Studies.AsNoTracking().Include(s => s.Patient)
            .Where(s => s.AssignedRadiologistId == radiologistId && s.Status != Domain.Enums.StudyStatus.Verified);

        var total = await q.CountAsync();
        var entities = await q.OrderBy(s => s.ScheduledDateUtc)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .ToListAsync();
        var items = entities.Select(s => ToResponse(s, $"{s.Patient!.FirstName} {s.Patient.LastName}"));

        return new PagedResult<StudyResponse>(items, total, page, pageSize);
    }
}
