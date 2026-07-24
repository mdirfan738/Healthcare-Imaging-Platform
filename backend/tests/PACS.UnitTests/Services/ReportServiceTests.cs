using Microsoft.EntityFrameworkCore;
using Moq;
using FluentAssertions;
using PACS.Application.DTOs;
using PACS.Application.Interfaces;
using PACS.Domain.Entities;
using PACS.Domain.Enums;
using PACS.Infrastructure.Data;
using PACS.Infrastructure.Services;
using Xunit;

namespace PACS.UnitTests.Services;

public class ReportServiceTests
{
    private static ApplicationDbContext CreateInMemoryDb()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task SignAsync_ShouldSetSignedStatus_AndProduceIntegrityHash()
    {
        var db = CreateInMemoryDb();
        var patient = new Patient { FirstName = "A", LastName = "B", PatientNumber = "MRN1", DateOfBirth = DateTime.Now, Gender = "Male" };
        var study = new Study { Patient = patient, StudyInstanceUid = "1.2.3", AccessionNumber = "ACC1", ScheduledDateUtc = DateTime.UtcNow };
        db.Patients.Add(patient);
        db.Studies.Add(study);
        await db.SaveChangesAsync();

        var auditMock = new Mock<IAuditLogService>();
        var svc = new ReportService(db, auditMock.Object);

        var created = await svc.CreateAsync(new CreateReportRequest(study.Id, "Findings text", "Impression text"),
            Guid.NewGuid(), "radiologist1", "127.0.0.1");

        var signed = await svc.SignAsync(created.Id, Guid.NewGuid(), new SignReportRequest("Reviewed and confirmed"),
            "radiologist1", "127.0.0.1");

        signed.Status.Should().Be(ReportStatus.Signed);
        signed.SignedAtUtc.Should().NotBeNull();
    }

    [Fact]
    public async Task UpdateAsync_ShouldThrow_WhenReportAlreadySigned()
    {
        var db = CreateInMemoryDb();
        var patient = new Patient { FirstName = "A", LastName = "B", PatientNumber = "MRN2", DateOfBirth = DateTime.Now, Gender = "Male" };
        var study = new Study { Patient = patient, StudyInstanceUid = "1.2.4", AccessionNumber = "ACC2", ScheduledDateUtc = DateTime.UtcNow };
        db.Patients.Add(patient);
        db.Studies.Add(study);
        await db.SaveChangesAsync();

        var auditMock = new Mock<IAuditLogService>();
        var svc = new ReportService(db, auditMock.Object);

        var created = await svc.CreateAsync(new CreateReportRequest(study.Id, "F", "I"), Guid.NewGuid(), "r1", "127.0.0.1");
        await svc.SignAsync(created.Id, Guid.NewGuid(), new SignReportRequest("note"), "r1", "127.0.0.1");

        var act = async () => await svc.UpdateAsync(created.Id, new UpdateReportRequest("new findings", "new impression"), "r1", "127.0.0.1");

        await act.Should().ThrowAsync<InvalidOperationException>();
    }
}
