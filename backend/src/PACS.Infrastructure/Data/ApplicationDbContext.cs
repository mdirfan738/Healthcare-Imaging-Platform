using Microsoft.EntityFrameworkCore;
using PACS.Domain.Entities;

namespace PACS.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<Study> Studies => Set<Study>();
    public DbSet<Series> SeriesList => Set<Series>();
    public DbSet<Image> Images => Set<Image>();
    public DbSet<Report> Reports => Set<Report>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ---- Global soft-delete filters ----
        modelBuilder.Entity<Patient>().HasQueryFilter(p => !p.IsDeleted);
        modelBuilder.Entity<Study>().HasQueryFilter(s => !s.IsDeleted);
        modelBuilder.Entity<Report>().HasQueryFilter(r => !r.IsDeleted);
        modelBuilder.Entity<Appointment>().HasQueryFilter(a => !a.IsDeleted);

        // ---- Patient ----
        modelBuilder.Entity<Patient>(e =>
        {
            e.HasIndex(p => p.PatientNumber).IsUnique();
            e.HasIndex(p => new { p.LastName, p.FirstName });
            e.HasIndex(p => p.DateOfBirth);
            e.HasIndex(p => p.NationalId);
            e.Property(p => p.PatientNumber).HasMaxLength(64).IsRequired();
            e.Property(p => p.FirstName).HasMaxLength(100).IsRequired();
            e.Property(p => p.LastName).HasMaxLength(100).IsRequired();
        });

        // ---- Appointment ----
        modelBuilder.Entity<Appointment>(e =>
        {
            e.HasOne(a => a.Patient).WithMany(p => p.Appointments).HasForeignKey(a => a.PatientId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(a => a.ScheduledAtUtc);
        });

        // ---- Study ----
        modelBuilder.Entity<Study>(e =>
        {
            e.HasIndex(s => s.StudyInstanceUid).IsUnique();
            e.HasIndex(s => s.AccessionNumber).IsUnique();
            e.HasIndex(s => s.ScheduledDateUtc);
            e.HasIndex(s => s.Status);
            e.HasIndex(s => s.AssignedRadiologistId);
            e.HasOne(s => s.Patient).WithMany(p => p.Studies).HasForeignKey(s => s.PatientId).OnDelete(DeleteBehavior.Restrict);
        });

        // ---- Series ----
        modelBuilder.Entity<Series>(e =>
        {
            e.HasIndex(s => s.SeriesInstanceUid).IsUnique();
            e.HasOne(s => s.Study).WithMany(st => st.SeriesList).HasForeignKey(s => s.StudyId).OnDelete(DeleteBehavior.Cascade);
        });

        // ---- Image ----
        modelBuilder.Entity<Image>(e =>
        {
            e.HasIndex(i => i.SopInstanceUid).IsUnique();
            e.HasOne(i => i.Series).WithMany(s => s.Images).HasForeignKey(i => i.SeriesId).OnDelete(DeleteBehavior.Cascade);
        });

        // ---- Report ----
        modelBuilder.Entity<Report>(e =>
        {
            e.HasOne(r => r.Study).WithMany(s => s.Reports).HasForeignKey(r => r.StudyId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(r => r.Status);
            e.HasIndex(r => r.StudyId);
        });

        // ---- User / Role ----
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Username).IsUnique();
            e.HasIndex(u => u.Email).IsUnique();
            e.HasOne(u => u.Role).WithMany(r => r.Users).HasForeignKey(u => u.RoleId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Role>(e =>
        {
            e.HasIndex(r => r.Name).IsUnique();
        });

        // ---- AuditLog ----
        modelBuilder.Entity<AuditLog>(e =>
        {
            e.HasIndex(a => a.CreatedAtUtc);
            e.HasIndex(a => new { a.EntityType, a.EntityId });
            e.HasIndex(a => a.UserId);
            e.HasIndex(a => a.Action);
        });
    }
}
