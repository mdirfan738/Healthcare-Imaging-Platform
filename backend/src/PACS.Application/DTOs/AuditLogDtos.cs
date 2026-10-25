namespace PACS.Application.DTOs;

public record AuditLogResponse(Guid Id, string Username, string Action, string EntityType, string? EntityId,
    string? IpAddress, bool Success, DateTime CreatedAtUtc);
public record AuditLogSearchQuery(string? Username, string? Action, DateTime? FromDateUtc, DateTime? ToDateUtc, int Page = 1, int PageSize = 50);
