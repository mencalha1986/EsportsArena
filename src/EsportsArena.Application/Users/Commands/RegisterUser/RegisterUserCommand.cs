using EsportsArena.Application.Common;
using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Users.Commands.RegisterUser;

public record RegisterUserCommand(string Email, string Password, string PlatformId, string DisplayName)
    : IRequest<Result<AuthTokenDto>>;
