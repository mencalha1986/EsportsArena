using EsportsArena.Domain.Common;
using EsportsArena.Domain.Entities;
using EsportsArena.Domain.Interfaces;
using MediatR;

namespace EsportsArena.Application.Users.Commands.RegisterUser;

public sealed class RegisterUserHandler : IRequestHandler<RegisterUserCommand, Result<Guid>>
{
    private readonly IUserRepository _users;
    private readonly IUnitOfWork _uow;

    public RegisterUserHandler(IUserRepository users, IUnitOfWork uow)
    {
        _users = users;
        _uow = uow;
    }

    public async Task<Result<Guid>> Handle(RegisterUserCommand request, CancellationToken ct)
    {
        if (await _users.GetBySupabaseUidAsync(request.SupabaseUid, ct) is not null)
            return Result<Guid>.Failure("Usuário já registrado.");

        if (await _users.PlatformIdExistsAsync(request.PlatformId, ct))
        {
            var suggestions = await _users.SuggestAvailableIdsAsync(request.PlatformId, 3, ct);
            return Result<Guid>.Failure(
                $"ID '{request.PlatformId}' já está em uso. Sugestões: {string.Join(", ", suggestions)}");
        }

        var result = User.Create(request.SupabaseUid, request.PlatformId, request.DisplayName);
        if (!result.IsSuccess) return Result<Guid>.Failure(result.Error);

        await _users.AddAsync(result.Value, ct);
        await _uow.CommitAsync(ct);
        return Result<Guid>.Success(result.Value.Id);
    }
}
