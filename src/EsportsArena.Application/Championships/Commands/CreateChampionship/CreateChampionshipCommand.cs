using EsportsArena.Domain.Common;
using EsportsArena.Domain.Enums;
using MediatR;

namespace EsportsArena.Application.Championships.Commands.CreateChampionship;

public record CreateChampionshipCommand(
    Guid GameId,
    Guid OrganizerId,
    string Name,
    LeagueFormat Format,
    string? Description = null,
    byte? MinStars = null,
    byte? MaxStars = null) : IRequest<Result<Guid>>;
