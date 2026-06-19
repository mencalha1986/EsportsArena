using EsportsArena.Domain.Common;
using EsportsArena.Domain.Interfaces;
using MediatR;

namespace EsportsArena.Application.Users.Commands.ManageClientRole;

public sealed class ActivateAdminHandler : IRequestHandler<ActivateAdminCommand, Result>
{
    private readonly IUserRepository _users;
    private readonly IUnitOfWork _uow;
    public ActivateAdminHandler(IUserRepository users, IUnitOfWork uow) => (_users, _uow) = (users, uow);

    public async Task<Result> Handle(ActivateAdminCommand request, CancellationToken ct)
    {
        var user = await _users.GetByIdAsync(request.UserId, ct);
        if (user is null) return Result.Failure("Usuário não encontrado.");
        user.ActivateAsAdmin(request.Notes);
        await _uow.CommitAsync(ct);
        return Result.Success();
    }
}

public sealed class DeactivateAdminHandler : IRequestHandler<DeactivateAdminCommand, Result>
{
    private readonly IUserRepository _users;
    private readonly IUnitOfWork _uow;
    public DeactivateAdminHandler(IUserRepository users, IUnitOfWork uow) => (_users, _uow) = (users, uow);

    public async Task<Result> Handle(DeactivateAdminCommand request, CancellationToken ct)
    {
        var user = await _users.GetByIdAsync(request.UserId, ct);
        if (user is null) return Result.Failure("Usuário não encontrado.");
        user.Deactivate(request.Reason);
        await _uow.CommitAsync(ct);
        return Result.Success();
    }
}

public sealed class ReactivateAdminHandler : IRequestHandler<ReactivateAdminCommand, Result>
{
    private readonly IUserRepository _users;
    private readonly IUnitOfWork _uow;
    public ReactivateAdminHandler(IUserRepository users, IUnitOfWork uow) => (_users, _uow) = (users, uow);

    public async Task<Result> Handle(ReactivateAdminCommand request, CancellationToken ct)
    {
        var user = await _users.GetByIdAsync(request.UserId, ct);
        if (user is null) return Result.Failure("Usuário não encontrado.");
        user.Reactivate(request.Notes);
        await _uow.CommitAsync(ct);
        return Result.Success();
    }
}
