using EsportsArena.Application.Common;
using EsportsArena.Application.Users.Queries.ListUsers;
using EsportsArena.Domain.Common;
using EsportsArena.Domain.Entities;
using EsportsArena.Domain.Interfaces;
using MediatR;

namespace EsportsArena.Application.Admin.Commands.CreateClient;

public sealed class CreateClientHandler : IRequestHandler<CreateClientCommand, Result<UserSummaryDto>>
{
    private readonly IUserRepository _users;
    private readonly IUnitOfWork _uow;
    private readonly IPasswordHasher _passwordHasher;

    public CreateClientHandler(IUserRepository users, IUnitOfWork uow, IPasswordHasher passwordHasher)
        => (_users, _uow, _passwordHasher) = (users, uow, passwordHasher);

    public async Task<Result<UserSummaryDto>> Handle(CreateClientCommand request, CancellationToken ct)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        if (await _users.EmailExistsAsync(email, ct))
            return Result<UserSummaryDto>.Failure("E-mail já cadastrado.");

        if (await _users.PlatformIdExistsAsync(request.PlatformId, ct))
            return Result<UserSummaryDto>.Failure($"ID '{request.PlatformId}' já está em uso.");

        var passwordHash = _passwordHasher.Hash(request.Password);
        var userResult = User.Create(email, passwordHash, request.PlatformId, request.DisplayName);
        if (!userResult.IsSuccess) return Result<UserSummaryDto>.Failure(userResult.Error);

        var user = userResult.Value;
        user.ActivateAsAdmin(request.Notes);

        await _users.AddAsync(user, ct);
        await _uow.CommitAsync(ct);

        return Result<UserSummaryDto>.Success(new UserSummaryDto(
            user.Id, user.PlatformId, user.DisplayName,
            user.Role.ToString(), user.IsActive, user.SubscriptionNotes, user.CreatedAt));
    }
}
