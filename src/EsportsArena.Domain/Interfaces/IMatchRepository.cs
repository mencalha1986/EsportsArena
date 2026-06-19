using EsportsArena.Domain.Entities;

namespace EsportsArena.Domain.Interfaces;

public interface IMatchRepository : IRepository<Match>
{
    Task<List<Match>> GetFutureMatchesByEnrollmentAsync(Guid enrollmentId, CancellationToken ct = default);
    Task<List<Match>> GetByRoundAsync(Guid roundId, CancellationToken ct = default);
    Task AddRangeAsync(IEnumerable<Match> matches, CancellationToken ct = default);
}
