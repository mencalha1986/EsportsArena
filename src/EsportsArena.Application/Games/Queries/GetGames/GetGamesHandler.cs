using EsportsArena.Domain.Common;
using EsportsArena.Domain.Interfaces;
using MediatR;

namespace EsportsArena.Application.Games.Queries.GetGames;

public sealed class GetGamesHandler : IRequestHandler<GetGamesQuery, Result<IReadOnlyList<GameDto>>>
{
    private readonly IGameRepository _games;

    public GetGamesHandler(IGameRepository games) => _games = games;

    public async Task<Result<IReadOnlyList<GameDto>>> Handle(GetGamesQuery request, CancellationToken ct)
    {
        var games = await _games.GetActiveGamesAsync(ct);
        var dtos = games.Select(g => new GameDto(g.Id, g.Name, g.Slug, g.Category, g.InscriptionMode.ToString(), g.ScoreDisplay, g.IconUrl))
                        .ToList();
        return Result<IReadOnlyList<GameDto>>.Success(dtos);
    }
}
