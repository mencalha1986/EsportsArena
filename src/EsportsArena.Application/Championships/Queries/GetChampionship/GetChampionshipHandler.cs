using System.Data;
using Dapper;
using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Championships.Queries.GetChampionship;

public sealed class GetChampionshipHandler : IRequestHandler<GetChampionshipQuery, Result<ChampionshipDetailDto>>
{
    private readonly IDbConnection _db;

    public GetChampionshipHandler(IDbConnection db) => _db = db;

    public async Task<Result<ChampionshipDetailDto>> Handle(GetChampionshipQuery request, CancellationToken ct)
    {
        const string sql = """
            SELECT
                c."Id"              AS id,
                c."Name"            AS name,
                c."Description"     AS description,
                c."Status"          AS status,
                c."Format"          AS format,
                c."MinStars"        AS min_stars,
                c."MaxStars"        AS max_stars,
                c."GameId"          AS game_id,
                c."OrganizerId"     AS organizer_id,
                c."CreatedAt"       AS created_at,
                g."Name"            AS game_name,
                g."InscriptionMode" AS game_inscription_mode,
                g."ScoreDisplay"    AS game_score_display,
                u."PlatformId"      AS organizer_platform_id
            FROM championships c
            JOIN games g ON g."Id" = c."GameId"
            JOIN users u ON u."Id" = c."OrganizerId"
            WHERE c."Id" = @Id
            """;

        var row = await _db.QueryFirstOrDefaultAsync<dynamic>(sql, new { Id = request.ChampionshipId });
        if (row is null) return Result<ChampionshipDetailDto>.Failure("Campeonato não encontrado.");

        return Result<ChampionshipDetailDto>.Success(new ChampionshipDetailDto(
            (Guid)row.id, (string)row.name, (string?)row.description,
            (string)row.status, (string)row.format,
            (byte?)row.min_stars, (byte?)row.max_stars,
            (Guid)row.game_id, (string)row.game_name,
            (string)row.game_inscription_mode, (string)row.game_score_display,
            (Guid)row.organizer_id, (string)row.organizer_platform_id,
            (DateTime)row.created_at));
    }
}
