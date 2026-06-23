using EsportsArena.API.Common;
using EsportsArena.Application.Users.Queries.CheckPlatformIdAvailability;
using EsportsArena.Application.Users.Queries.GetUserProfile;
using EsportsArena.Application.Users.Queries.SearchPlayers;
using EsportsArena.Domain.Interfaces;
using MediatR;
using System.Security.Claims;

namespace EsportsArena.API.Endpoints;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/users").WithTags("Users");

        group.MapGet("/platform-id/check", async (string value, IMediator mediator, CancellationToken ct) =>
        {
            var result = await mediator.Send(new CheckPlatformIdAvailabilityQuery(value), ct);
            return result.IsSuccess
                ? Results.Ok(ApiResponse<PlatformIdAvailabilityDto>.Ok(result.Value))
                : Results.BadRequest(ApiResponse<PlatformIdAvailabilityDto>.Fail(result.Error));
        })
        .WithName("CheckPlatformId")
        .WithSummary("Verifica disponibilidade do ID e retorna 3 sugestões se ocupado.");

        group.MapGet("/me", async (IUserRepository users, IMediator mediator, HttpContext ctx, CancellationToken ct) =>
        {
            var sub = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)
                   ?? ctx.User.FindFirstValue("sub");
            if (sub is null || !Guid.TryParse(sub, out var userId))
                return Results.Unauthorized();

            var user = await users.GetByIdAsync(userId, ct);
            if (user is null) return Results.NotFound(ApiResponse<object>.Fail("Perfil não encontrado."));

            var result = await mediator.Send(new GetUserProfileQuery(user.PlatformId), ct);
            return result.IsSuccess
                ? Results.Ok(ApiResponse<UserProfileDto>.Ok(result.Value))
                : Results.NotFound(ApiResponse<UserProfileDto>.Fail(result.Error));
        })
        .RequireAuthorization()
        .WithName("GetMyProfile")
        .WithSummary("Retorna o perfil do usuário autenticado com estatísticas.");

        group.MapGet("/search", async (string q, IMediator mediator, CancellationToken ct) =>
        {
            var result = await mediator.Send(new SearchPlayersQuery(q ?? string.Empty), ct);
            return result.IsSuccess
                ? Results.Ok(ApiResponse<List<PlayerSearchResultDto>>.Ok(result.Value))
                : Results.BadRequest(ApiResponse<List<PlayerSearchResultDto>>.Fail(result.Error));
        })
        .RequireAuthorization("AdminOrAbove")
        .WithName("SearchPlayers")
        .WithSummary("Busca jogadores por e-mail ou nickname (organizadores).");

        group.MapGet("/{platformId}", async (string platformId, IMediator mediator, CancellationToken ct) =>
        {
            var result = await mediator.Send(new GetUserProfileQuery(platformId), ct);
            return result.IsSuccess
                ? Results.Ok(ApiResponse<UserProfileDto>.Ok(result.Value))
                : Results.NotFound(ApiResponse<UserProfileDto>.Fail(result.Error));
        })
        .WithName("GetUserProfile")
        .WithSummary("Retorna o perfil público de um usuário.");
    }
}
