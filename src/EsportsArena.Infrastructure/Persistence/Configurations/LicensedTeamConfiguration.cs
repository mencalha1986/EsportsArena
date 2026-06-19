using EsportsArena.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EsportsArena.Infrastructure.Persistence.Configurations;

public sealed class LicensedTeamConfiguration : IEntityTypeConfiguration<LicensedTeam>
{
    public void Configure(EntityTypeBuilder<LicensedTeam> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.GameId).IsRequired();
        builder.Property(t => t.Name).IsRequired().HasMaxLength(150);
        builder.Property(t => t.LogoUrl).HasMaxLength(1000);
        builder.Property(t => t.Stars).IsRequired();
        builder.Property(t => t.CreatedAt).IsRequired();
        builder.HasIndex(t => new { t.GameId, t.Stars });
        builder.HasOne<Game>().WithMany().HasForeignKey(t => t.GameId).OnDelete(DeleteBehavior.Cascade);
        builder.ToTable("licensed_teams");
    }
}
