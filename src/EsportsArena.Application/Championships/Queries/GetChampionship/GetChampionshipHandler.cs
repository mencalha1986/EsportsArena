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
                c.id, c.name, c.description, c.status, c.format,
                c.min_stars, c.max_stars, c.game_id, c.organizer_id, c.created_at,
                g.name AS game_name, g.inscription_mode AS game_inscription_mode,
                g.score_display AS game_score_display,
                u.platform_id AS organizer_platform_id
            FROM championships c
            JOIN games g ON g.id = c.game_id
            JOIN users u ON u.id = c.organizer_id
            WHERE c.id = @Id
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
