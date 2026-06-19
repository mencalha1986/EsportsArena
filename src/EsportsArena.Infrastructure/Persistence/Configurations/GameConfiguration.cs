using EsportsArena.Domain.Entities;
using EsportsArena.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EsportsArena.Infrastructure.Persistence.Configurations;

public sealed class GameConfiguration : IEntityTypeConfiguration<Game>
{
    public void Configure(EntityTypeBuilder<Game> builder)
    {
        builder.HasKey(g => g.Id);
        builder.Property(g => g.Name).IsRequired().HasMaxLength(100);
        builder.Property(g => g.Slug).IsRequired().HasMaxLength(60);
        builder.Property(g => g.Category).IsRequired().HasMaxLength(60).HasDefaultValue("Other");
        builder.Property(g => g.InscriptionMode).IsRequired().HasConversion<string>();
        builder.Property(g => g.ScoreDisplay).IsRequired().HasMaxLength(20).HasDefaultValue("goals");
        builder.Property(g => g.IconUrl).HasMaxLength(1000);
        builder.Property(g => g.IsActive).IsRequired();
        builder.Property(g => g.CreatedAt).IsRequired();
        builder.Property(g => g.UpdatedAt).IsRequired();
        builder.HasIndex(g => g.Slug).IsUnique();
        builder.ToTable("games");
    }
}
