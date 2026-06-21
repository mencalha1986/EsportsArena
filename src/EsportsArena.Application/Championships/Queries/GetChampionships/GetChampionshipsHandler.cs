using System.Data;
using Dapper;
using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Championships.Queries.GetChampionships;

public sealed class GetChampionshipsHandler : IRequestHandler<GetChampionshipsQuery, Result<IReadOnlyList<ChampionshipListItemDto>>>
{
    private readonly IDbConnection _db;

    public GetChampionshipsHandler(IDbConnection db) => _db = db;

    public async Task<Result<IReadOnlyList<ChampionshipListItemDto>>> Handle(GetChampionshipsQuery request, CancellationToken ct)
    {
        var conditions = new List<string>();
        var parameters = new DynamicParameters();

        if (request.GameId.HasValue)
        {
            conditions.Add("c.\"GameId\" = @GameId");
            parameters.Add("GameId", request.GameId.Value);
        }
        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            conditions.Add("c.\"Status\" = @Status");
            parameters.Add("Status", request.Status);
        }
        if (request.OrganizerId.HasValue)
        {
            conditions.Add("c.\"OrganizerId\" = @OrganizerId");
            parameters.Add("OrganizerId", request.OrganizerId.Value);
        }
        if (!string.IsNullOrWhiteSpace(request.Category))
        {
            conditions.Add("g.\"Category\" = @Category");
            parameters.Add("Category", request.Category);
        }

        var where = conditions.Count > 0 ? "WHERE " + string.Join(" AND ", conditions) : "";

        var sql = $"""
            SELECT
                c."Id"          AS id,
                c."Name"        AS name,
                c."Status"      AS status,
                c."Format"      AS format,
                c."GameId"      AS game_id,
                c."OrganizerId" AS organizer_id,
                c."CreatedAt"   AS created_at,
                g."Name"        AS game_name,
                g."Category"    AS game_category
            FROM championships c
            JOIN games g ON g."Id" = c."GameId"
            {where}
            ORDER BY c."CreatedAt" DESC
            """;

        var rows = await _db.QueryAsync<dynamic>(sql, parameters);

        var items = rows.Select(r => new ChampionshipListItemDto(
            (Guid)r.id,
            (string)r.name,
            (string)r.status,
            (string)r.format,
            (Guid)r.game_id,
            (string)r.game_name,
            (string)r.game_category,
            (Guid)r.organizer_id,
            (DateTime)r.created_at
        )).ToList();

        return Result<IReadOnlyList<ChampionshipListItemDto>>.Success(items);
    }
}
