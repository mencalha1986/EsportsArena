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

    public LoginHandler(IUserRepository users, ITokenService tokenService, IPasswordHasher passwordHasher)
    {
        _users = users;
        _tokenService = tokenService;
        _passwordHasher = passwordHasher;
    }

    public async Task<Result<AuthTokenDto>> Handle(LoginCommand request, CancellationToken ct)
    {
        var user = await _users.GetByEmailAsync(request.Email.Trim().ToLowerInvariant(), ct);
        if (user is null)
            return Result<AuthTokenDto>.Failure("E-mail ou senha inválidos.");

        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
            return Result<AuthTokenDto>.Failure("E-mail ou senha inválidos.");

        return Result<AuthTokenDto>.Success(_tokenService.GenerateToken(user));
    }
}
