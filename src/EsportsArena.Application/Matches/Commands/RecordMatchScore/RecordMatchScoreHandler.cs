using EsportsArena.Domain.Common;
using EsportsArena.Domain.Interfaces;
using MediatR;

namespace EsportsArena.Application.Matches.Commands.RecordMatchScore;

public sealed class RecordMatchScoreHandler : IRequestHandler<RecordMatchScoreCommand, Result>
{
    private readonly IMatchRepository _matches;
    private readonly IEnrollmentRepository _enrollments;
    private readonly IChampionshipRepository _championships;
    private readonly IRoundRepository _rounds;
    private readonly IUnitOfWork _uow;

    public RecordMatchScoreHandler(
        IMatchRepository matches,
        IEnrollmentRepository enrollments,
        IChampionshipRepository championships,
        IRoundRepository rounds,
        IUnitOfWork uow)
    {
        _matches = matches;
        _enrollments = enrollments;
        _championships = championships;
        _rounds = rounds;
        _uow = uow;
    }

    public async Task<Result> Handle(RecordMatchScoreCommand request, CancellationToken ct)
    {
        var match = await _matches.GetByIdAsync(request.MatchId, ct);
        if (match is null) return Result.Failure("Partida não encontrada.");

        var round = await _rounds.GetByIdAsync(match.RoundId, ct);
        if (round is null) return Result.Failure("Rodada não encontrada.");

        var championship = await _championships.GetByIdAsync(round.ChampionshipId, ct);
        if (championship is null) return Result.Failure("Campeonato não encontrado.");

        // Organizer or one of the match participants can record score
        var homeEnrollment = await _enrollments.GetByIdAsync(match.HomeEnrollmentId, ct);
        var awayEnrollment = await _enrollments.GetByIdAsync(match.AwayEnrollmentId, ct);

        bool isOrganizer = championship.OrganizerId == request.RequesterId;
        bool isParticipant = (homeEnrollment?.UserId == request.RequesterId) ||
                             (awayEnrollment?.UserId == request.RequesterId);

        if (!isOrganizer && !isParticipant)
            return Result.Failure("Apenas o organizador ou um dos participantes pode registrar o placar.");

        var result = match.RecordScore(request.HomeScore, request.AwayScore);
        if (!result.IsSuccess) return result;

        await _uow.CommitAsync(ct);
        return Result.Success();
    }
}
