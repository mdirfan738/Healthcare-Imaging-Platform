using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PACS.Application.DTOs;
using PACS.Application.Interfaces;

namespace PACS.Api.Controllers;

[ApiController]
[Route("api/v1/patients")]
[Authorize]
public class PatientsController : ControllerBase
{
    private readonly IPatientService _patientService;

    public PatientsController(IPatientService patientService) => _patientService = patientService;

    private string Actor => User.Identity?.Name ?? "unknown";
    private string ClientIp => HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

    /// <summary>Registers a new patient. Roles: Admin, Receptionist, Technologist.</summary>
    [HttpPost]
    [Authorize(Roles = "Admin,Receptionist,Technologist")]
    [ProducesResponseType(typeof(PatientResponse), 201)]
    public async Task<ActionResult<PatientResponse>> Create([FromBody] CreatePatientRequest request)
    {
        var result = await _patientService.CreateAsync(request, Actor, ClientIp);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>Updates an existing patient's demographic/contact details.</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Receptionist")]
    [ProducesResponseType(typeof(PatientResponse), 200)]
    public async Task<ActionResult<PatientResponse>> Update(Guid id, [FromBody] UpdatePatientRequest request)
        => Ok(await _patientService.UpdateAsync(id, request, Actor, ClientIp));

    /// <summary>Soft-deletes a patient record (preserves history for compliance).</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(204)]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _patientService.DeleteAsync(id, Actor, ClientIp);
        return NoContent();
    }

    /// <summary>Retrieves a patient by ID.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(PatientResponse), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<PatientResponse>> GetById(Guid id)
    {
        var result = await _patientService.GetByIdAsync(id);
        return result is null ? NotFound() : Ok(result);
    }

    /// <summary>Searches patients by name, patient number (MRN), or national ID.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<PatientResponse>), 200)]
    public async Task<ActionResult<PagedResult<PatientResponse>>> Search([FromQuery] PatientSearchQuery query)
        => Ok(await _patientService.SearchAsync(query));
}
