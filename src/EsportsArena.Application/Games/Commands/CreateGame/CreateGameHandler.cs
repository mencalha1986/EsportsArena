using EsportsArena.Domain.Common;
using EsportsArena.Domain.Entities;
using EsportsArena.Domain.Interfaces;
using MediatR;

namespace EsportsArena.Application.Games.Commands.CreateGame;

public sealed class CreateGameHandler : IRequestHandler<CreateGameCommand, Result<Guid>>
{
    private readonly IGameRepository _games;
    private readonly IUnitOfWork _uow;

    public CreateGameHandler(IGameRepository games, IUnitOfWork uow) { _games = games; _uow = uow; }

    public async Task<Result<Guid>> Handle(CreateGameCommand request, CancellationToken ct)
    {
        if (await _games.GetBySlugAsync(request.Slug, ct) is not null)
            return Result<Guid>.Failure($"Jogo com slug '{request.Slug}' já existe.");

        var result = Game.Create(request.Name, request.Slug, request.InscriptionMode, request.ScoreDisplay, request.IconUrl, request.Category);
        if (!result.IsSuccess) return Result<Guid>.Failure(result.Error);

        await _games.AddAsync(result.Value, ct);
        await _uow.CommitAsync(ct);
        return Result<Guid>.Success(result.Value.Id);
    }
}
