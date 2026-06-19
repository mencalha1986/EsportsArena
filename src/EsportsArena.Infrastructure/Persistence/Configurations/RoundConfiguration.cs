using EsportsArena.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EsportsArena.Infrastructure.Persistence.Configurations;

public sealed class RoundConfiguration : IEntityTypeConfiguration<Round>
{
    public void Configure(EntityTypeBuilder<Round> builder)
    {
        builder.HasKey(r => r.Id);
        builder.Property(r => r.ChampionshipId).IsRequired();
        builder.Property(r => r.Number).IsRequired();
        builder.Property(r => r.Label).HasMaxLength(100);
        builder.Property(r => r.CreatedAt).IsRequired();
        builder.HasIndex(r => new { r.ChampionshipId, r.Number }).IsUnique();
        builder.HasOne<Championship>().WithMany().HasForeignKey(r => r.ChampionshipId);
        builder.ToTable("rounds");
    }
}
