using EsportsArena.Domain.Entities;
using EsportsArena.Domain.Interfaces;
using EsportsArena.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EsportsArena.Infrastructure.Repositories;

public sealed class LicensedTeamRepository : BaseRepository<LicensedTeam>, ILicensedTeamRepository
{
    public LicensedTeamRepository(AppDbContext context) : base(context) { }

    public async Task<List<LicensedTeam>> GetEligibleTeamsAsync(
        Guid gameId, byte? minStars, byte? maxStars, CancellationToken ct = default)
    {
        var query = Context.LicensedTeams.Where(t => t.GameId == gameId);
        if (minStars.HasValue) query = query.Where(t => t.Stars >= minStars.Value);
        if (maxStars.HasValue) query = query.Where(t => t.Stars <= maxStars.Value);
        return await query.OrderBy(t => t.Name).ToListAsync(ct);
    }

    public async Task<List<LicensedTeam>> GetByGameAsync(Guid gameId, CancellationToken ct = default)
        => await Context.LicensedTeams.Where(t => t.GameId == gameId).OrderBy(t => t.Stars).ThenBy(t => t.Name).ToListAsync(ct);
}
