using EsportsArena.Domain.Entities;

namespace EsportsArena.Domain.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<User?> GetByPlatformIdAsync(string platformId, CancellationToken ct = default);
    Task<bool> PlatformIdExistsAsync(string platformId, CancellationToken ct = default);
    Task<bool> EmailExistsAsync(string email, CancellationToken ct = default);
    Task<List<string>> SuggestAvailableIdsAsync(string basePlatformId, int count = 3, CancellationToken ct = default);
    Task<List<User>> SearchByEmailOrPlatformIdAsync(string query, int limit = 10, CancellationToken ct = default);
    Task<List<User>> GetByIdsAsync(IEnumerable<Guid> ids, CancellationToken ct = default);
}
