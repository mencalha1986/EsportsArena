using EsportsArena.Domain.Entities;
using EsportsArena.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EsportsArena.Infrastructure.Persistence.Configurations;

public sealed class MatchConfiguration : IEntityTypeConfiguration<Match>
{
    public void Configure(EntityTypeBuilder<Match> builder)
    {
        builder.HasKey(m => m.Id);
        builder.Property(m => m.RoundId).IsRequired();
        builder.Property(m => m.HomeEnrollmentId).IsRequired();
        builder.Property(m => m.AwayEnrollmentId).IsRequired();
        builder.Property(m => m.HomeScore).HasColumnType("smallint");
        builder.Property(m => m.AwayScore).HasColumnType("smallint");
        builder.Property(m => m.Status).IsRequired().HasConversion<string>();
        builder.Property(m => m.PlayedAt);
        builder.Property(m => m.CreatedAt).IsRequired();
        builder.Property(m => m.UpdatedAt).IsRequired();
        builder.HasIndex(m => m.HomeEnrollmentId);
        builder.HasIndex(m => m.AwayEnrollmentId);
        builder.HasOne<Round>().WithMany().HasForeignKey(m => m.RoundId);
        builder.HasOne<Enrollment>().WithMany().HasForeignKey(m => m.HomeEnrollmentId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Enrollment>().WithMany().HasForeignKey(m => m.AwayEnrollmentId).OnDelete(DeleteBehavior.Restrict);
        builder.ToTable("matches");
    }
}
