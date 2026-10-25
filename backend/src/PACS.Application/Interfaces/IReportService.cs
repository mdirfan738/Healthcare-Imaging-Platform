using PACS.Application.DTOs;

namespace PACS.Application.Interfaces;

public interface IReportService
{
    Task<ReportResponse> CreateAsync(CreateReportRequest request, Guid authorId, string actor, string ip);
    Task<ReportResponse> UpdateAsync(Guid id, UpdateReportRequest request, string actor, string ip);
    Task<ReportResponse> SignAsync(Guid id, Guid signerId, SignReportRequest request, string actor, string ip);
    Task<ReportResponse?> GetByIdAsync(Guid id);
}
