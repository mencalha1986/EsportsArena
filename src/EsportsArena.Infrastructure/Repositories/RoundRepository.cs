using EsportsArena.Domain.Entities;
using EsportsArena.Domain.Interfaces;
using EsportsArena.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EsportsArena.Infrastructure.Repositories;

public sealed class RoundRepository : BaseRepository<Round>, IRoundRepository
{
    public RoundRepository(AppDbContext context) : base(context) { }

    public async Task<List<Round>> GetByChampionshipAsync(Guid championshipId, CancellationToken ct = default)
        => await Context.Rounds
            .Where(r => r.ChampionshipId == championshipId)
            .OrderBy(r => r.Number)
            .ToListAsync(ct);

    public async Task AddRangeAsync(IEnumerable<Round> rounds, CancellationToken ct = default)
        => await Context.Rounds.AddRangeAsync(rounds, ct);
}
