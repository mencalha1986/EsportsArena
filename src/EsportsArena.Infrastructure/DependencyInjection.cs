using System.Data;
using EsportsArena.Application.Common;
using EsportsArena.Domain.Interfaces;
using EsportsArena.Infrastructure.Persistence;
using EsportsArena.Infrastructure.Repositories;
using EsportsArena.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace EsportsArena.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")!;

        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<AppDbContext>());
        services.AddScoped<IDbConnection>(_ => new NpgsqlConnection(connectionString));

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IGameRepository, GameRepository>();
        services.AddScoped<ILicensedTeamRepository, LicensedTeamRepository>();
        services.AddScoped<IChampionshipRepository, ChampionshipRepository>();
        services.AddScoped<IEnrollmentRepository, EnrollmentRepository>();
        services.AddScoped<IRoundRepository, RoundRepository>();
        services.AddScoped<IMatchRepository, MatchRepository>();
        services.AddScoped<IDraftEventRepository, DraftEventRepository>();

        services.AddSingleton<ILeagueEngineService, LeagueEngineService>();
        services.AddScoped<ITokenService, JwtTokenService>();
        services.AddScoped<IPasswordHasher, BcryptPasswordHasher>();

        return services;
    }
}
