using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Championships.Queries.GetChampionship;

public record GetChampionshipQuery(Guid ChampionshipId) : IRequest<Result<ChampionshipDetailDto>>;

public record ChampionshipDetailDto(
    Guid Id,
    string Name,
    string? Description,
    string Status,
    string Format,
    byte? MinStars,
    byte? MaxStars,
    Guid GameId,
    string GameName,
    string GameInscriptionMode,
    string GameScoreDisplay,
    Guid OrganizerId,
    string OrganizerPlatformId,
    DateTime CreatedAt);
