using EsportsArena.API.Common;
using EsportsArena.Application.Auth.Commands.ChangePassword;
using EsportsArena.Application.Auth.Commands.Login;
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
            return result.IsSuccess
                ? Results.Ok(ApiResponse<AuthTokenDto>.Ok(result.Value))
                : Results.Unauthorized();
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
    }
}

public record LoginRequest(string Email, string Password);
public record RegisterRequest(string Email, string Password, string PlatformId, string DisplayName);
public record ChangePasswordRequest(string NewPassword);
