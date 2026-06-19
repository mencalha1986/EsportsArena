using EsportsArena.Domain.Entities;

namespace EsportsArena.Domain.Interfaces;

public interface IRoundRepository : IRepository<Round>
{
    Task<List<Round>> GetByChampionshipAsync(Guid championshipId, CancellationToken ct = default);
    Task AddRangeAsync(IEnumerable<Round> rounds, CancellationToken ct = default);
}
