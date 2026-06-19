using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Championships.Queries.GetStandings;

public record GetStandingsQuery(Guid ChampionshipId) : IRequest<Result<IReadOnlyList<StandingRowDto>>>;

public record StandingRowDto(
    Guid EnrollmentId,
    string PlayerPlatformId,
    string DisplayName,
    string? TeamName,
    string? TeamLogoUrl,
    int Points,
    int Played,
    int Wins,
    int Draws,
    int Losses,
    int GoalsFor,
    int GoalsAgainst,
    int GoalDiff,
    double WinPct);
