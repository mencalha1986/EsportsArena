using EsportsArena.Application.Common;
using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Auth.Commands.Login;

public record LoginCommand(string Email, string Password) : IRequest<Result<AuthTokenDto>>;
