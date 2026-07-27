using Microsoft.EntityFrameworkCore;
using Moq;
using FluentAssertions;
using PACS.Application.DTOs;
using PACS.Application.Interfaces;
using PACS.Infrastructure.Data;
using PACS.Infrastructure.Services;
using Xunit;

namespace PACS.UnitTests.Services;

public class PatientServiceTests
{
    private static ApplicationDbContext CreateInMemoryDb()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    private static (PatientService svc, ApplicationDbContext db) CreateService()
    {
        var db = CreateInMemoryDb();

        var auditMock = new Mock<IAuditLogService>();
        var cacheMock = new Mock<ICacheService>();

        cacheMock
            .Setup(c => c.GetAsync<PatientResponse>(It.IsAny<string>()))
            .ReturnsAsync((PatientResponse?)null);

        var svc = new PatientService(
            db,
            auditMock.Object,
            cacheMock.Object
        );

        return (svc, db);
    }

    [Fact]
    public async Task CreateAsync_ShouldPersistPatient_AndGenerateUniquePatientNumber()
    {
        var (svc, db) = CreateService();

        var request = new CreatePatientRequest(
            "John",
            "Doe",
            new DateTime(1990, 1, 1),
            "Male",
            "555-1234",
            "john@example.com",
            "123 Main St",
            "NID001",
            "Acme Insurance",
            "INS001"
        );

        var result = await svc.CreateAsync(
            request,
            "tester",
            "127.0.0.1"
        );

        result.Id.Should().NotBeEmpty();
        result.PatientNumber.Should().StartWith("MRN");

        (await db.Patients.CountAsync()).Should().Be(1);
    }

    [Fact]
    public async Task DeleteAsync_ShouldSoftDelete_NotHardDelete()
    {
        var (svc, db) = CreateService();

        var created = await svc.CreateAsync(
            new CreatePatientRequest(
                "Jane",
                "Roe",
                new DateTime(1985, 5, 5),
                "Female",
                null,
                null,
                null,
                null,
                null,
                null
            ),
            "tester",
            "127.0.0.1"
        );

        await svc.DeleteAsync(
            created.Id,
            "tester",
            "127.0.0.1"
        );

        var raw = await db.Patients
            .IgnoreQueryFilters()
            .FirstAsync(p => p.Id == created.Id);

        raw.IsDeleted.Should().BeTrue();
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnNull_WhenPatientDoesNotExist()
    {
        var (svc, _) = CreateService();

        var result = await svc.GetByIdAsync(Guid.NewGuid());

        result.Should().BeNull();
    }

    [Fact]
    public async Task SearchAsync_ShouldFilterByName()
    {
        var (svc, _) = CreateService();

        await svc.CreateAsync(
            new CreatePatientRequest(
                "Alice",
                "Smith",
                DateTime.Now.AddYears(-30),
                "Female",
                null,
                null,
                null,
                null,
                null,
                null
            ),
            "tester",
            "127.0.0.1"
        );

        await svc.CreateAsync(
            new CreatePatientRequest(
                "Bob",
                "Jones",
                DateTime.Now.AddYears(-40),
                "Male",
                null,
                null,
                null,
                null,
                null,
                null
            ),
            "tester",
            "127.0.0.1"
        );

        // Using named record parameters ensures query fields map correctly
        var query = new PatientSearchQuery(
            PatientNumber: null,
            Name: "Alice",
            NationalId: null,
            Page: 1,
            PageSize: 10
        );

        var result = await svc.SearchAsync(query);

        result.Total.Should().Be(1);
        result.Items.Should().HaveCount(1);
        result.Items.First().FirstName.Should().Be("Alice");
    }
}
