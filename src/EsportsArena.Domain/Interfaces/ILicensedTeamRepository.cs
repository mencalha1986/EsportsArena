using EsportsArena.Domain.Entities;

namespace EsportsArena.Domain.Interfaces;

public interface ILicensedTeamRepository : IRepository<LicensedTeam>
{
    Task<List<LicensedTeam>> GetEligibleTeamsAsync(Guid gameId, byte? minStars, byte? maxStars, CancellationToken ct = default);
    Task<List<LicensedTeam>> GetByGameAsync(Guid gameId, CancellationToken ct = default);
}
