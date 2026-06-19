using EsportsArena.Domain.Entities;
using EsportsArena.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EsportsArena.Infrastructure.Persistence;

public sealed class AppDbContext : DbContext, IUnitOfWork
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Game> Games => Set<Game>();
    public DbSet<LicensedTeam> LicensedTeams => Set<LicensedTeam>();
    public DbSet<Championship> Championships => Set<Championship>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    public DbSet<Round> Rounds => Set<Round>();
    public DbSet<Match> Matches => Set<Match>();
    public DbSet<DraftEvent> DraftEvents => Set<DraftEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }

    public async Task<int> CommitAsync(CancellationToken ct = default) => await SaveChangesAsync(ct);
}
