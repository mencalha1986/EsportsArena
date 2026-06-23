using EsportsArena.API.Common;
using EsportsArena.Application.Games.Commands.AddLicensedTeam;
using EsportsArena.Application.Games.Commands.CreateGame;
using EsportsArena.Application.Games.Queries.GetGames;
using EsportsArena.Application.Games.Queries.GetLicensedTeams;
using EsportsArena.Domain.Enums;
using MediatR;

namespace EsportsArena.API.Endpoints;

public static class GameEndpoints
{
    public static void MapGameEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/games").WithTags("Games");
        var adminGroup = app.MapGroup("/api/v1/admin/games").WithTags("Admin")
            .RequireAuthorization("SuperAdminOnly");

        group.MapGet("/", async (IMediator mediator, CancellationToken ct) =>
        {
            var result = await mediator.Send(new GetGamesQuery(), ct);
            return Results.Ok(ApiResponse<IReadOnlyList<GameDto>>.Ok(result.Value));
        })
        .WithName("GetGames")
        .WithSummary("Lista todos os jogos ativos.");

        group.MapGet("/{gameId:guid}/teams", async (
            Guid gameId,
            byte? minStars,
            byte? maxStars,
            IMediator mediator,
            CancellationToken ct) =>
        {
            var result = await mediator.Send(new GetLicensedTeamsQuery(gameId, minStars, maxStars), ct);
            return result.IsSuccess
                ? Results.Ok(ApiResponse<IReadOnlyList<LicensedTeamDto>>.Ok(result.Value))
                : Results.NotFound(ApiResponse<IReadOnlyList<LicensedTeamDto>>.Fail(result.Error));
        })
        .WithName("GetLicensedTeams")
        .WithSummary("Lista times licenciados de um jogo com filtro opcional de estrelas.");

        adminGroup.MapPost("/", async (CreateGameRequest req, IMediator mediator, CancellationToken ct) =>
        {
            var command = new CreateGameCommand(req.Name, req.Slug, req.InscriptionMode, req.ScoreDisplay ?? "goals", req.IconUrl, req.Category ?? "Other");
            var result = await mediator.Send(command, ct);
            return result.IsSuccess
                ? Results.Created($"/api/v1/games/{result.Value}", ApiResponse<Guid>.Ok(result.Value))
                : Results.BadRequest(ApiResponse<Guid>.Fail(result.Error));
        })
        .WithName("CreateGame")
        .WithSummary("Cria um novo jogo (admin).");

        adminGroup.MapPost("/{gameId:guid}/teams", async (Guid gameId, AddTeamRequest req, IMediator mediator, CancellationToken ct) =>
        {
            var command = new AddLicensedTeamCommand(gameId, req.Name, req.Stars, req.LogoUrl);
            var result = await mediator.Send(command, ct);
            return result.IsSuccess
                ? Results.Created($"/api/v1/admin/games/{gameId}/teams/{result.Value}", ApiResponse<Guid>.Ok(result.Value))
                : Results.BadRequest(ApiResponse<Guid>.Fail(result.Error));
        })
        .WithName("AddLicensedTeam")
        .WithSummary("Adiciona um time licenciado a um jogo (admin).");
    }
}

public record CreateGameRequest(string Name, string Slug, InscriptionMode InscriptionMode, string? ScoreDisplay, string? IconUrl, string? Category);
public record AddTeamRequest(string Name, byte Stars, string? LogoUrl);
