using EsportsArena.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EsportsArena.Infrastructure.Persistence.Configurations;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);
        builder.Property(u => u.SupabaseUid).IsRequired().HasMaxLength(256);
        builder.Property(u => u.PlatformId).IsRequired().HasMaxLength(30);
        builder.Property(u => u.DisplayName).IsRequired().HasMaxLength(100);
        builder.Property(u => u.AvatarUrl).HasMaxLength(1000);
        builder.Property(u => u.CreatedAt).IsRequired();
        builder.Property(u => u.UpdatedAt).IsRequired();
        builder.HasIndex(u => u.SupabaseUid).IsUnique();
        builder.HasIndex(u => u.PlatformId).IsUnique();
        builder.ToTable("users");
    }
}
