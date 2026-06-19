using EsportsArena.Domain.Common;
using EsportsArena.Domain.Enums;

namespace EsportsArena.Domain.Entities;

public sealed class Match : Entity
{
    public Guid RoundId { get; private set; }
    public Guid HomeEnrollmentId { get; private set; }
    public Guid AwayEnrollmentId { get; private set; }
    public short? HomeScore { get; private set; }
    public short? AwayScore { get; private set; }
    public MatchStatus Status { get; private set; }
    public DateTime? PlayedAt { get; private set; }

    private Match() { }

    public static Match Create(Guid roundId, Guid homeEnrollmentId, Guid awayEnrollmentId) =>
        new()
        {
            RoundId = roundId,
            HomeEnrollmentId = homeEnrollmentId,
            AwayEnrollmentId = awayEnrollmentId,
            Status = MatchStatus.Pending
        };

    public static Match CreateWO(Guid roundId, Guid winnerEnrollmentId, Guid loserEnrollmentId) =>
        new()
        {
            RoundId = roundId,
            HomeEnrollmentId = winnerEnrollmentId,
            AwayEnrollmentId = loserEnrollmentId,
            HomeScore = 3,
            AwayScore = 0,
            Status = MatchStatus.WO,
            PlayedAt = DateTime.UtcNow
        };

    public Result RecordScore(short homeScore, short awayScore)
    {
        if (Status == MatchStatus.WO)
            return Result.Failure("Partida encerrada como W.O. não pode ter placar registrado.");
        if (homeScore < 0 || awayScore < 0)
            return Result.Failure("Placar não pode ser negativo.");
        HomeScore = homeScore;
        AwayScore = awayScore;
        Status = MatchStatus.Played;
        PlayedAt = DateTime.UtcNow;
        MarkUpdated();
        return Result.Success();
    }
}
