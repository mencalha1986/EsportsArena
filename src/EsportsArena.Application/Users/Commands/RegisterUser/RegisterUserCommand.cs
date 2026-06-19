using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Users.Commands.RegisterUser;

public record RegisterUserCommand(string SupabaseUid, string PlatformId, string DisplayName) : IRequest<Result<Guid>>;
