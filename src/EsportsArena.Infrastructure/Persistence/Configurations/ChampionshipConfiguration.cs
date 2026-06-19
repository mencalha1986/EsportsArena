using EsportsArena.Domain.Entities;
using EsportsArena.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EsportsArena.Infrastructure.Persistence.Configurations;

public sealed class ChampionshipConfiguration : IEntityTypeConfiguration<Championship>
{
    public void Configure(EntityTypeBuilder<Championship> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.GameId).IsRequired();
        builder.Property(c => c.OrganizerId).IsRequired();
        builder.Property(c => c.Name).IsRequired().HasMaxLength(150);
        builder.Property(c => c.Description).HasMaxLength(500);
        builder.Property(c => c.Status).IsRequired().HasConversion<string>();
        builder.Property(c => c.Format).IsRequired().HasConversion<string>();
        builder.Property(c => c.MinStars).HasColumnType("smallint");
        builder.Property(c => c.MaxStars).HasColumnType("smallint");
        builder.Property(c => c.CreatedAt).IsRequired();
        builder.Property(c => c.UpdatedAt).IsRequired();
        builder.HasOne<Game>().WithMany().HasForeignKey(c => c.GameId);
        builder.HasOne<User>().WithMany().HasForeignKey(c => c.OrganizerId);
        builder.ToTable("championships");
    }
}
