using EsportsArena.Application.Common;
using EsportsArena.Domain.Common;
using EsportsArena.Domain.Interfaces;
using MediatR;

namespace EsportsArena.Application.Auth.Commands.Login;

public sealed class LoginHandler : IRequestHandler<LoginCommand, Result<AuthTokenDto>>
{
    private readonly IUserRepository _users;
    private readonly ITokenService _tokenService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IUnitOfWork _uow;

    public LoginHandler(IUserRepository users, ITokenService tokenService, IPasswordHasher passwordHasher, IUnitOfWork uow)
    {
        _users = users;
        _tokenService = tokenService;
        _passwordHasher = passwordHasher;
        _uow = uow;
    }

    public async Task<Result<AuthTokenDto>> Handle(LoginCommand request, CancellationToken ct)
    {
        var user = await _users.GetByEmailAsync(request.Email.Trim().ToLowerInvariant(), ct);
        if (user is null)
            return Result<AuthTokenDto>.Failure("E-mail ou senha inválidos.");

        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            user.RecordFailedLogin();
            await _uow.CommitAsync(ct);

            if (user.RequiresPasswordChange)
                return Result<AuthTokenDto>.Failure("ACCOUNT_LOCKED");

            var attemptsLeft = Math.Max(0, 3 - user.FailedLoginAttempts);
            var msg = attemptsLeft == 0
                ? "ACCOUNT_LOCKED"
                : $"E-mail ou senha inválidos. {attemptsLeft} tentativa{(attemptsLeft > 1 ? "s" : "")} restante{(attemptsLeft > 1 ? "s" : "")}.";

            return Result<AuthTokenDto>.Failure(msg);
        }

        user.RecordSuccessfulLogin();
        await _uow.CommitAsync(ct);

        var token = _tokenService.GenerateToken(user);
        return Result<AuthTokenDto>.Success(token with { RequiresPasswordChange = user.RequiresPasswordChange });
    }
}
