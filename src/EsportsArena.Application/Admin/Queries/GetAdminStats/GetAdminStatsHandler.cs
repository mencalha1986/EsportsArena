using System.Data;
using Dapper;
using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Admin.Queries.GetAdminStats;

public sealed class GetAdminStatsHandler : IRequestHandler<GetAdminStatsQuery, Result<AdminStatsDto>>
{
    private readonly IDbConnection _db;
    public GetAdminStatsHandler(IDbConnection db) => _db = db;

    public async Task<Result<AdminStatsDto>> Handle(GetAdminStatsQuery request, CancellationToken ct)
    {
        var totalUsers = await _db.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM users WHERE \"Role\" != 'SuperAdmin'");

        var totalAdmins = await _db.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM users WHERE \"Role\" = 'Admin' AND \"IsActive\" = true");

        var totalChampionships = await _db.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM championships");

        var inProgress = await _db.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM championships WHERE \"Status\" = 'InProgress'");

        var finished = await _db.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM championships WHERE \"Status\" = 'Finished'");

        var open = await _db.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM championships WHERE \"Status\" = 'EnrollmentsOpen'");

        var gameRows = await _db.QueryAsync<dynamic>("""
            SELECT g."Name" AS game_name, g."Category" AS category, g."IconUrl" AS icon_url, COUNT(c.id) AS championship_count
            FROM games g
            LEFT JOIN championships c ON c."GameId" = g.id
            GROUP BY g.id, g."Name", g."Category", g."IconUrl"
            ORDER BY championship_count DESC, g."Name"
            """);

        var rankings = gameRows
            .Select(r => new GameRankingDto((string)r.game_name, (string)(r.category ?? "Other"), (string?)r.icon_url, (int)(long)r.championship_count))
            .ToList();

        return Result<AdminStatsDto>.Success(new AdminStatsDto(
            totalUsers, totalAdmins, totalChampionships,
            inProgress, finished, open, rankings));
    }
}
