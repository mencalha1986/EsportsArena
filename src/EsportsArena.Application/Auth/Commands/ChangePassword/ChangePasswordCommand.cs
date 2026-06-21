using EsportsArena.Application.Common;
using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Auth.Commands.ChangePassword;

public record ChangePasswordCommand(Guid UserId, string NewPassword) : IRequest<Result<AuthTokenDto>>;
