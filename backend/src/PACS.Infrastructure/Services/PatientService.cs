using Microsoft.EntityFrameworkCore;
using PACS.Application.DTOs;
using PACS.Application.Interfaces;
using PACS.Domain.Entities;
using PACS.Infrastructure.Data;

namespace PACS.Infrastructure.Services;

public class PatientService : IPatientService
{
    private readonly ApplicationDbContext _db;
    private readonly IAuditLogService _audit;
    private readonly ICacheService _cache;

    public PatientService(
        ApplicationDbContext db,
        IAuditLogService audit,
        ICacheService cache)
    {
        _db = db;
        _audit = audit;
        _cache = cache;
    }

    private static PatientResponse ToResponse(Patient p) => new(
        p.Id,
        p.PatientNumber,
        p.FirstName,
        p.LastName,
        p.DateOfBirth,
        p.Gender,
        p.PhoneNumber,
        p.Email,
        p.InsuranceProvider,
        p.CreatedAtUtc);

    public async Task<PatientResponse> CreateAsync(CreatePatientRequest request, string actor, string ip)
    {
        var patientNumber = $"MRN{DateTime.UtcNow:yyyyMMddHHmmssfff}";

        var patient = new Patient
        {
            PatientNumber = patientNumber,
            FirstName = request.FirstName,
            LastName = request.LastName,
            DateOfBirth = request.DateOfBirth,
            Gender = request.Gender,
            PhoneNumber = request.PhoneNumber,
            Email = request.Email,
            Address = request.Address,
            NationalId = request.NationalId,
            InsuranceProvider = request.InsuranceProvider,
            InsuranceNumber = request.InsuranceNumber
        };

        _db.Patients.Add(patient);
        await _db.SaveChangesAsync();

        await _audit.LogAsync(
            null,
            actor,
            "PATIENT_CREATE",
            "Patient",
            patient.Id.ToString(),
            ip);

        return ToResponse(patient);
    }

    public async Task<PatientResponse> UpdateAsync(Guid id, UpdatePatientRequest request, string actor, string ip)
    {
        var patient = await _db.Patients.FindAsync(id)
            ?? throw new KeyNotFoundException("Patient not found.");

        patient.FirstName = request.FirstName;
        patient.LastName = request.LastName;
        patient.DateOfBirth = request.DateOfBirth;
        patient.Gender = request.Gender;
        patient.PhoneNumber = request.PhoneNumber;
        patient.Email = request.Email;
        patient.Address = request.Address;
        patient.InsuranceProvider = request.InsuranceProvider;
        patient.InsuranceNumber = request.InsuranceNumber;
        patient.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        await _cache.RemoveAsync($"patient:{id}");

        await _audit.LogAsync(
            null,
            actor,
            "PATIENT_UPDATE",
            "Patient",
            id.ToString(),
            ip);

        return ToResponse(patient);
    }

    public async Task DeleteAsync(Guid id, string actor, string ip)
    {
        var patient = await _db.Patients.FindAsync(id)
            ?? throw new KeyNotFoundException("Patient not found.");

        patient.IsDeleted = true;
        patient.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        await _cache.RemoveAsync($"patient:{id}");

        await _audit.LogAsync(
            null,
            actor,
            "PATIENT_DELETE",
            "Patient",
            id.ToString(),
            ip);
    }

    public async Task<PatientResponse?> GetByIdAsync(Guid id)
    {
        var cacheKey = $"patient:{id}";

        var cached = await _cache.GetAsync<PatientResponse>(cacheKey);

        if (cached != null)
            return cached;

        var patient = await _db.Patients
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);

        if (patient == null)
            return null;

        var response = ToResponse(patient);

        await _cache.SetAsync(cacheKey, response, TimeSpan.FromMinutes(5));

        return response;
    }

    public async Task<PagedResult<PatientResponse>> SearchAsync(PatientSearchQuery query)
    {
        var q = _db.Patients
            .AsNoTracking()
            .Where(p => !p.IsDeleted);

        if (!string.IsNullOrWhiteSpace(query.Name))
        {
            var search = query.Name.Trim();

            // Safe, case-insensitive search compatible with EF Core In-Memory and SQL providers
            q = q.Where(p =>
                (p.FirstName != null && EF.Functions.Like(p.FirstName, $"%{search}%")) ||
                (p.LastName != null && EF.Functions.Like(p.LastName, $"%{search}%")));
        }

        if (!string.IsNullOrWhiteSpace(query.PatientNumber))
        {
            q = q.Where(p => p.PatientNumber == query.PatientNumber);
        }

        if (!string.IsNullOrWhiteSpace(query.NationalId))
        {
            q = q.Where(p => p.NationalId == query.NationalId);
        }

        var total = await q.CountAsync();

        // Prevent negative skip calculation if Page is passed as 0
        var pageNumber = query.Page < 1 ? 1 : query.Page;

        var items = await q
            .OrderBy(p => p.LastName)
            .Skip((pageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(p => new PatientResponse(
                p.Id,
                p.PatientNumber,
                p.FirstName,
                p.LastName,
                p.DateOfBirth,
                p.Gender,
                p.PhoneNumber,
                p.Email,
                p.InsuranceProvider,
                p.CreatedAtUtc))
            .ToListAsync();

        return new PagedResult<PatientResponse>(
            items,
            total,
            pageNumber,
            query.PageSize);
    }
}
