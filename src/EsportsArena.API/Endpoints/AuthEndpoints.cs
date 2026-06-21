using EsportsArena.API.Common;
using EsportsArena.Application.Auth.Commands.ChangePassword;
using EsportsArena.Application.Auth.Commands.Login;
using EsportsArena.Application.Auth.Commands.ResetLockedPassword;
using EsportsArena.Application.Common;
using EsportsArena.Application.Users.Commands.RegisterUser;
using MediatR;
using System.Security.Claims;

namespace EsportsArena.API.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/login", async (LoginRequest req, IMediator mediator, CancellationToken ct) =>
        {
            var result = await mediator.Send(new LoginCommand(req.Email, req.Password), ct);
            if (result.IsSuccess)
                return Results.Ok(ApiResponse<AuthTokenDto>.Ok(result.Value));
            if (result.Error == "ACCOUNT_LOCKED")
                return Results.Json(ApiResponse<object>.Fail("Conta bloqueada. Redefina sua senha para continuar."), statusCode: 423);
            return Results.Unauthorized();
        })
        .WithName("Login")
        .WithSummary("Autentica com e-mail e senha, retorna JWT.");

        group.MapPost("/register", async (RegisterRequest req, IMediator mediator, CancellationToken ct) =>
        {
            var command = new RegisterUserCommand(req.Email, req.Password, req.PlatformId, req.DisplayName);
            var result = await mediator.Send(command, ct);
            return result.IsSuccess
                ? Results.Created("/api/auth/login", ApiResponse<AuthTokenDto>.Ok(result.Value))
                : Results.BadRequest(ApiResponse<AuthTokenDto>.Fail(result.Error));
        })
        .WithName("Register")
        .WithSummary("Cria conta com e-mail, senha e perfil de plataforma, retorna JWT.");

        group.MapPost("/change-password", async (ChangePasswordRequest req, IMediator mediator,
            HttpContext ctx, CancellationToken ct) =>
        {
            var sub = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? ctx.User.FindFirstValue("sub");
            if (!Guid.TryParse(sub, out var userId)) return Results.Unauthorized();

            var result = await mediator.Send(new ChangePasswordCommand(userId, req.NewPassword), ct);
            return result.IsSuccess
                ? Results.Ok(ApiResponse<AuthTokenDto>.Ok(result.Value))
                : Results.BadRequest(ApiResponse<AuthTokenDto>.Fail(result.Error));
        })
        .RequireAuthorization()
        .WithName("ChangePassword")
        .WithSummary("Troca a senha do usuário autenticado e retorna novo JWT.");

        group.MapPost("/reset-locked-password", async (ResetLockedPasswordRequest req, IMediator mediator, CancellationToken ct) =>
        {
            var result = await mediator.Send(new ResetLockedPasswordCommand(req.Email, req.NewPassword), ct);
            return result.IsSuccess
                ? Results.Ok(ApiResponse<AuthTokenDto>.Ok(result.Value))
                : Results.BadRequest(ApiResponse<AuthTokenDto>.Fail(result.Error));
        })
        .WithName("ResetLockedPassword")
        .WithSummary("Redefine a senha de conta bloqueada por tentativas excessivas.");
    }
}

public record LoginRequest(string Email, string Password);
public record RegisterRequest(string Email, string Password, string PlatformId, string DisplayName);
public record ChangePasswordRequest(string NewPassword);
public record ResetLockedPasswordRequest(string Email, string NewPassword);
