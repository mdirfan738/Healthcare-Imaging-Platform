using PACS.Application.DTOs;

namespace PACS.Application.Interfaces;

public interface IPatientService
{
    Task<PatientResponse> CreateAsync(CreatePatientRequest request, string actor, string ip);
    Task<PatientResponse> UpdateAsync(Guid id, UpdatePatientRequest request, string actor, string ip);
    Task DeleteAsync(Guid id, string actor, string ip);
    Task<PatientResponse?> GetByIdAsync(Guid id);
    Task<PagedResult<PatientResponse>> SearchAsync(PatientSearchQuery query);
}
