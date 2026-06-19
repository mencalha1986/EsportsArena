using EsportsArena.API.Common;
using EsportsArena.Application.Championships.Commands.RecordWithdrawal;
using EsportsArena.Application.Enrollments.Commands.EnrollUser;
using EsportsArena.Domain.Interfaces;
using MediatR;
using System.Security.Claims;

namespace EsportsArena.API.Endpoints;

public static class EnrollmentEndpoints
{
    public static void MapEnrollmentEndpoints(this IEndpointRouteBuilder app)
    {
        var champGroup = app.MapGroup("/api/v1/championships/{championshipId:guid}/enrollments").WithTags("Enrollments");
        var enrollGroup = app.MapGroup("/api/v1/enrollments").WithTags("Enrollments");

        champGroup.MapGet("/", async (Guid championshipId, IEnrollmentRepository enrollments, CancellationToken ct) =>
        {
            var list = await enrollments.GetActiveByChampionshipAsync(championshipId, ct);
            return Results.Ok(ApiResponse<object>.Ok(list.Select(e => new
            {
                e.Id, e.UserId, e.IdentityName, e.LicensedTeamId, e.IsActive, e.CreatedAt
            })));
        })
        .WithName("ListEnrollments")
        .WithSummary("Lista inscrições ativas de um campeonato.");

        champGroup.MapPost("/", async (Guid championshipId, EnrollRequest req, IMediator mediator,
            HttpContext ctx, CancellationToken ct) =>
        {
            var userId = GetUserIdFromClaims(ctx);
            if (userId == Guid.Empty) return Results.Unauthorized();

            var command = new EnrollUserCommand(championshipId, userId, req.IdentityName);
            var result = await mediator.Send(command, ct);
            return result.IsSuccess
                ? Results.Created($"/api/v1/championships/{championshipId}/enrollments/{result.Value}",
                    ApiResponse<Guid>.Ok(result.Value))
                : Results.BadRequest(ApiResponse<Guid>.Fail(result.Error));
        })
        .RequireAuthorization()
        .WithName("EnrollUser")
        .WithSummary("Inscreve o usuário autenticado no campeonato.");

        enrollGroup.MapPost("/{enrollmentId:guid}/withdraw", async (Guid enrollmentId, IMediator mediator,
            HttpContext ctx, CancellationToken ct) =>
        {
            var requesterId = GetUserIdFromClaims(ctx);
            if (requesterId == Guid.Empty) return Results.Unauthorized();

            var command = new RecordWithdrawalCommand(enrollmentId, requesterId);
            var result = await mediator.Send(command, ct);
            return result.IsSuccess ? Results.NoContent() : Results.BadRequest(ApiResponse<object>.Fail(result.Error));
        })
        .RequireAuthorization()
        .WithName("Withdraw")
        .WithSummary("Registra desistência e converte partidas futuras em W.O.");
    }

    private static Guid GetUserIdFromClaims(HttpContext ctx)
    {
        var sub = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)
               ?? ctx.User.FindFirstValue("sub");
        return Guid.TryParse(sub, out var id) ? id : Guid.Empty;
    }
}

public record EnrollRequest(string? IdentityName = null);
