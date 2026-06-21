using EsportsArena.Application.Common;
using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Auth.Commands.ResetLockedPassword;

public record ResetLockedPasswordCommand(string Email, string NewPassword) : IRequest<Result<AuthTokenDto>>;
