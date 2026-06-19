using EsportsArena.Domain.Entities;

namespace EsportsArena.Domain.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetBySupabaseUidAsync(string supabaseUid, CancellationToken ct = default);
    Task<User?> GetByPlatformIdAsync(string platformId, CancellationToken ct = default);
    Task<bool> PlatformIdExistsAsync(string platformId, CancellationToken ct = default);
    Task<List<string>> SuggestAvailableIdsAsync(string basePlatformId, int count = 3, CancellationToken ct = default);
}
