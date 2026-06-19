using EsportsArena.Domain.Entities;
using EsportsArena.Domain.Interfaces;
using EsportsArena.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EsportsArena.Infrastructure.Repositories;

public sealed class ChampionshipRepository : BaseRepository<Championship>, IChampionshipRepository
{
    public ChampionshipRepository(AppDbContext context) : base(context) { }

    public async Task<List<Championship>> GetByFiltersAsync(Guid? gameId, string? status, CancellationToken ct = default)
    {
        var query = Context.Championships.AsQueryable();
        if (gameId.HasValue) query = query.Where(c => c.GameId == gameId.Value);
        if (!string.IsNullOrWhiteSpace(status)) query = query.Where(c => c.Status.ToString() == status);
        return await query.OrderByDescending(c => c.CreatedAt).ToListAsync(ct);
    }
}
