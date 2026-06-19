using EsportsArena.Domain.Enums;

namespace EsportsArena.Domain.Interfaces;

public interface ILeagueEngineService
{
    IReadOnlyList<RoundSchedule> GenerateSchedule(IReadOnlyList<Guid> enrollmentIds, LeagueFormat format);
}

public sealed record RoundSchedule(int RoundNumber, string Label, IReadOnlyList<MatchPair> Matches);
public sealed record MatchPair(Guid HomeEnrollmentId, Guid AwayEnrollmentId);
