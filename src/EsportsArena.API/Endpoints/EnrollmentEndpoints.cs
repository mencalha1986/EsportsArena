using EsportsArena.API.Common;
using EsportsArena.Application.Championships.Commands.RecordWithdrawal;
using EsportsArena.Application.Enrollments.Commands.EnrollPlayerByOrganizer;
using EsportsArena.Application.Enrollments.Commands.EnrollUser;
using EsportsArena.Application.Enrollments.Commands.ReviewEnrollment;
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

        // List active enrollments (pending + accepted) for a championship
        champGroup.MapGet("/", async (Guid championshipId, IEnrollmentRepository enrollments, CancellationToken ct) =>
        {
            var list = await enrollments.GetActiveByChampionshipAsync(championshipId, ct);
            return Results.Ok(ApiResponse<object>.Ok(list.Select(e => new
            {
                e.Id, e.UserId, e.IdentityName, e.LicensedTeamId,
                Status = e.Status.ToString(), e.IsActive, e.CreatedAt
            })));
        })
        .WithName("ListEnrollments")
        .WithSummary("Lista inscrições ativas (pendentes e aceitas) de um campeonato.");

        // List pending enrollments — organizer only
        champGroup.MapGet("/pending", async (Guid championshipId, IEnrollmentRepository enrollments,
            IUserRepository users, CancellationToken ct) =>
        {
            var list = await enrollments.GetPendingByChampionshipAsync(championshipId, ct);
            var userIds = list.Select(e => e.UserId).Distinct();
            var userMap = (await users.GetByIdsAsync(userIds, ct)).ToDictionary(u => u.Id);
            return Results.Ok(ApiResponse<object>.Ok(list.Select(e =>
            {
                userMap.TryGetValue(e.UserId, out var user);
                return new
                {
                    e.Id, e.UserId, e.IdentityName, e.LicensedTeamId,
                    Status = e.Status.ToString(), e.CreatedAt,
                    UserDisplayName = user?.DisplayName,
                    UserPlatformId = user?.PlatformId
                };
            })));
        })
        .RequireAuthorization("AdminOrAbove")
        .WithName("ListPendingEnrollments")
        .WithSummary("Lista inscrições pendentes de aprovação (organizador).");

        // Current user's enrollment in a championship
        champGroup.MapGet("/my", async (Guid championshipId, IEnrollmentRepository enrollments,
            HttpContext ctx, CancellationToken ct) =>
        {
            var userId = GetUserIdFromClaims(ctx);
            if (userId == Guid.Empty) return Results.Unauthorized();

            var enrollment = await enrollments.GetByChampionshipAndUserAsync(championshipId, userId, ct);
            if (enrollment is null)
                return Results.Ok(ApiResponse<object>.Ok(null!));

            return Results.Ok(ApiResponse<object>.Ok(new
            {
                enrollment.Id, enrollment.IdentityName, enrollment.LicensedTeamId,
                Status = enrollment.Status.ToString(), enrollment.IsActive, enrollment.CreatedAt
            }));
        })
        .RequireAuthorization()
        .WithName("MyEnrollment")
        .WithSummary("Retorna a inscrição do usuário autenticado no campeonato.");

        // Organizer manually enrolls a player (auto-accepted)
        champGroup.MapPost("/manual", async (Guid championshipId, ManualEnrollRequest req, IMediator mediator,
            HttpContext ctx, CancellationToken ct) =>
        {
            var organizerId = GetUserIdFromClaims(ctx);
            if (organizerId == Guid.Empty) return Results.Unauthorized();

            var command = new EnrollPlayerByOrganizerCommand(championshipId, organizerId, req.UserId, req.IdentityName);
            var result = await mediator.Send(command, ct);
            return result.IsSuccess
                ? Results.Created($"/api/v1/championships/{championshipId}/enrollments/{result.Value}",
                    ApiResponse<Guid>.Ok(result.Value))
                : Results.BadRequest(ApiResponse<Guid>.Fail(result.Error));
        })
        .RequireAuthorization("AdminOrAbove")
        .WithName("ManualEnrollPlayer")
        .WithSummary("Organizador adiciona jogador diretamente ao campeonato (inscrição já aceita).");

        // Enroll in a championship
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

        // Withdraw from enrollment
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

        // Accept enrollment — organizer only
        enrollGroup.MapPatch("/{enrollmentId:guid}/accept", async (Guid enrollmentId, IMediator mediator,
            HttpContext ctx, CancellationToken ct) =>
        {
            var requesterId = GetUserIdFromClaims(ctx);
            if (requesterId == Guid.Empty) return Results.Unauthorized();

            var result = await mediator.Send(new ReviewEnrollmentCommand(enrollmentId, requesterId, "accept"), ct);
            return result.IsSuccess ? Results.NoContent() : Results.BadRequest(ApiResponse<object>.Fail(result.Error));
        })
        .RequireAuthorization()
        .WithName("AcceptEnrollment")
        .WithSummary("Aceita a inscrição de um jogador (organizador).");

        // Reject enrollment — organizer only
        enrollGroup.MapPatch("/{enrollmentId:guid}/reject", async (Guid enrollmentId, IMediator mediator,
            HttpContext ctx, CancellationToken ct) =>
        {
            var requesterId = GetUserIdFromClaims(ctx);
            if (requesterId == Guid.Empty) return Results.Unauthorized();

            var result = await mediator.Send(new ReviewEnrollmentCommand(enrollmentId, requesterId, "reject"), ct);
            return result.IsSuccess ? Results.NoContent() : Results.BadRequest(ApiResponse<object>.Fail(result.Error));
        })
        .RequireAuthorization()
        .WithName("RejectEnrollment")
        .WithSummary("Rejeita a inscrição de um jogador (organizador).");
    }

    private static Guid GetUserIdFromClaims(HttpContext ctx)
    {
        var sub = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)
               ?? ctx.User.FindFirstValue("sub");
        return Guid.TryParse(sub, out var id) ? id : Guid.Empty;
    }
}

public record EnrollRequest(string? IdentityName = null);
public record ManualEnrollRequest(Guid UserId, string? IdentityName = null);
