using EsportsArena.API.Common;
using EsportsArena.Application.Users.Commands.RegisterUser;
using EsportsArena.Application.Users.Queries.CheckPlatformIdAvailability;
using EsportsArena.Application.Users.Queries.GetUserProfile;
using EsportsArena.Domain.Interfaces;
using MediatR;
using System.Security.Claims;

namespace EsportsArena.API.Endpoints;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/users").WithTags("Users");

        group.MapPost("/register", async (RegisterUserRequest req, IMediator mediator, HttpContext ctx, CancellationToken ct) =>
        {
            var supabaseUid = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? ctx.User.FindFirstValue("sub");
            if (supabaseUid is null) return Results.Unauthorized();

            var command = new RegisterUserCommand(supabaseUid, req.PlatformId, req.DisplayName);
            var result = await mediator.Send(command, ct);
            return result.IsSuccess
                ? Results.Created($"/api/v1/users/{req.PlatformId}", ApiResponse<Guid>.Ok(result.Value))
                : Results.BadRequest(ApiResponse<Guid>.Fail(result.Error));
        })
        .RequireAuthorization()
        .WithName("RegisterUser")
        .WithSummary("Registra o perfil do usuário após autenticação Supabase.");

        group.MapGet("/platform-id/check", async (string value, IMediator mediator, CancellationToken ct) =>
        {
            var result = await mediator.Send(new CheckPlatformIdAvailabilityQuery(value), ct);
            return result.IsSuccess
                ? Results.Ok(ApiResponse<PlatformIdAvailabilityDto>.Ok(result.Value))
                : Results.BadRequest(ApiResponse<PlatformIdAvailabilityDto>.Fail(result.Error));
        })
        .WithName("CheckPlatformId")
        .WithSummary("Verifica disponibilidade do ID e retorna 3 sugestões se ocupado.");

        group.MapGet("/me", async (IMediator mediator, IUserRepository users, HttpContext ctx, CancellationToken ct) =>
        {
            var supabaseUid = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? ctx.User.FindFirstValue("sub");
            if (supabaseUid is null) return Results.Unauthorized();

            var user = await users.GetBySupabaseUidAsync(supabaseUid, ct);
            if (user is null) return Results.NotFound(ApiResponse<object>.Fail("Perfil não encontrado."));

            var result = await mediator.Send(new GetUserProfileQuery(user.PlatformId), ct);
            return result.IsSuccess
                ? Results.Ok(ApiResponse<UserProfileDto>.Ok(result.Value))
                : Results.NotFound(ApiResponse<UserProfileDto>.Fail(result.Error));
        })
        .RequireAuthorization()
        .WithName("GetMyProfile")
        .WithSummary("Retorna o perfil do usuário autenticado com estatísticas.");

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

public record RegisterUserRequest(string PlatformId, string DisplayName);
