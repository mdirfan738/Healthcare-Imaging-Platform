using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using PACS.Application.DTOs;
using PACS.Application.Interfaces;
using PACS.Domain.Entities;
using PACS.Domain.Enums;
using PACS.Infrastructure.Data;

namespace PACS.Infrastructure.Services;

public class ReportService : IReportService
{
    private readonly ApplicationDbContext _db;
    private readonly IAuditLogService _audit;

    public ReportService(ApplicationDbContext db, IAuditLogService audit)
    {
        _db = db; _audit = audit;
    }

    private static ReportResponse ToResponse(Report r) => new(
        r.Id, r.StudyId, r.Findings, r.Impression, r.Status, r.AuthorId, r.SignedById, r.SignedAtUtc, r.Version);

    public async Task<ReportResponse> CreateAsync(CreateReportRequest request, Guid authorId, string actor, string ip)
    {
        var study = await _db.Studies.FindAsync(request.StudyId) ?? throw new KeyNotFoundException("Study not found.");

        var report = new Report
        {
            StudyId = request.StudyId,
            Findings = request.Findings,
            Impression = request.Impression,
            AuthorId = authorId,
            Status = ReportStatus.Draft
        };
        _db.Reports.Add(report);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(authorId, actor, "REPORT_CREATE", "Report", report.Id.ToString(), ip);
        return ToResponse(report);
    }

    public async Task<ReportResponse> UpdateAsync(Guid id, UpdateReportRequest request, string actor, string ip)
    {
        var report = await _db.Reports.FindAsync(id) ?? throw new KeyNotFoundException("Report not found.");
        if (report.Status == ReportStatus.Signed)
            throw new InvalidOperationException("Signed reports are immutable; create an amendment instead.");

        report.Findings = request.Findings;
        report.Impression = request.Impression;
        report.Status = ReportStatus.Preliminary;
        report.Version += 1;
        report.UpdatedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        await _audit.LogAsync(null, actor, "REPORT_UPDATE", "Report", id.ToString(), ip);
        return ToResponse(report);
    }

    public async Task<ReportResponse> SignAsync(Guid id, Guid signerId, SignReportRequest request, string actor, string ip)
    {
        var report = await _db.Reports.FindAsync(id) ?? throw new KeyNotFoundException("Report not found.");

        // Produces a content-integrity hash (not a legal e-signature) so any post-signing tampering
        // with Findings/Impression can be detected on read.
        var payload = $"{report.Id}|{report.Findings}|{report.Impression}|{signerId}|{DateTime.UtcNow:O}|{request.AttestationNote}";
        var hash = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(payload)));

        report.Status = ReportStatus.Signed;
        report.SignedById = signerId;
        report.SignedAtUtc = DateTime.UtcNow;
        report.DigitalSignature = hash;
        await _db.SaveChangesAsync();

        var study = await _db.Studies.FindAsync(report.StudyId);
        if (study is not null) { study.Status = StudyStatus.Verified; await _db.SaveChangesAsync(); }

        await _audit.LogAsync(signerId, actor, "REPORT_SIGN", "Report", id.ToString(), ip);
        return ToResponse(report);
    }

    public async Task<ReportResponse?> GetByIdAsync(Guid id)
    {
        var report = await _db.Reports.AsNoTracking().FirstOrDefaultAsync(r => r.Id == id);
        return report is null ? null : ToResponse(report);
    }
}
