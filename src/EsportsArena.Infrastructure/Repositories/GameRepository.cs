using EsportsArena.Domain.Entities;
using EsportsArena.Domain.Interfaces;
using EsportsArena.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EsportsArena.Infrastructure.Repositories;

public sealed class GameRepository : BaseRepository<Game>, IGameRepository
{
    public GameRepository(AppDbContext context) : base(context) { }

    public async Task<List<Game>> GetActiveGamesAsync(CancellationToken ct = default)
        => await Context.Games.Where(g => g.IsActive).OrderBy(g => g.Name).ToListAsync(ct);

    public async Task<Game?> GetBySlugAsync(string slug, CancellationToken ct = default)
        => await Context.Games.FirstOrDefaultAsync(g => g.Slug == slug.ToLowerInvariant(), ct);
}
