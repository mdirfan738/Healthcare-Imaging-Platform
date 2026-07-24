namespace PACS.Application.DTOs;

public record CreatePatientRequest(
    string FirstName, string LastName, DateTime DateOfBirth, string Gender,
    string? PhoneNumber, string? Email, string? Address, string? NationalId,
    string? InsuranceProvider, string? InsuranceNumber);

public record UpdatePatientRequest(
    string FirstName, string LastName, DateTime DateOfBirth, string Gender,
    string? PhoneNumber, string? Email, string? Address, string? InsuranceProvider, string? InsuranceNumber);

public record PatientResponse(
    Guid Id, string PatientNumber, string FirstName, string LastName, DateTime DateOfBirth,
    string Gender, string? PhoneNumber, string? Email, string? InsuranceProvider, DateTime CreatedAtUtc);

public record PatientSearchQuery(string? Name, string? PatientNumber, string? NationalId, int Page = 1, int PageSize = 20);
