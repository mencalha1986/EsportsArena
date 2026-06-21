using EsportsArena.Application.Common;
using EsportsArena.Domain.Common;
using EsportsArena.Domain.Interfaces;
using MediatR;

namespace EsportsArena.Application.Auth.Commands.ResetLockedPassword;

public sealed class ResetLockedPasswordHandler : IRequestHandler<ResetLockedPasswordCommand, Result<AuthTokenDto>>
{
    private readonly IUserRepository _users;
    private readonly ITokenService _tokenService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IUnitOfWork _uow;

    public ResetLockedPasswordHandler(IUserRepository users, ITokenService tokenService, IPasswordHasher passwordHasher, IUnitOfWork uow)
    {
        _users = users;
        _tokenService = tokenService;
        _passwordHasher = passwordHasher;
        _uow = uow;
    }

    public async Task<Result<AuthTokenDto>> Handle(ResetLockedPasswordCommand request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
            return Result<AuthTokenDto>.Failure("A nova senha deve ter pelo menos 6 caracteres.");

        var user = await _users.GetByEmailAsync(request.Email.Trim().ToLowerInvariant(), ct);
        if (user is null)
            return Result<AuthTokenDto>.Failure("E-mail não encontrado.");

        if (!user.RequiresPasswordChange)
            return Result<AuthTokenDto>.Failure("Esta conta não está bloqueada.");

        var newHash = _passwordHasher.Hash(request.NewPassword);
        var changeResult = user.ChangePassword(newHash);
        if (!changeResult.IsSuccess)
            return Result<AuthTokenDto>.Failure(changeResult.Error);

        await _uow.CommitAsync(ct);
        return Result<AuthTokenDto>.Success(_tokenService.GenerateToken(user));
    }
}
