using Microsoft.EntityFrameworkCore;
using PACS.Application.DTOs;
using PACS.Application.Interfaces;
using PACS.Domain.Entities;

namespace PACS.Infrastructure.Data;

// Writes an immutable audit trail entry for every access/change to PHI-bearing resources,
// satisfying HIPAA's audit control requirement (45 CFR 164.312(b)).
public class AuditLogService : IAuditLogService
{
    private readonly ApplicationDbContext _db;

    public AuditLogService(ApplicationDbContext db) => _db = db;

    public async Task LogAsync(Guid? userId, string username, string action, string entityType,
        string? entityId, string? ipAddress, bool success = true, string? details = null)
    {
        _db.AuditLogs.Add(new AuditLog
        {
            UserId = userId,
            Username = username,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            IpAddress = ipAddress,
            Success = success,
            Details = details
        });
        await _db.SaveChangesAsync();
    }

    public async Task<PagedResult<AuditLogResponse>> SearchAsync(AuditLogSearchQuery query)
    {
        var q = _db.AuditLogs.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Username))
            q = q.Where(a => a.Username.Contains(query.Username));
        if (!string.IsNullOrWhiteSpace(query.Action))
            q = q.Where(a => a.Action.Contains(query.Action));
        if (query.FromDateUtc.HasValue)
            q = q.Where(a => a.CreatedAtUtc >= query.FromDateUtc.Value);
        if (query.ToDateUtc.HasValue)
            q = q.Where(a => a.CreatedAtUtc <= query.ToDateUtc.Value);

        var total = await q.CountAsync();
        var items = await q.OrderByDescending(a => a.CreatedAtUtc)
            .Skip((query.Page - 1) * query.PageSize).Take(query.PageSize)
            .Select(a => new AuditLogResponse(a.Id, a.Username, a.Action, a.EntityType, a.EntityId, a.IpAddress, a.Success, a.CreatedAtUtc))
            .ToListAsync();

        return new PagedResult<AuditLogResponse>(items, total, query.Page, query.PageSize);
    }
}
