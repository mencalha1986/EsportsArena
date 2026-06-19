using EsportsArena.Domain.Enums;
using EsportsArena.Domain.Interfaces;

namespace EsportsArena.Infrastructure.Services;

public sealed class LeagueEngineService : ILeagueEngineService
{
    public IReadOnlyList<RoundSchedule> GenerateSchedule(IReadOnlyList<Guid> enrollmentIds, LeagueFormat format)
    {
        if (enrollmentIds.Count < 2)
            throw new InvalidOperationException("São necessários pelo menos 2 inscritos.");

        var ids = enrollmentIds.ToList();
        bool hasBye = ids.Count % 2 != 0;
        if (hasBye) ids.Add(Guid.Empty); // bye slot

        int n = ids.Count;
        int roundsPerLeg = n - 1;
        int matchesPerRound = n / 2;

        var firstLeg = GenerateLeg(ids, roundsPerLeg, matchesPerRound, "Rodada");
        if (format == LeagueFormat.SingleRound)
            return firstLeg;

        // Double round: second leg swaps home/away
        var secondLeg = GenerateLeg(ids, roundsPerLeg, matchesPerRound, "Returno — Rodada", startRoundNumber: roundsPerLeg + 1, swapHomeAway: true);

        return [.. firstLeg, .. secondLeg];
    }

    private static IReadOnlyList<RoundSchedule> GenerateLeg(
        List<Guid> ids, int roundCount, int matchesPerRound,
        string labelPrefix, int startRoundNumber = 1, bool swapHomeAway = false)
    {
        int n = ids.Count;
        var schedule = new List<RoundSchedule>();
        var circle = ids.ToList();

        for (int round = 0; round < roundCount; round++)
        {
            var matches = new List<MatchPair>();

            for (int i = 0; i < matchesPerRound; i++)
            {
                var home = circle[i];
                var away = circle[n - 1 - i];

                // Skip bye matches
                if (home == Guid.Empty || away == Guid.Empty) continue;

                matches.Add(swapHomeAway
                    ? new MatchPair(away, home)
                    : new MatchPair(home, away));
            }

            int roundNumber = startRoundNumber + round;
            schedule.Add(new RoundSchedule(roundNumber, $"{labelPrefix} {roundNumber}", matches));

            // Rotate: fix first element, rotate the rest clockwise
            var last = circle[n - 1];
            for (int i = n - 1; i > 1; i--)
                circle[i] = circle[i - 1];
            circle[1] = last;
        }

        return schedule;
    }
}
