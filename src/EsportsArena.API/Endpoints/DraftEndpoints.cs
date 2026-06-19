using EsportsArena.API.Common;
using EsportsArena.Application.Draft.Commands.RunLiveDraft;
using EsportsArena.Domain.Interfaces;
using EsportsArena.Infrastructure.Hubs;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace EsportsArena.API.Endpoints;

public static class DraftEndpoints
{
    public static void MapDraftEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/championships/{championshipId:guid}/draft").WithTags("Draft");

        group.MapPost("/", async (Guid championshipId, IMediator mediator, IUserRepository users,
            IHubContext<DraftHub> hub, HttpContext ctx, CancellationToken ct) =>
        {
            var requesterId = await GetUserIdAsync(ctx, users, ct);
            if (requesterId == Guid.Empty) return Results.Unauthorized();

            var command = new RunLiveDraftCommand(championshipId, requesterId);
            var result = await mediator.Send(command, ct);

            if (!result.IsSuccess)
                return Results.BadRequest(ApiResponse<IReadOnlyList<DraftResultDto>>.Fail(result.Error));

            // Broadcast each draw result to championship group via SignalR
            foreach (var draw in result.Value)
            {
                await hub.Clients.Group($"championship-{championshipId}")
                    .SendAsync("TeamDrawn", new
                    {
                        draw.EnrollmentId,
                        draw.PlayerPlatformId,
                        draw.TeamId,
                        draw.TeamName,
                        draw.TeamStars
                    }, ct);
            }

            return Results.Ok(ApiResponse<IReadOnlyList<DraftResultDto>>.Ok(result.Value));
        })
        .RequireAuthorization("AdminOrAbove")
        .WithName("RunLiveDraft")
        .WithSummary("Executa o sorteio de times (só organizador). Resultado transmitido via SignalR.");

        group.MapGet("/events", async (Guid championshipId, IDraftEventRepository draftEvents,
            IEnrollmentRepository enrollments, IUserRepository users, ILicensedTeamRepository teams, CancellationToken ct) =>
        {
            var events = await draftEvents.GetByChampionshipAsync(championshipId, ct);
            return Results.Ok(ApiResponse<object>.Ok(events.Select(e => new
            {
                e.EnrollmentId, e.LicensedTeamId, e.DrawnAt
            })));
        })
        .WithName("GetDraftEvents")
        .WithSummary("Retorna o resultado do sorteio.");
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
