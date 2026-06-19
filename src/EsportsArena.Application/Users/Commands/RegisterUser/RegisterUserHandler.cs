using EsportsArena.Application.Common;
using EsportsArena.Domain.Common;
using EsportsArena.Domain.Entities;
using EsportsArena.Domain.Interfaces;
using MediatR;

namespace EsportsArena.Application.Users.Commands.RegisterUser;

public sealed class RegisterUserHandler : IRequestHandler<RegisterUserCommand, Result<AuthTokenDto>>
{
    private readonly IUserRepository _users;
    private readonly IUnitOfWork _uow;
    private readonly ITokenService _tokenService;
    private readonly IPasswordHasher _passwordHasher;

    public RegisterUserHandler(IUserRepository users, IUnitOfWork uow, ITokenService tokenService, IPasswordHasher passwordHasher)
    {
        _users = users;
        _uow = uow;
        _tokenService = tokenService;
        _passwordHasher = passwordHasher;
    }

    public async Task<Result<AuthTokenDto>> Handle(RegisterUserCommand request, CancellationToken ct)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        if (await _users.EmailExistsAsync(email, ct))
            return Result<AuthTokenDto>.Failure("E-mail já cadastrado.");

        if (await _users.PlatformIdExistsAsync(request.PlatformId, ct))
        {
            var suggestions = await _users.SuggestAvailableIdsAsync(request.PlatformId, 3, ct);
            return Result<AuthTokenDto>.Failure(
                $"ID '{request.PlatformId}' já está em uso. Sugestões: {string.Join(", ", suggestions)}");
        }

        var passwordHash = _passwordHasher.Hash(request.Password);

        var result = User.Create(email, passwordHash, request.PlatformId, request.DisplayName);
        if (!result.IsSuccess) return Result<AuthTokenDto>.Failure(result.Error);

        await _users.AddAsync(result.Value, ct);
        await _uow.CommitAsync(ct);

        return Result<AuthTokenDto>.Success(_tokenService.GenerateToken(result.Value));
    }
}
