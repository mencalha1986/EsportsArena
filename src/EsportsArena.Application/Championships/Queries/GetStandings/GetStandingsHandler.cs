using System.Data;
using Dapper;
using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Championships.Queries.GetStandings;

public sealed class GetStandingsHandler : IRequestHandler<GetStandingsQuery, Result<IReadOnlyList<StandingRowDto>>>
{
    private readonly IDbConnection _db;

    public GetStandingsHandler(IDbConnection db) => _db = db;

    public async Task<Result<IReadOnlyList<StandingRowDto>>> Handle(GetStandingsQuery request, CancellationToken ct)
    {
        const string sql = """
            WITH match_stats AS (
                SELECT
                    e.id AS enrollment_id,
                    COUNT(m.id) FILTER (WHERE m.status IN ('Played','WO'))                                AS played,
                    COUNT(m.id) FILTER (WHERE m.status IN ('Played','WO') AND (
                        (m.home_enrollment_id = e.id AND m.home_score > m.away_score) OR
                        (m.away_enrollment_id = e.id AND m.away_score > m.home_score)))                   AS wins,
                    COUNT(m.id) FILTER (WHERE m.status = 'Played' AND m.home_score = m.away_score)        AS draws,
                    COUNT(m.id) FILTER (WHERE m.status IN ('Played','WO') AND (
                        (m.home_enrollment_id = e.id AND m.home_score < m.away_score) OR
                        (m.away_enrollment_id = e.id AND m.away_score < m.home_score)))                   AS losses,
                    COALESCE(SUM(CASE WHEN m.home_enrollment_id = e.id THEN m.home_score
                                     WHEN m.away_enrollment_id = e.id THEN m.away_score ELSE 0 END)
                             FILTER (WHERE m.status IN ('Played','WO')), 0)                               AS goals_for,
                    COALESCE(SUM(CASE WHEN m.home_enrollment_id = e.id THEN m.away_score
                                     WHEN m.away_enrollment_id = e.id THEN m.home_score ELSE 0 END)
                             FILTER (WHERE m.status IN ('Played','WO')), 0)                               AS goals_against
                FROM enrollments e
                LEFT JOIN matches m ON (m.home_enrollment_id = e.id OR m.away_enrollment_id = e.id)
                WHERE e.championship_id = @ChampionshipId AND e.withdrew_at IS NULL
                GROUP BY e.id
            )
            SELECT
                e.id                                          AS enrollment_id,
                u.platform_id                                 AS player_platform_id,
                COALESCE(u.display_name, e.identity_name)     AS display_name,
                lt.name                                       AS team_name,
                lt.logo_url                                   AS team_logo_url,
                (s.wins * 3 + s.draws)                        AS points,
                s.played, s.wins, s.draws, s.losses,
                s.goals_for, s.goals_against,
                (s.goals_for - s.goals_against)               AS goal_diff,
                CASE WHEN s.played = 0 THEN 0
                     ELSE ROUND(s.wins::numeric / s.played * 100, 1) END AS win_pct
            FROM enrollments e
            JOIN users u ON u.id = e.user_id
            LEFT JOIN licensed_teams lt ON lt.id = e.licensed_team_id
            JOIN match_stats s ON s.enrollment_id = e.id
            WHERE e.championship_id = @ChampionshipId AND e.withdrew_at IS NULL
            ORDER BY points DESC, goal_diff DESC, goals_for DESC
            """;

        var rows = await _db.QueryAsync<dynamic>(sql, new { request.ChampionshipId });

        var standings = rows.Select(r => new StandingRowDto(
            (Guid)r.enrollment_id,
            (string)r.player_platform_id,
            (string)r.display_name,
            (string?)r.team_name,
            (string?)r.team_logo_url,
            (int)r.points,
            (int)r.played,
            (int)r.wins,
            (int)r.draws,
            (int)r.losses,
            (int)r.goals_for,
            (int)r.goals_against,
            (int)r.goal_diff,
            (double)r.win_pct
        )).ToList();

        return Result<IReadOnlyList<StandingRowDto>>.Success(standings);
    }
}
