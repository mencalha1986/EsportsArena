using EsportsArena.Domain.Entities;

namespace EsportsArena.Domain.Interfaces;

public interface IEnrollmentRepository : IRepository<Enrollment>
{
    Task<List<Enrollment>> GetActiveByChampionshipAsync(Guid championshipId, CancellationToken ct = default);
    Task<Enrollment?> GetByChampionshipAndUserAsync(Guid championshipId, Guid userId, CancellationToken ct = default);
    Task<bool> ExistsAsync(Guid championshipId, Guid userId, CancellationToken ct = default);
}
