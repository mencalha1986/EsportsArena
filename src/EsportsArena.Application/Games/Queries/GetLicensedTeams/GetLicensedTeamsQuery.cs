using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Games.Queries.GetLicensedTeams;

public record GetLicensedTeamsQuery(Guid GameId, byte? MinStars, byte? MaxStars)
    : IRequest<Result<IReadOnlyList<LicensedTeamDto>>>;

public record LicensedTeamDto(Guid Id, string Name, byte Stars, string? LogoUrl);
