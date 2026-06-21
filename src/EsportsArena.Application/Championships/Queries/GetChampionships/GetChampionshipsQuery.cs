using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Championships.Queries.GetChampionships;

public record GetChampionshipsQuery(
    Guid? GameId,
    string? Status,
    Guid? OrganizerId,
    string? Category) : IRequest<Result<IReadOnlyList<ChampionshipListItemDto>>>;

public record ChampionshipListItemDto(
    Guid Id,
    string Name,
    string Status,
    string Format,
    Guid GameId,
    string GameName,
    string GameCategory,
    Guid OrganizerId,
    DateTime CreatedAt);
