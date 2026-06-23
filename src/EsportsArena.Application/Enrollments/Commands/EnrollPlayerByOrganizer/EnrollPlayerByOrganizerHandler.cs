using EsportsArena.Domain.Common;
using EsportsArena.Domain.Entities;
using EsportsArena.Domain.Enums;
using EsportsArena.Domain.Interfaces;
using MediatR;

namespace EsportsArena.Application.Enrollments.Commands.EnrollPlayerByOrganizer;

public sealed class EnrollPlayerByOrganizerHandler : IRequestHandler<EnrollPlayerByOrganizerCommand, Result<Guid>>
{
    private readonly IChampionshipRepository _championships;
    private readonly IGameRepository _games;
    private readonly IEnrollmentRepository _enrollments;
    private readonly IUserRepository _users;
    private readonly IUnitOfWork _uow;

    public EnrollPlayerByOrganizerHandler(
        IChampionshipRepository championships,
        IGameRepository games,
        IEnrollmentRepository enrollments,
        IUserRepository users,
        IUnitOfWork uow)
    {
        _championships = championships;
        _games = games;
        _enrollments = enrollments;
        _users = users;
        _uow = uow;
    }

    public async Task<Result<Guid>> Handle(EnrollPlayerByOrganizerCommand request, CancellationToken ct)
    {
        var championship = await _championships.GetByIdAsync(request.ChampionshipId, ct);
        if (championship is null) return Result<Guid>.Failure("Campeonato não encontrado.");
        if (championship.OrganizerId != request.OrganizerId)
            return Result<Guid>.Failure("Somente o organizador pode adicionar jogadores diretamente.");
        if (championship.Status != ChampionshipStatus.EnrollmentsOpen)
            return Result<Guid>.Failure("As inscrições não estão abertas.");

        var game = await _games.GetByIdAsync(championship.GameId, ct);
        if (game is null) return Result<Guid>.Failure("Jogo não encontrado.");

        if (game.InscriptionMode == InscriptionMode.OwnIdentity && string.IsNullOrWhiteSpace(request.IdentityName))
            return Result<Guid>.Failure("Nome de identidade é obrigatório para este modo de jogo.");

        var target = await _users.GetByIdAsync(request.TargetUserId, ct);
        if (target is null) return Result<Guid>.Failure("Jogador não encontrado.");

        var existing = await _enrollments.GetByChampionshipAndUserAsync(request.ChampionshipId, request.TargetUserId, ct);
        if (existing is not null)
        {
            return existing.Status.ToString() switch
            {
                "Accepted" => Result<Guid>.Failure("Jogador já está inscrito e aceito neste campeonato."),
                "Pending"  => Result<Guid>.Failure("Jogador já possui inscrição pendente neste campeonato."),
                "Rejected" => Result<Guid>.Failure("Jogador teve inscrição rejeitada. Remova a rejeição antes de readicioná-lo."),
                _          => Result<Guid>.Failure("Jogador já possui inscrição neste campeonato.")
            };
        }

        var identityName = game.InscriptionMode == InscriptionMode.OwnIdentity ? request.IdentityName : null;
        var createResult = Enrollment.Create(request.ChampionshipId, request.TargetUserId, identityName);
        if (!createResult.IsSuccess) return Result<Guid>.Failure(createResult.Error);

        var enrollment = createResult.Value;
        enrollment.Accept();

        await _enrollments.AddAsync(enrollment, ct);
        await _uow.CommitAsync(ct);
        return Result<Guid>.Success(enrollment.Id);
    }
}
