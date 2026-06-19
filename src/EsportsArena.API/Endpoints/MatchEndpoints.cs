using EsportsArena.API.Common;
using EsportsArena.Application.Matches.Commands.RecordMatchScore;
using EsportsArena.Domain.Interfaces;
using MediatR;
using System.Security.Claims;

namespace EsportsArena.API.Endpoints;

public static class MatchEndpoints
{
    public static void MapMatchEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/matches").WithTags("Matches");

        group.MapPatch("/{matchId:guid}/score", async (Guid matchId, ScoreRequest req, IMediator mediator,
            IUserRepository users, HttpContext ctx, CancellationToken ct) =>
        {
            var requesterId = await GetUserIdAsync(ctx, users, ct);
            if (requesterId == Guid.Empty) return Results.Unauthorized();

            var command = new RecordMatchScoreCommand(matchId, requesterId, req.HomeScore, req.AwayScore);
            var result = await mediator.Send(command, ct);
            return result.IsSuccess ? Results.NoContent() : Results.BadRequest(ApiResponse<object>.Fail(result.Error));
        })
        .RequireAuthorization()
        .WithName("RecordMatchScore")
        .WithSummary("Registra o placar de uma partida.");
    }

    private static async Task<Guid> GetUserIdAsync(HttpContext ctx, IUserRepository users, CancellationToken ct)
    {
        var supabaseUid = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? ctx.User.FindFirstValue("sub");
        if (supabaseUid is null) return Guid.Empty;
        var user = await users.GetBySupabaseUidAsync(supabaseUid, ct);
        return user?.Id ?? Guid.Empty;
    }
}

public record ScoreRequest(short HomeScore, short AwayScore);
