using EsportsArena.Application.Common;
using EsportsArena.Domain.Common;
using EsportsArena.Domain.Interfaces;
using MediatR;

namespace EsportsArena.Application.Auth.Commands.ChangePassword;

public sealed class ChangePasswordHandler : IRequestHandler<ChangePasswordCommand, Result<AuthTokenDto>>
{
    private readonly IUserRepository _users;
    private readonly ITokenService _tokenService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IUnitOfWork _uow;

    public ChangePasswordHandler(IUserRepository users, ITokenService tokenService, IPasswordHasher passwordHasher, IUnitOfWork uow)
    {
        _users = users;
        _tokenService = tokenService;
        _passwordHasher = passwordHasher;
        _uow = uow;
    }

    public async Task<Result<AuthTokenDto>> Handle(ChangePasswordCommand request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
            return Result<AuthTokenDto>.Failure("A nova senha deve ter pelo menos 6 caracteres.");

        var user = await _users.GetByIdAsync(request.UserId, ct);
        if (user is null)
            return Result<AuthTokenDto>.Failure("Usuário não encontrado.");

        var newHash = _passwordHasher.Hash(request.NewPassword);
        var result = user.ChangePassword(newHash);
        if (!result.IsSuccess)
            return Result<AuthTokenDto>.Failure(result.Error);

        await _uow.CommitAsync(ct);
        return Result<AuthTokenDto>.Success(_tokenService.GenerateToken(user));
    }
}
