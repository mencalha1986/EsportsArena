using EsportsArena.Domain.Entities;
using EsportsArena.Domain.Interfaces;
using EsportsArena.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EsportsArena.Infrastructure.Repositories;

public sealed class UserRepository : BaseRepository<User>, IUserRepository
{
    public UserRepository(AppDbContext context) : base(context) { }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken ct = default)
        => await Context.Users.FirstOrDefaultAsync(u => u.Email == email.ToLowerInvariant(), ct);

    public async Task<User?> GetByPlatformIdAsync(string platformId, CancellationToken ct = default)
        => await Context.Users.FirstOrDefaultAsync(u => u.PlatformId == platformId.ToLowerInvariant(), ct);

    public async Task<bool> PlatformIdExistsAsync(string platformId, CancellationToken ct = default)
        => await Context.Users.AnyAsync(u => u.PlatformId == platformId.ToLowerInvariant(), ct);

    public async Task<bool> EmailExistsAsync(string email, CancellationToken ct = default)
        => await Context.Users.AnyAsync(u => u.Email == email.ToLowerInvariant(), ct);

    public async Task<List<string>> SuggestAvailableIdsAsync(string basePlatformId, int count = 3, CancellationToken ct = default)
    {
        var suggestions = new List<string>();
        var rng = Random.Shared;
        int attempts = 0;
        string base_ = basePlatformId.ToLowerInvariant();

        while (suggestions.Count < count && attempts < 50)
        {
            attempts++;
            var suffix = rng.Next(1, 9999).ToString();
            var candidate = $"{base_}{suffix}";
            if (candidate.Length > 30) candidate = candidate[..30];
            if (!await Context.Users.AnyAsync(u => u.PlatformId == candidate, ct))
                suggestions.Add(candidate);
        }
        return suggestions;
    }
}
