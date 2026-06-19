using EsportsArena.Domain.Entities;

namespace EsportsArena.Domain.Interfaces;

public interface IGameRepository : IRepository<Game>
{
    Task<List<Game>> GetActiveGamesAsync(CancellationToken ct = default);
    Task<Game?> GetBySlugAsync(string slug, CancellationToken ct = default);
}
