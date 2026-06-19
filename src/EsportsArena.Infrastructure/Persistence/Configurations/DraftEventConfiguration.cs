using EsportsArena.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EsportsArena.Infrastructure.Persistence.Configurations;

public sealed class DraftEventConfiguration : IEntityTypeConfiguration<DraftEvent>
{
    public void Configure(EntityTypeBuilder<DraftEvent> builder)
    {
        builder.HasKey(d => d.Id);
        builder.Property(d => d.ChampionshipId).IsRequired();
        builder.Property(d => d.EnrollmentId).IsRequired();
        builder.Property(d => d.LicensedTeamId).IsRequired();
        builder.Property(d => d.DrawnAt).IsRequired();
        builder.Property(d => d.CreatedAt).IsRequired();
        builder.HasOne<Championship>().WithMany().HasForeignKey(d => d.ChampionshipId);
        builder.HasOne<Enrollment>().WithMany().HasForeignKey(d => d.EnrollmentId);
        builder.HasOne<LicensedTeam>().WithMany().HasForeignKey(d => d.LicensedTeamId);
        builder.ToTable("draft_events");
    }
}
