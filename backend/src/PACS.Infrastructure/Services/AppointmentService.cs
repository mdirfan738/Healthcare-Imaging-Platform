using Microsoft.EntityFrameworkCore;
using PACS.Application.DTOs;
using PACS.Application.Interfaces;
using PACS.Domain.Entities;
using PACS.Infrastructure.Data;

namespace PACS.Infrastructure.Services;

public class AppointmentService : IAppointmentService
{
    private readonly ApplicationDbContext _db;
    private readonly IAuditLogService _audit;

    public AppointmentService(ApplicationDbContext db, IAuditLogService audit)
    {
        _db = db; _audit = audit;
    }

    public async Task<AppointmentResponse> CreateAsync(CreateAppointmentRequest request, string actor, string ip)
    {
        var patient = await _db.Patients.FindAsync(request.PatientId) ?? throw new KeyNotFoundException("Patient not found.");

        var appt = new Appointment
        {
            PatientId = request.PatientId,
            ScheduledAtUtc = request.ScheduledAtUtc,
            ModalityRequested = request.ModalityRequested,
            Reason = request.Reason
        };
        _db.Appointments.Add(appt);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(null, actor, "APPOINTMENT_CREATE", "Appointment", appt.Id.ToString(), ip);

        return new AppointmentResponse(appt.Id, appt.PatientId, $"{patient.FirstName} {patient.LastName}",
            appt.ScheduledAtUtc, appt.ModalityRequested, appt.Reason, appt.Status, appt.AssignedTechnologistId);
    }

    public async Task<AppointmentResponse> UpdateAsync(Guid id, UpdateAppointmentRequest request, string actor, string ip)
    {
        var appt = await _db.Appointments.Include(a => a.Patient).FirstOrDefaultAsync(a => a.Id == id)
            ?? throw new KeyNotFoundException("Appointment not found.");

        appt.ScheduledAtUtc = request.ScheduledAtUtc;
        appt.Status = request.Status;
        appt.AssignedTechnologistId = request.AssignedTechnologistId;
        appt.UpdatedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        await _audit.LogAsync(null, actor, "APPOINTMENT_UPDATE", "Appointment", id.ToString(), ip);

        return new AppointmentResponse(appt.Id, appt.PatientId, $"{appt.Patient!.FirstName} {appt.Patient.LastName}",
            appt.ScheduledAtUtc, appt.ModalityRequested, appt.Reason, appt.Status, appt.AssignedTechnologistId);
    }

    public async Task<IEnumerable<AppointmentResponse>> GetByDateRangeAsync(DateTime fromUtc, DateTime toUtc)
    {
        return await _db.Appointments.AsNoTracking().Include(a => a.Patient)
            .Where(a => a.ScheduledAtUtc >= fromUtc && a.ScheduledAtUtc <= toUtc)
            .OrderBy(a => a.ScheduledAtUtc)
            .Select(a => new AppointmentResponse(a.Id, a.PatientId, $"{a.Patient!.FirstName} {a.Patient.LastName}",
                a.ScheduledAtUtc, a.ModalityRequested, a.Reason, a.Status, a.AssignedTechnologistId))
            .ToListAsync();
    }
}
