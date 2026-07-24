using PACS.Application.DTOs;

namespace PACS.Application.Interfaces;

public interface IAuditLogService
{
    Task LogAsync(Guid? userId, string username, string action, string entityType, string? entityId, string? ipAddress, bool success = true, string? details = null);
    Task<PagedResult<AuditLogResponse>> SearchAsync(AuditLogSearchQuery query);
}
