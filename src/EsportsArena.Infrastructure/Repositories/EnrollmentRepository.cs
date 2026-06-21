using EsportsArena.Domain.Entities;
using EsportsArena.Domain.Enums;
using EsportsArena.Domain.Interfaces;
using EsportsArena.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EsportsArena.Infrastructure.Repositories;

public sealed class EnrollmentRepository : BaseRepository<Enrollment>, IEnrollmentRepository
{
    public EnrollmentRepository(AppDbContext context) : base(context) { }

    public async Task<List<Enrollment>> GetActiveByChampionshipAsync(Guid championshipId, CancellationToken ct = default)
        => await Context.Enrollments
            .Where(e => e.ChampionshipId == championshipId && e.WithdrewAt == null && e.Status != EnrollmentStatus.Rejected)
            .ToListAsync(ct);

    public async Task<List<Enrollment>> GetAcceptedByChampionshipAsync(Guid championshipId, CancellationToken ct = default)
        => await Context.Enrollments
            .Where(e => e.ChampionshipId == championshipId && e.WithdrewAt == null && e.Status == EnrollmentStatus.Accepted)
            .ToListAsync(ct);

    public async Task<List<Enrollment>> GetPendingByChampionshipAsync(Guid championshipId, CancellationToken ct = default)
        => await Context.Enrollments
            .Where(e => e.ChampionshipId == championshipId && e.WithdrewAt == null && e.Status == EnrollmentStatus.Pending)
            .ToListAsync(ct);

    public async Task<Enrollment?> GetByChampionshipAndUserAsync(Guid championshipId, Guid userId, CancellationToken ct = default)
        => await Context.Enrollments
            .FirstOrDefaultAsync(e => e.ChampionshipId == championshipId && e.UserId == userId, ct);

    public async Task<bool> ExistsAsync(Guid championshipId, Guid userId, CancellationToken ct = default)
        => await Context.Enrollments
            .AnyAsync(e => e.ChampionshipId == championshipId && e.UserId == userId, ct);
}
