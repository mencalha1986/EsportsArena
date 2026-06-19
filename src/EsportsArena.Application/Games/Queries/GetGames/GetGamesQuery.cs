using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Games.Queries.GetGames;

public record GetGamesQuery : IRequest<Result<IReadOnlyList<GameDto>>>;

public record GameDto(Guid Id, string Name, string Slug, string Category, string InscriptionMode, string ScoreDisplay, string? IconUrl);
