using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PACS.Application.DTOs;
using PACS.Application.Interfaces;

namespace PACS.Api.Controllers;

[ApiController]
[Route("api/v1/audit-logs")]
[Authorize(Roles = "Admin,Auditor")]
public class AuditLogsController : ControllerBase
{
    private readonly IAuditLogService _auditLogService;

    public AuditLogsController(IAuditLogService auditLogService) => _auditLogService = auditLogService;

    /// <summary>Searches the immutable audit trail. Restricted to Admin/Auditor roles.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<AuditLogResponse>), 200)]
    public async Task<ActionResult<PagedResult<AuditLogResponse>>> Search([FromQuery] AuditLogSearchQuery query)
        => Ok(await _auditLogService.SearchAsync(query));
}
