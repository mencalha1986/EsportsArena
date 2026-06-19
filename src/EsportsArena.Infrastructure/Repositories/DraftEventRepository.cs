using EsportsArena.Domain.Entities;
using EsportsArena.Domain.Interfaces;
using EsportsArena.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EsportsArena.Infrastructure.Repositories;

public sealed class DraftEventRepository : BaseRepository<DraftEvent>, IDraftEventRepository
{
    public DraftEventRepository(AppDbContext context) : base(context) { }

    public async Task<List<DraftEvent>> GetByChampionshipAsync(Guid championshipId, CancellationToken ct = default)
        => await Context.DraftEvents.Where(d => d.ChampionshipId == championshipId).ToListAsync(ct);

    public async Task AddRangeAsync(IEnumerable<DraftEvent> events, CancellationToken ct = default)
        => await Context.DraftEvents.AddRangeAsync(events, ct);
}
