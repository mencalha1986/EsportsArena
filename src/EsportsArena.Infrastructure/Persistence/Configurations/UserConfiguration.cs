using EsportsArena.Domain.Entities;
using EsportsArena.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EsportsArena.Infrastructure.Persistence.Configurations;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);
        builder.Property(u => u.SupabaseUid).HasMaxLength(256);
        builder.Property(u => u.Email).IsRequired().HasMaxLength(256);
        builder.Property(u => u.PasswordHash).IsRequired().HasMaxLength(256);
        builder.Property(u => u.PlatformId).IsRequired().HasMaxLength(30);
        builder.Property(u => u.DisplayName).IsRequired().HasMaxLength(100);
        builder.Property(u => u.AvatarUrl).HasMaxLength(1000);
        builder.Property(u => u.Role)
            .IsRequired()
            .HasDefaultValue(UserRole.Player)
            .HasConversion<string>();
        builder.Property(u => u.IsActive)
            .IsRequired()
            .HasDefaultValue(true);
        builder.Property(u => u.SubscriptionNotes).HasMaxLength(500);
        builder.Property(u => u.CreatedAt).IsRequired();
        builder.Property(u => u.UpdatedAt).IsRequired();
        builder.HasIndex(u => u.SupabaseUid).IsUnique().HasFilter("supabase_uid IS NOT NULL");
        builder.HasIndex(u => u.Email).IsUnique();
        builder.HasIndex(u => u.PlatformId).IsUnique();
        builder.ToTable("users");
    }
}
