using EsportsArena.Domain.Entities;

namespace EsportsArena.Domain.Interfaces;

public interface IDraftEventRepository : IRepository<DraftEvent>
{
    Task<List<DraftEvent>> GetByChampionshipAsync(Guid championshipId, CancellationToken ct = default);
    Task AddRangeAsync(IEnumerable<DraftEvent> events, CancellationToken ct = default);
}
