using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PACS.Application.DTOs;
using PACS.Application.Interfaces;

namespace PACS.Api.Controllers;

[ApiController]
[Route("api/v1/studies")]
[Authorize]
public class StudiesController : ControllerBase
{
    private readonly IStudyService _studyService;

    public StudiesController(IStudyService studyService) => _studyService = studyService;

    private string Actor => User.Identity?.Name ?? "unknown";
    private string ClientIp => HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

    /// <summary>Creates a new imaging study for a patient.</summary>
    [HttpPost]
    [Authorize(Roles = "Admin,Technologist,Receptionist")]
    [ProducesResponseType(typeof(StudyResponse), 201)]
    public async Task<ActionResult<StudyResponse>> Create([FromBody] CreateStudyRequest request)
    {
        var result = await _studyService.CreateAsync(request, Actor, ClientIp);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>Updates study status, performed date, or radiologist assignment.</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Technologist,Radiologist")]
    [ProducesResponseType(typeof(StudyResponse), 200)]
    public async Task<ActionResult<StudyResponse>> Update(Guid id, [FromBody] UpdateStudyRequest request)
        => Ok(await _studyService.UpdateAsync(id, request, Actor, ClientIp));

    /// <summary>Retrieves a single study by ID.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(StudyResponse), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<StudyResponse>> GetById(Guid id)
    {
        var result = await _studyService.GetByIdAsync(id);
        return result is null ? NotFound() : Ok(result);
    }

    /// <summary>Searches studies by patient, modality, status, or date range.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<StudyResponse>), 200)]
    public async Task<ActionResult<PagedResult<StudyResponse>>> Search([FromQuery] StudySearchQuery query)
        => Ok(await _studyService.SearchAsync(query));

    /// <summary>Returns the radiologist worklist: studies assigned but not yet verified/signed.</summary>
    [HttpGet("worklist/{radiologistId:guid}")]
    [Authorize(Roles = "Admin,Radiologist")]
    [ProducesResponseType(typeof(PagedResult<StudyResponse>), 200)]
    public async Task<ActionResult<PagedResult<StudyResponse>>> Worklist(Guid radiologistId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        => Ok(await _studyService.GetWorklistAsync(radiologistId, page, pageSize));
}
