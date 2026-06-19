using EsportsArena.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EsportsArena.Infrastructure.Persistence.Configurations;

public sealed class EnrollmentConfiguration : IEntityTypeConfiguration<Enrollment>
{
    public void Configure(EntityTypeBuilder<Enrollment> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.ChampionshipId).IsRequired();
        builder.Property(e => e.UserId).IsRequired();
        builder.Property(e => e.IdentityName).HasMaxLength(100);
        builder.Property(e => e.LicensedTeamId);
        builder.Property(e => e.WithdrewAt);
        builder.Property(e => e.CreatedAt).IsRequired();
        builder.Property(e => e.UpdatedAt).IsRequired();
        builder.HasIndex(e => new { e.ChampionshipId, e.UserId }).IsUnique();
        builder.HasOne<Championship>().WithMany().HasForeignKey(e => e.ChampionshipId);
        builder.HasOne<User>().WithMany().HasForeignKey(e => e.UserId);
        builder.HasOne<LicensedTeam>().WithMany().HasForeignKey(e => e.LicensedTeamId).IsRequired(false);
        builder.ToTable("enrollments");
    }
}
