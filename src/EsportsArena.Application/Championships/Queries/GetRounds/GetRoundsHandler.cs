using System.Data;
using Dapper;
using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Championships.Queries.GetRounds;

public sealed class GetRoundsHandler : IRequestHandler<GetRoundsQuery, Result<IReadOnlyList<RoundDto>>>
{
    private readonly IDbConnection _db;

    public GetRoundsHandler(IDbConnection db) => _db = db;

    public async Task<Result<IReadOnlyList<RoundDto>>> Handle(GetRoundsQuery request, CancellationToken ct)
    {
        const string sql = """
            SELECT
                r.id AS round_id, r.number AS round_number, r.label AS round_label,
                m.id AS match_id,
                m.home_enrollment_id, hu.platform_id AS home_platform_id,
                COALESCE(hu.display_name, he.identity_name) AS home_display_name,
                hlt.name AS home_team_name, hlt.logo_url AS home_team_logo,
                m.away_enrollment_id, au.platform_id AS away_platform_id,
                COALESCE(au.display_name, ae.identity_name) AS away_display_name,
                alt.name AS away_team_name, alt.logo_url AS away_team_logo,
                m.home_score, m.away_score, m.status, m.played_at
            FROM rounds r
            LEFT JOIN matches m ON m.round_id = r.id
            LEFT JOIN enrollments he ON he.id = m.home_enrollment_id
            LEFT JOIN users hu ON hu.id = he.user_id
            LEFT JOIN licensed_teams hlt ON hlt.id = he.licensed_team_id
            LEFT JOIN enrollments ae ON ae.id = m.away_enrollment_id
            LEFT JOIN users au ON au.id = ae.user_id
            LEFT JOIN licensed_teams alt ON alt.id = ae.licensed_team_id
            WHERE r.championship_id = @ChampionshipId
            ORDER BY r.number, m.id
            """;

        var rows = (await _db.QueryAsync<dynamic>(sql, new { request.ChampionshipId })).ToList();

        var rounds = rows
            .GroupBy(r => new { id = (Guid)r.round_id, number = (int)r.round_number, label = (string?)r.round_label })
            .Select(g => new RoundDto(
                g.Key.id,
                g.Key.number,
                g.Key.label,
                g.Where(r => r.match_id != null).Select(r => new MatchDto(
                    (Guid)r.match_id,
                    (Guid)r.home_enrollment_id,
                    (string)r.home_platform_id,
                    (string?)r.home_team_name,
                    (string?)r.home_team_logo,
                    (Guid)r.away_enrollment_id,
                    (string)r.away_platform_id,
                    (string?)r.away_team_name,
                    (string?)r.away_team_logo,
                    (short?)r.home_score,
                    (short?)r.away_score,
                    (string)r.status,
                    (DateTime?)r.played_at
                )).ToList()
            )).ToList();

        return Result<IReadOnlyList<RoundDto>>.Success(rounds);
    }
}
