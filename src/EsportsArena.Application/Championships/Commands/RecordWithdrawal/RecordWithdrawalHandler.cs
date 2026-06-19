using EsportsArena.Domain.Common;
using EsportsArena.Domain.Entities;
using EsportsArena.Domain.Interfaces;
using MediatR;

namespace EsportsArena.Application.Championships.Commands.RecordWithdrawal;

public sealed class RecordWithdrawalHandler : IRequestHandler<RecordWithdrawalCommand, Result>
{
    private readonly IEnrollmentRepository _enrollments;
    private readonly IChampionshipRepository _championships;
    private readonly IMatchRepository _matches;
    private readonly IUnitOfWork _uow;

    public RecordWithdrawalHandler(
        IEnrollmentRepository enrollments,
        IChampionshipRepository championships,
        IMatchRepository matches,
        IUnitOfWork uow)
    {
        _enrollments = enrollments;
        _championships = championships;
        _matches = matches;
        _uow = uow;
    }

    public async Task<Result> Handle(RecordWithdrawalCommand request, CancellationToken ct)
    {
        var enrollment = await _enrollments.GetByIdAsync(request.EnrollmentId, ct);
        if (enrollment is null) return Result.Failure("Inscrição não encontrada.");

        var championship = await _championships.GetByIdAsync(enrollment.ChampionshipId, ct);
        if (championship is null) return Result.Failure("Campeonato não encontrado.");

        // Only the player themselves or the organizer can register withdrawal
        if (enrollment.UserId != request.RequesterId && championship.OrganizerId != request.RequesterId)
            return Result.Failure("Somente o próprio jogador ou o organizador podem registrar a desistência.");

        var withdrawResult = enrollment.Withdraw();
        if (!withdrawResult.IsSuccess) return withdrawResult;

        // Cascade: all future (pending) matches become WO
        var futurePending = await _matches.GetFutureMatchesByEnrollmentAsync(request.EnrollmentId, ct);
        var woMatches = new List<Match>();
        foreach (var match in futurePending)
        {
            var opponentId = match.HomeEnrollmentId == request.EnrollmentId
                ? match.AwayEnrollmentId
                : match.HomeEnrollmentId;
            woMatches.Add(Match.CreateWO(match.RoundId, opponentId, request.EnrollmentId));
        }

        // Remove old pending matches and insert WO matches
        await _matches.AddRangeAsync(woMatches, ct);

        await _uow.CommitAsync(ct);
        return Result.Success();
    }
}
