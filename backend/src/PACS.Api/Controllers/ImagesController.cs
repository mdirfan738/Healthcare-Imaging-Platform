using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PACS.Application.DTOs;
using PACS.Application.Interfaces;

namespace PACS.Api.Controllers;

[ApiController]
[Route("api/v1/images")]
[Authorize]
public class ImagesController : ControllerBase
{
    private readonly IImageService _imageService;
    private const long MaxUploadBytes = 200 * 1024 * 1024; // 200 MB per DICOM instance

    public ImagesController(IImageService imageService) => _imageService = imageService;

    private string Actor => User.Identity?.Name ?? "unknown";
    private string ClientIp => HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

    /// <summary>Uploads a DICOM Part 10 file (.dcm) and associates it with a series/study.</summary>
    [HttpPost("upload")]
    [Authorize(Roles = "Admin,Technologist")]
    [RequestSizeLimit(MaxUploadBytes)]
    [ProducesResponseType(typeof(ImageUploadResponse), 201)]
    public async Task<ActionResult<ImageUploadResponse>> Upload([FromForm] Guid seriesId, [FromForm] Guid studyId, IFormFile file)
    {
        if (file is null || file.Length == 0) return BadRequest(new { message = "No file uploaded." });
        await using var stream = file.OpenReadStream();
        var result = await _imageService.UploadDicomAsync(stream, seriesId, studyId, Actor, ClientIp);
        return CreatedAtAction(nameof(Upload), new { id = result.ImageId }, result);
    }

    /// <summary>Downloads a DICOM instance by image ID.</summary>
    [HttpGet("{id:guid}/download")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Download(Guid id)
    {
        var (stream, contentType, fileName) = await _imageService.DownloadDicomAsync(id, Actor, ClientIp);
        return File(stream, contentType, fileName);
    }

    /// <summary>Searches image metadata by study/series UID or modality.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<ImageMetadataResponse>), 200)]
    public async Task<ActionResult<PagedResult<ImageMetadataResponse>>> Search([FromQuery] ImageSearchQuery query)
        => Ok(await _imageService.SearchAsync(query));
}
