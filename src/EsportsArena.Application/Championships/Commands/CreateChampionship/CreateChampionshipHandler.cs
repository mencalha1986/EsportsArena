using EsportsArena.Domain.Common;
using EsportsArena.Domain.Entities;
using EsportsArena.Domain.Enums;
using EsportsArena.Domain.Interfaces;
using MediatR;

namespace EsportsArena.Application.Championships.Commands.CreateChampionship;

public sealed class CreateChampionshipHandler : IRequestHandler<CreateChampionshipCommand, Result<Guid>>
{
    private readonly IChampionshipRepository _championships;
    private readonly IGameRepository _games;
    private readonly IUnitOfWork _uow;

    public CreateChampionshipHandler(IChampionshipRepository championships, IGameRepository games, IUnitOfWork uow)
    {
        _championships = championships; _games = games; _uow = uow;
    }

    public async Task<Result<Guid>> Handle(CreateChampionshipCommand request, CancellationToken ct)
    {
        var game = await _games.GetByIdAsync(request.GameId, ct);
        if (game is null) return Result<Guid>.Failure("Jogo não encontrado.");

        // Stars filter only applies for licensed teams mode
        if (game.InscriptionMode == InscriptionMode.OwnIdentity && (request.MinStars.HasValue || request.MaxStars.HasValue))
            return Result<Guid>.Failure("Filtro de estrelas não se aplica ao modo identidade própria.");

        var result = Championship.Create(
            request.GameId, request.OrganizerId, request.Name, request.Format,
            request.Description, request.MinStars, request.MaxStars);
        if (!result.IsSuccess) return Result<Guid>.Failure(result.Error);

        await _championships.AddAsync(result.Value, ct);
        await _uow.CommitAsync(ct);
        return Result<Guid>.Success(result.Value.Id);
    }
}
