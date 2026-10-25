using Hl7.Fhir.Model;
using PACS.Domain.Entities;
using Task = System.Threading.Tasks.Task;

namespace PACS.Infrastructure.Hl7Fhir;

// Maps a finalized/signed radiology Report entity to a FHIR R4 DiagnosticReport resource.
public static class FhirDiagnosticReportMapper
{
    public static DiagnosticReport ToFhirDiagnosticReport(Report report, Study study)
    {
        return new DiagnosticReport
        {
            Id = report.Id.ToString(),
            Status = report.Status == Domain.Enums.ReportStatus.Signed
                ? DiagnosticReport.DiagnosticReportStatus.Final
                : DiagnosticReport.DiagnosticReportStatus.Preliminary,
            Code = new CodeableConcept { Text = study.StudyDescription },
            Subject = new ResourceReference($"Patient/{study.PatientId}"),
            Conclusion = report.Impression,
            PresentedForm = new List<Attachment>
            {
                new() { ContentType = "text/plain", Data = System.Text.Encoding.UTF8.GetBytes(report.Findings) }
            }
        };
    }
}
