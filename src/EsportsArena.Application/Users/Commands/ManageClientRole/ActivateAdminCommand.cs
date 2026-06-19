using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Users.Commands.ManageClientRole;

public record ActivateAdminCommand(Guid UserId, string? Notes) : IRequest<Result>;

public record DeactivateAdminCommand(Guid UserId, string? Reason) : IRequest<Result>;

public record ReactivateAdminCommand(Guid UserId, string? Notes) : IRequest<Result>;
