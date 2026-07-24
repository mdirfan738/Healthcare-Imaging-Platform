using PACS.Application.DTOs;

namespace PACS.Application.Interfaces;

public interface IAppointmentService
{
    Task<AppointmentResponse> CreateAsync(CreateAppointmentRequest request, string actor, string ip);
    Task<AppointmentResponse> UpdateAsync(Guid id, UpdateAppointmentRequest request, string actor, string ip);
    Task<IEnumerable<AppointmentResponse>> GetByDateRangeAsync(DateTime fromUtc, DateTime toUtc);
}
