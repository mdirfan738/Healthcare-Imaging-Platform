using Hl7.Fhir.Model;

namespace PACS.Infrastructure.Hl7Fhir;

// Maps internal Patient entities to HL7 FHIR R4 Patient resources for interoperability
// with external EHR/HIS systems (e.g. via a /fhir/Patient endpoint or HL7 v2 ADT feed bridge).
public static class FhirPatientMapper
{
    public static Hl7.Fhir.Model.Patient ToFhirPatient(PACS.Domain.Entities.Patient patient)
    {
        var fhirPatient = new Hl7.Fhir.Model.Patient
        {
            Id = patient.Id.ToString(),

            Identifier = new List<Identifier>
            {
                new()
                {
                    System = "urn:pacs:mrn",
                    Value = patient.PatientNumber
                }
            },

            Name = new List<HumanName>
            {
                new()
                {
                    Family = patient.LastName,
                    Given = new[] { patient.FirstName }
                }
            },

            Gender = patient.Gender?.ToLowerInvariant() switch
            {
                "male" => AdministrativeGender.Male,
                "female" => AdministrativeGender.Female,
                "other" => AdministrativeGender.Other,
                _ => AdministrativeGender.Unknown
            },

            BirthDate = patient.DateOfBirth.ToString("yyyy-MM-dd")
        };

        if (!string.IsNullOrWhiteSpace(patient.PhoneNumber))
        {
            fhirPatient.Telecom = new List<ContactPoint>
            {
                new()
                {
                    System = ContactPoint.ContactPointSystem.Phone,
                    Value = patient.PhoneNumber
                }
            };
        }

        return fhirPatient;
    }


    // Builds a minimal HL7 v2 ADT^A04 (register patient) message for legacy interfaces.
    public static string ToHl7v2Adt(PACS.Domain.Entities.Patient patient)
    {
        var msh =
            $"MSH|^~\\&|PACS|RADIOLOGY|HIS|HOSPITAL|{DateTime.UtcNow:yyyyMMddHHmmss}||ADT^A04|{Guid.NewGuid()}|P|2.5";

        var pid =
            $"PID|1||{patient.PatientNumber}||{patient.LastName}^{patient.FirstName}||{patient.DateOfBirth:yyyyMMdd}|{(string.IsNullOrWhiteSpace(patient.Gender) ? "U" : patient.Gender[..1].ToUpper())}";

        return $"{msh}\r{pid}";
    }
}