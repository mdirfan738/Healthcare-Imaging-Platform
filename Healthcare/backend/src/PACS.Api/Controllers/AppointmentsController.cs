using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PACS.Application.DTOs;
using PACS.Application.Interfaces;

namespace PACS.Api.Controllers;

[ApiController]
[Route("api/v1/appointments")]
[Authorize]
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentService _appointmentService;

    public AppointmentsController(IAppointmentService appointmentService) => _appointmentService = appointmentService;

    private string Actor => User.Identity?.Name ?? "unknown";
    private string ClientIp => HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

    /// <summary>Schedules a new imaging appointment.</summary>
    [HttpPost]
    [Authorize(Roles = "Admin,Receptionist")]
    [ProducesResponseType(typeof(AppointmentResponse), 201)]
    public async Task<ActionResult<AppointmentResponse>> Create([FromBody] CreateAppointmentRequest request)
    {
        var result = await _appointmentService.CreateAsync(request, Actor, ClientIp);
        return CreatedAtAction(nameof(GetByRange), null, result);
    }

    /// <summary>Updates appointment status/time/technologist assignment.</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Receptionist,Technologist")]
    [ProducesResponseType(typeof(AppointmentResponse), 200)]
    public async Task<ActionResult<AppointmentResponse>> Update(Guid id, [FromBody] UpdateAppointmentRequest request)
        => Ok(await _appointmentService.UpdateAsync(id, request, Actor, ClientIp));

    /// <summary>Lists appointments within a date range (for scheduling calendar view).</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<AppointmentResponse>), 200)]
    public async Task<ActionResult<IEnumerable<AppointmentResponse>>> GetByRange([FromQuery] DateTime fromUtc, [FromQuery] DateTime toUtc)
        => Ok(await _appointmentService.GetByDateRangeAsync(fromUtc, toUtc));
}
