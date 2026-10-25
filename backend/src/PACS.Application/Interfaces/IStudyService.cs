using PACS.Application.DTOs;

namespace PACS.Application.Interfaces;

public interface IStudyService
{
    Task<StudyResponse> CreateAsync(CreateStudyRequest request, string actor, string ip);
    Task<StudyResponse> UpdateAsync(Guid id, UpdateStudyRequest request, string actor, string ip);
    Task<StudyResponse?> GetByIdAsync(Guid id);
    Task<PagedResult<StudyResponse>> SearchAsync(StudySearchQuery query);
    Task<PagedResult<StudyResponse>> GetWorklistAsync(Guid radiologistId, int page, int pageSize);
}
