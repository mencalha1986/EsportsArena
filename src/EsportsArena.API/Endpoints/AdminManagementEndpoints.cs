using EsportsArena.API.Common;
using EsportsArena.Application.Admin.Queries.GetAdminStats;
using EsportsArena.Application.Users.Commands.ManageClientRole;
using EsportsArena.Application.Users.Queries.ListUsers;
using MediatR;

namespace EsportsArena.API.Endpoints;

public static class AdminManagementEndpoints
{
    public static void MapAdminManagementEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/admin/users")
            .WithTags("Admin")
            .RequireAuthorization("SuperAdminOnly");

        group.MapGet("/stats", async (IMediator mediator, CancellationToken ct) =>
        {
            var result = await mediator.Send(new GetAdminStatsQuery(), ct);
            return Results.Ok(ApiResponse<AdminStatsDto>.Ok(result.Value));
        })
        .WithName("GetAdminStats")
        .WithSummary("Retorna métricas gerais da plataforma (SuperAdmin).");

        group.MapGet("/", async (string? role, bool? isActive, IMediator mediator, CancellationToken ct) =>
        {
            var result = await mediator.Send(new ListUsersQuery(role, isActive), ct);
            return Results.Ok(ApiResponse<IReadOnlyList<UserSummaryDto>>.Ok(result.Value));
        })
        .WithName("ListUsers")
        .WithSummary("Lista todos os usuários (SuperAdmin). Filtros: role, isActive.");

        group.MapPost("/{userId:guid}/activate", async (Guid userId, ActivateRequest? req, IMediator mediator, CancellationToken ct) =>
        {
            var result = await mediator.Send(new ActivateAdminCommand(userId, req?.Notes), ct);
            return result.IsSuccess ? Results.NoContent() : Results.BadRequest(ApiResponse<object>.Fail(result.Error));
        })
        .WithName("ActivateAdmin")
        .WithSummary("Promove usuário para Admin (cliente ativo).");

        group.MapPost("/{userId:guid}/deactivate", async (Guid userId, ReasonRequest? req, IMediator mediator, CancellationToken ct) =>
        {
            var result = await mediator.Send(new DeactivateAdminCommand(userId, req?.Reason), ct);
            return result.IsSuccess ? Results.NoContent() : Results.BadRequest(ApiResponse<object>.Fail(result.Error));
        })
        .WithName("DeactivateAdmin")
        .WithSummary("Suspende conta do cliente (inadimplência ou cancelamento).");

        group.MapPost("/{userId:guid}/reactivate", async (Guid userId, ActivateRequest? req, IMediator mediator, CancellationToken ct) =>
        {
            var result = await mediator.Send(new ReactivateAdminCommand(userId, req?.Notes), ct);
            return result.IsSuccess ? Results.NoContent() : Results.BadRequest(ApiResponse<object>.Fail(result.Error));
        })
        .WithName("ReactivateAdmin")
        .WithSummary("Reativa conta do cliente após pagamento.");
    }
}

public record ActivateRequest(string? Notes = null);
public record ReasonRequest(string? Reason = null);
