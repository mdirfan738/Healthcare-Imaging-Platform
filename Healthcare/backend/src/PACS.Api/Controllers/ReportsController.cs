using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PACS.Application.DTOs;
using PACS.Application.Interfaces;
using System.Security.Claims;

namespace PACS.Api.Controllers;

[ApiController]
[Route("api/v1/reports")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService) => _reportService = reportService;

    private string Actor => User.Identity?.Name ?? "unknown";
    private string ClientIp => HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    private Guid CurrentUserId => Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub"), out var id) ? id : Guid.Empty;

    /// <summary>Creates a draft report for a study. Roles: Radiologist.</summary>
    [HttpPost]
    [Authorize(Roles = "Admin,Radiologist")]
    [ProducesResponseType(typeof(ReportResponse), 201)]
    public async Task<ActionResult<ReportResponse>> Create([FromBody] CreateReportRequest request)
    {
        var result = await _reportService.CreateAsync(request, CurrentUserId, Actor, ClientIp);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>Updates a draft/preliminary report's findings and impression.</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Radiologist")]
    [ProducesResponseType(typeof(ReportResponse), 200)]
    public async Task<ActionResult<ReportResponse>> Update(Guid id, [FromBody] UpdateReportRequest request)
        => Ok(await _reportService.UpdateAsync(id, request, Actor, ClientIp));

    /// <summary>Digitally signs and finalizes a report, locking it from further edits.</summary>
    [HttpPost("{id:guid}/sign")]
    [Authorize(Roles = "Admin,Radiologist")]
    [ProducesResponseType(typeof(ReportResponse), 200)]
    public async Task<ActionResult<ReportResponse>> Sign(Guid id, [FromBody] SignReportRequest request)
        => Ok(await _reportService.SignAsync(id, CurrentUserId, request, Actor, ClientIp));

    /// <summary>Retrieves a report by ID.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ReportResponse), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<ReportResponse>> GetById(Guid id)
    {
        var result = await _reportService.GetByIdAsync(id);
        return result is null ? NotFound() : Ok(result);
    }
}
