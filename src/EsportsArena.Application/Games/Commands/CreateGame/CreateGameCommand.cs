using EsportsArena.Domain.Common;
using EsportsArena.Domain.Enums;
using MediatR;

namespace EsportsArena.Application.Games.Commands.CreateGame;

public record CreateGameCommand(
    string Name,
    string Slug,
    InscriptionMode InscriptionMode,
    string ScoreDisplay,
    string? IconUrl,
    string Category = "Other") : IRequest<Result<Guid>>;
