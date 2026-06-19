using EsportsArena.Domain.Entities;

namespace EsportsArena.Domain.Interfaces;

public interface IChampionshipRepository : IRepository<Championship>
{
    Task<List<Championship>> GetByFiltersAsync(Guid? gameId, string? status, Guid? organizerId = null, CancellationToken ct = default);
}
