using System.Data;
using Dapper;
using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Users.Queries.GetUserProfile;

public sealed class GetUserProfileHandler : IRequestHandler<GetUserProfileQuery, Result<UserProfileDto>>
{
    private readonly IDbConnection _db;

    public GetUserProfileHandler(IDbConnection db) => _db = db;

    public async Task<Result<UserProfileDto>> Handle(GetUserProfileQuery request, CancellationToken ct)
    {
        const string userSql = """
            SELECT id, platform_id, display_name, avatar_url, "Role" AS role, "IsActive" AS is_active
            FROM users WHERE LOWER(platform_id) = LOWER(@PlatformId)
            """;

        var user = await _db.QueryFirstOrDefaultAsync<dynamic>(userSql, new { request.PlatformId });
        if (user is null) return Result<UserProfileDto>.Failure("Usuário não encontrado.");

        Guid userId = user.id;

        const string statsSql = """
            SELECT
                COUNT(*) FILTER (WHERE
                    (m.home_enrollment_id = e.id AND m.home_score > m.away_score) OR
                    (m.away_enrollment_id = e.id AND m.away_score > m.home_score)) AS wins,
                COUNT(*) FILTER (WHERE m.home_score = m.away_score AND m.status = 'Played') AS draws,
                COUNT(*) FILTER (WHERE
                    (m.home_enrollment_id = e.id AND m.home_score < m.away_score) OR
                    (m.away_enrollment_id = e.id AND m.away_score < m.home_score)) AS losses
            FROM enrollments e
            JOIN matches m ON (m.home_enrollment_id = e.id OR m.away_enrollment_id = e.id)
            WHERE e.user_id = @UserId AND m.status IN ('Played', 'WO')
            """;

        var stats = await _db.QueryFirstOrDefaultAsync<dynamic>(statsSql, new { UserId = userId });

        const string recentSql = """
            SELECT
                c.name AS championship_name,
                opp_u.platform_id AS opponent_platform_id,
                lt.name AS opponent_team_name,
                CASE WHEN m.home_enrollment_id = e.id THEN m.home_score ELSE m.away_score END AS my_score,
                CASE WHEN m.home_enrollment_id = e.id THEN m.away_score ELSE m.home_score END AS opponent_score,
                m.status,
                m.played_at
            FROM enrollments e
            JOIN matches m ON (m.home_enrollment_id = e.id OR m.away_enrollment_id = e.id)
            JOIN rounds r ON r.id = m.round_id
            JOIN championships c ON c.id = r.championship_id
            JOIN enrollments opp_e ON opp_e.id = CASE
                WHEN m.home_enrollment_id = e.id THEN m.away_enrollment_id
                ELSE m.home_enrollment_id END
            JOIN users opp_u ON opp_u.id = opp_e.user_id
            LEFT JOIN licensed_teams lt ON lt.id = opp_e.licensed_team_id
            WHERE e.user_id = @UserId AND m.status IN ('Played', 'WO')
            ORDER BY m.played_at DESC LIMIT 10
            """;

        var recentRows = await _db.QueryAsync<dynamic>(recentSql, new { UserId = userId });

        var recent = recentRows.Select(r => new RecentMatchDto(
            (string)r.championship_name,
            (string)r.opponent_platform_id,
            (string?)r.opponent_team_name,
            (short?)r.my_score,
            (short?)r.opponent_score,
            (string)r.status,
            (DateTime?)r.played_at
        )).ToList();

        // Titles = championships won (highest points at finish)
        const string titlesSql = """
            SELECT COUNT(*) FROM (
                SELECT e.championship_id,
                    SUM(CASE
                        WHEN (m.home_enrollment_id = e.id AND m.home_score > m.away_score) OR
                             (m.away_enrollment_id = e.id AND m.away_score > m.home_score) THEN 3
                        WHEN m.home_score = m.away_score THEN 1
                        ELSE 0 END) AS pts,
                    RANK() OVER (PARTITION BY e.championship_id ORDER BY
                        SUM(CASE
                            WHEN (m.home_enrollment_id = e.id AND m.home_score > m.away_score) OR
                                 (m.away_enrollment_id = e.id AND m.away_score > m.home_score) THEN 3
                            WHEN m.home_score = m.away_score THEN 1
                            ELSE 0 END) DESC) AS rnk
                FROM enrollments e
                JOIN rounds r ON r.championship_id = e.championship_id
                JOIN matches m ON (m.home_enrollment_id = e.id OR m.away_enrollment_id = e.id)
                    AND m.round_id = r.id AND m.status IN ('Played', 'WO')
                JOIN championships c ON c.id = e.championship_id AND c.status = 'Finished'
                WHERE e.user_id = @UserId
                GROUP BY e.id, e.championship_id
            ) ranked WHERE rnk = 1
            """;

        var titles = await _db.ExecuteScalarAsync<int>(titlesSql, new { UserId = userId });

        var dto = new UserProfileDto(
            userId,
            (string)user.platform_id,
            (string)user.display_name,
            (string?)user.avatar_url,
            (int)(stats?.wins ?? 0),
            (int)(stats?.draws ?? 0),
            (int)(stats?.losses ?? 0),
            titles,
            recent,
            (string)user.role,
            (bool)user.is_active);

        return Result<UserProfileDto>.Success(dto);
    }
}
