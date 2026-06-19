using EsportsArena.API.Common;
using EsportsArena.Application.Championships.Commands.CreateChampionship;
using EsportsArena.Application.Championships.Commands.OpenEnrollments;
using EsportsArena.Application.Championships.Commands.StartChampionship;
using EsportsArena.Application.Championships.Queries.GetChampionship;
using EsportsArena.Application.Championships.Queries.GetRounds;
using EsportsArena.Application.Championships.Queries.GetStandings;
using EsportsArena.Domain.Enums;
using EsportsArena.Domain.Interfaces;
using MediatR;
using System.Security.Claims;

namespace EsportsArena.API.Endpoints;

public static class ChampionshipEndpoints
{
    public static void MapChampionshipEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/championships").WithTags("Championships");

        group.MapGet("/", async (Guid? gameId, string? status, Guid? organizerId, IChampionshipRepository championships, CancellationToken ct) =>
        {
            var list = await championships.GetByFiltersAsync(gameId, status, organizerId, ct);
            var dtos = list.Select(c => new { c.Id, c.Name, c.Status, c.Format, c.GameId, c.OrganizerId, c.CreatedAt });
            return Results.Ok(ApiResponse<object>.Ok(dtos));
        })
        .WithName("ListChampionships")
        .WithSummary("Lista campeonatos com filtros opcionais.");

        group.MapGet("/{id:guid}", async (Guid id, IMediator mediator, CancellationToken ct) =>
        {
            var result = await mediator.Send(new GetChampionshipQuery(id), ct);
            return result.IsSuccess
                ? Results.Ok(ApiResponse<ChampionshipDetailDto>.Ok(result.Value))
                : Results.NotFound(ApiResponse<ChampionshipDetailDto>.Fail(result.Error));
        })
        .WithName("GetChampionship")
        .WithSummary("Retorna os detalhes de um campeonato.");

        group.MapPost("/", async (CreateChampionshipRequest req, IMediator mediator,
            HttpContext ctx, CancellationToken ct) =>
        {
            var organizerId = GetUserIdFromClaims(ctx);
            if (organizerId == Guid.Empty) return Results.Unauthorized();

            var command = new CreateChampionshipCommand(req.GameId, organizerId, req.Name, req.Format,
                req.Description, req.MinStars, req.MaxStars);
            var result = await mediator.Send(command, ct);
            return result.IsSuccess
                ? Results.Created($"/api/v1/championships/{result.Value}", ApiResponse<Guid>.Ok(result.Value))
                : Results.BadRequest(ApiResponse<Guid>.Fail(result.Error));
        })
        .RequireAuthorization("AdminOrAbove")
        .WithName("CreateChampionship")
        .WithSummary("Cria um novo campeonato.");

        group.MapPatch("/{id:guid}/open", async (Guid id, IMediator mediator,
            HttpContext ctx, CancellationToken ct) =>
        {
            var requesterId = GetUserIdFromClaims(ctx);
            if (requesterId == Guid.Empty) return Results.Unauthorized();

            var result = await mediator.Send(new OpenEnrollmentsCommand(id, requesterId), ct);
            return result.IsSuccess ? Results.NoContent() : Results.BadRequest(ApiResponse<object>.Fail(result.Error));
        })
        .RequireAuthorization("AdminOrAbove")
        .WithName("OpenEnrollments")
        .WithSummary("Abre as inscrições do campeonato.");

        group.MapPatch("/{id:guid}/start", async (Guid id, IMediator mediator,
            HttpContext ctx, CancellationToken ct) =>
        {
            var requesterId = GetUserIdFromClaims(ctx);
            if (requesterId == Guid.Empty) return Results.Unauthorized();

            var result = await mediator.Send(new StartChampionshipCommand(id, requesterId), ct);
            return result.IsSuccess ? Results.NoContent() : Results.BadRequest(ApiResponse<object>.Fail(result.Error));
        })
        .RequireAuthorization("AdminOrAbove")
        .WithName("StartChampionship")
        .WithSummary("Inicia o campeonato e gera as rodadas automaticamente.");

        group.MapGet("/{id:guid}/standings", async (Guid id, IMediator mediator, CancellationToken ct) =>
        {
            var result = await mediator.Send(new GetStandingsQuery(id), ct);
            return result.IsSuccess
                ? Results.Ok(ApiResponse<IReadOnlyList<StandingRowDto>>.Ok(result.Value))
                : Results.BadRequest(ApiResponse<IReadOnlyList<StandingRowDto>>.Fail(result.Error));
        })
        .WithName("GetStandings")
        .WithSummary("Retorna a tabela de classificação calculada.");

        group.MapGet("/{id:guid}/rounds", async (Guid id, IMediator mediator, CancellationToken ct) =>
        {
            var result = await mediator.Send(new GetRoundsQuery(id), ct);
            return result.IsSuccess
                ? Results.Ok(ApiResponse<IReadOnlyList<RoundDto>>.Ok(result.Value))
                : Results.BadRequest(ApiResponse<IReadOnlyList<RoundDto>>.Fail(result.Error));
        })
        .WithName("GetRounds")
        .WithSummary("Retorna todas as rodadas com partidas e placares.");
    }

    private static Guid GetUserIdFromClaims(HttpContext ctx)
    {
        var sub = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)
               ?? ctx.User.FindFirstValue("sub");
        return Guid.TryParse(sub, out var id) ? id : Guid.Empty;
    }
}

public record CreateChampionshipRequest(
    Guid GameId, string Name, LeagueFormat Format,
    string? Description = null, byte? MinStars = null, byte? MaxStars = null);
