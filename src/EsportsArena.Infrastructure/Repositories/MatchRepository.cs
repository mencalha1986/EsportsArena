using EsportsArena.Domain.Entities;
using EsportsArena.Domain.Enums;
using EsportsArena.Domain.Interfaces;
using EsportsArena.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EsportsArena.Infrastructure.Repositories;

public sealed class MatchRepository : BaseRepository<Match>, IMatchRepository
{
    public MatchRepository(AppDbContext context) : base(context) { }

    public async Task<List<Match>> GetFutureMatchesByEnrollmentAsync(Guid enrollmentId, CancellationToken ct = default)
        => await Context.Matches
            .Where(m => (m.HomeEnrollmentId == enrollmentId || m.AwayEnrollmentId == enrollmentId)
                        && m.Status == MatchStatus.Pending)
            .ToListAsync(ct);

    public async Task<List<Match>> GetByRoundAsync(Guid roundId, CancellationToken ct = default)
        => await Context.Matches.Where(m => m.RoundId == roundId).ToListAsync(ct);

    public async Task AddRangeAsync(IEnumerable<Match> matches, CancellationToken ct = default)
        => await Context.Matches.AddRangeAsync(matches, ct);
}
