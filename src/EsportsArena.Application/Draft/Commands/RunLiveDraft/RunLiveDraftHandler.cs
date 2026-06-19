using EsportsArena.Domain.Common;
using EsportsArena.Domain.Entities;
using EsportsArena.Domain.Enums;
using EsportsArena.Domain.Interfaces;
using MediatR;

namespace EsportsArena.Application.Draft.Commands.RunLiveDraft;

public sealed class RunLiveDraftHandler : IRequestHandler<RunLiveDraftCommand, Result<IReadOnlyList<DraftResultDto>>>
{
    private readonly IChampionshipRepository _championships;
    private readonly IGameRepository _games;
    private readonly IEnrollmentRepository _enrollments;
    private readonly ILicensedTeamRepository _teams;
    private readonly IDraftEventRepository _draftEvents;
    private readonly IUserRepository _users;
    private readonly IUnitOfWork _uow;

    public RunLiveDraftHandler(
        IChampionshipRepository championships,
        IGameRepository games,
        IEnrollmentRepository enrollments,
        ILicensedTeamRepository teams,
        IDraftEventRepository draftEvents,
        IUserRepository users,
        IUnitOfWork uow)
    {
        _championships = championships;
        _games = games;
        _enrollments = enrollments;
        _teams = teams;
        _draftEvents = draftEvents;
        _users = users;
        _uow = uow;
    }

    public async Task<Result<IReadOnlyList<DraftResultDto>>> Handle(RunLiveDraftCommand request, CancellationToken ct)
    {
        var championship = await _championships.GetByIdAsync(request.ChampionshipId, ct);
        if (championship is null) return Result<IReadOnlyList<DraftResultDto>>.Failure("Campeonato não encontrado.");
        if (championship.OrganizerId != request.RequesterId)
            return Result<IReadOnlyList<DraftResultDto>>.Failure("Somente o organizador pode disparar o sorteio.");
        if (championship.Status != ChampionshipStatus.EnrollmentsOpen)
            return Result<IReadOnlyList<DraftResultDto>>.Failure("O sorteio só pode ser feito com inscrições abertas.");

        var game = await _games.GetByIdAsync(championship.GameId, ct);
        if (game is null) return Result<IReadOnlyList<DraftResultDto>>.Failure("Jogo não encontrado.");
        if (game.InscriptionMode != InscriptionMode.LicensedTeams)
            return Result<IReadOnlyList<DraftResultDto>>.Failure("Sorteio de times não se aplica ao modo identidade própria.");

        var activeEnrollments = await _enrollments.GetActiveByChampionshipAsync(request.ChampionshipId, ct);
        if (activeEnrollments.Count == 0)
            return Result<IReadOnlyList<DraftResultDto>>.Failure("Nenhum inscrito ativo encontrado.");

        // Check if draft was already done
        var existingEvents = await _draftEvents.GetByChampionshipAsync(request.ChampionshipId, ct);
        if (existingEvents.Count > 0)
            return Result<IReadOnlyList<DraftResultDto>>.Failure("Sorteio já foi realizado para este campeonato.");

        var eligibleTeams = await _teams.GetEligibleTeamsAsync(
            championship.GameId, championship.MinStars, championship.MaxStars, ct);

        if (eligibleTeams.Count < activeEnrollments.Count)
            return Result<IReadOnlyList<DraftResultDto>>.Failure(
                $"Times elegíveis insuficientes ({eligibleTeams.Count}) para os inscritos ({activeEnrollments.Count}).");

        // Shuffle and pick N teams for N enrollments
        var rng = Random.Shared;
        var shuffledTeams = eligibleTeams.OrderBy(_ => rng.Next()).Take(activeEnrollments.Count).ToList();
        var shuffledEnrollments = activeEnrollments.OrderBy(_ => rng.Next()).ToList();

        var events = new List<DraftEvent>();
        var results = new List<DraftResultDto>();

        for (int i = 0; i < shuffledEnrollments.Count; i++)
        {
            var enrollment = shuffledEnrollments[i];
            var team = shuffledTeams[i];

            enrollment.AssignTeam(team.Id);
            events.Add(DraftEvent.Create(request.ChampionshipId, enrollment.Id, team.Id));

            var user = await _users.GetByIdAsync(enrollment.UserId, ct);
            results.Add(new DraftResultDto(enrollment.Id, user?.PlatformId ?? "-", team.Id, team.Name, team.Stars));
        }

        await _draftEvents.AddRangeAsync(events, ct);
        await _uow.CommitAsync(ct);

        return Result<IReadOnlyList<DraftResultDto>>.Success(results);
    }
}
