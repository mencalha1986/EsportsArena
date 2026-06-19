using EsportsArena.Domain.Common;
using EsportsArena.Domain.Entities;
using EsportsArena.Domain.Enums;
using EsportsArena.Domain.Interfaces;
using MediatR;

namespace EsportsArena.Application.Enrollments.Commands.EnrollUser;

public sealed class EnrollUserHandler : IRequestHandler<EnrollUserCommand, Result<Guid>>
{
    private readonly IChampionshipRepository _championships;
    private readonly IGameRepository _games;
    private readonly IEnrollmentRepository _enrollments;
    private readonly IUnitOfWork _uow;

    public EnrollUserHandler(
        IChampionshipRepository championships,
        IGameRepository games,
        IEnrollmentRepository enrollments,
        IUnitOfWork uow)
    {
        _championships = championships;
        _games = games;
        _enrollments = enrollments;
        _uow = uow;
    }

    public async Task<Result<Guid>> Handle(EnrollUserCommand request, CancellationToken ct)
    {
        var championship = await _championships.GetByIdAsync(request.ChampionshipId, ct);
        if (championship is null) return Result<Guid>.Failure("Campeonato não encontrado.");
        if (championship.Status != ChampionshipStatus.EnrollmentsOpen)
            return Result<Guid>.Failure("As inscrições não estão abertas.");

        var game = await _games.GetByIdAsync(championship.GameId, ct);
        if (game is null) return Result<Guid>.Failure("Jogo não encontrado.");

        if (game.InscriptionMode == InscriptionMode.OwnIdentity && string.IsNullOrWhiteSpace(request.IdentityName))
            return Result<Guid>.Failure("Nome de identidade é obrigatório para este modo de jogo.");

        if (await _enrollments.ExistsAsync(request.ChampionshipId, request.UserId, ct))
            return Result<Guid>.Failure("Usuário já inscrito neste campeonato.");

        var identityName = game.InscriptionMode == InscriptionMode.OwnIdentity ? request.IdentityName : null;
        var result = Enrollment.Create(request.ChampionshipId, request.UserId, identityName);
        if (!result.IsSuccess) return Result<Guid>.Failure(result.Error);

        await _enrollments.AddAsync(result.Value, ct);
        await _uow.CommitAsync(ct);
        return Result<Guid>.Success(result.Value.Id);
    }
}
