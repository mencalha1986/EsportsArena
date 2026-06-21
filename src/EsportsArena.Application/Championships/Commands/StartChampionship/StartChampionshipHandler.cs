using EsportsArena.Domain.Common;
using EsportsArena.Domain.Entities;
using EsportsArena.Domain.Interfaces;
using MediatR;

namespace EsportsArena.Application.Championships.Commands.StartChampionship;

public sealed class StartChampionshipHandler : IRequestHandler<StartChampionshipCommand, Result>
{
    private readonly IChampionshipRepository _championships;
    private readonly IEnrollmentRepository _enrollments;
    private readonly IRoundRepository _rounds;
    private readonly IMatchRepository _matches;
    private readonly ILeagueEngineService _engine;
    private readonly IUnitOfWork _uow;

    public StartChampionshipHandler(
        IChampionshipRepository championships,
        IEnrollmentRepository enrollments,
        IRoundRepository rounds,
        IMatchRepository matches,
        ILeagueEngineService engine,
        IUnitOfWork uow)
    {
        _championships = championships;
        _enrollments = enrollments;
        _rounds = rounds;
        _matches = matches;
        _engine = engine;
        _uow = uow;
    }

    public async Task<Result> Handle(StartChampionshipCommand request, CancellationToken ct)
    {
        var championship = await _championships.GetByIdAsync(request.ChampionshipId, ct);
        if (championship is null) return Result.Failure("Campeonato não encontrado.");
        if (championship.OrganizerId != request.RequesterId) return Result.Failure("Somente o organizador pode iniciar o campeonato.");

        var activeEnrollments = await _enrollments.GetAcceptedByChampionshipAsync(request.ChampionshipId, ct);
        if (activeEnrollments.Count < 2) return Result.Failure("São necessários pelo menos 2 inscrições aceitas para iniciar.");

        var startResult = championship.Start();
        if (!startResult.IsSuccess) return startResult;

        var enrollmentIds = activeEnrollments.Select(e => e.Id).ToList();
        var schedule = _engine.GenerateSchedule(enrollmentIds, championship.Format);

        var rounds = new List<Round>();
        var matches = new List<Match>();

        foreach (var roundSchedule in schedule)
        {
            var round = Round.Create(request.ChampionshipId, (short)roundSchedule.RoundNumber, roundSchedule.Label);
            rounds.Add(round);

            foreach (var pair in roundSchedule.Matches)
                matches.Add(Match.Create(round.Id, pair.HomeEnrollmentId, pair.AwayEnrollmentId));
        }

        await _rounds.AddRangeAsync(rounds, ct);
        await _matches.AddRangeAsync(matches, ct);
        await _uow.CommitAsync(ct);
        return Result.Success();
    }
}
