using EsportsArena.API.Common;
using EsportsArena.Application.Matches.Commands.RecordMatchScore;
using MediatR;
using System.Security.Claims;

namespace EsportsArena.API.Endpoints;

public static class MatchEndpoints
{
    public static void MapMatchEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/matches").WithTags("Matches");

        group.MapPatch("/{matchId:guid}/score", async (Guid matchId, ScoreRequest req, IMediator mediator,
            HttpContext ctx, CancellationToken ct) =>
        {
            var sub = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)
                   ?? ctx.User.FindFirstValue("sub");
            if (!Guid.TryParse(sub, out var requesterId)) return Results.Unauthorized();

            var command = new RecordMatchScoreCommand(matchId, requesterId, req.HomeScore, req.AwayScore);
            var result = await mediator.Send(command, ct);
            return result.IsSuccess ? Results.NoContent() : Results.BadRequest(ApiResponse<object>.Fail(result.Error));
        })
        .RequireAuthorization()
        .WithName("RecordMatchScore")
        .WithSummary("Registra o placar de uma partida.");
    }
}

public record ScoreRequest(short HomeScore, short AwayScore);
