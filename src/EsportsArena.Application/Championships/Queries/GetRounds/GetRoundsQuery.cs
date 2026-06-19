using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Championships.Queries.GetRounds;

public record GetRoundsQuery(Guid ChampionshipId) : IRequest<Result<IReadOnlyList<RoundDto>>>;

public record RoundDto(Guid Id, int Number, string? Label, IReadOnlyList<MatchDto> Matches);

public record MatchDto(
    Guid Id,
    Guid HomeEnrollmentId,
    string HomePlatformId,
    string? HomeTeamName,
    string? HomeTeamLogo,
    Guid AwayEnrollmentId,
    string AwayPlatformId,
    string? AwayTeamName,
    string? AwayTeamLogo,
    short? HomeScore,
    short? AwayScore,
    string Status,
    DateTime? PlayedAt);
