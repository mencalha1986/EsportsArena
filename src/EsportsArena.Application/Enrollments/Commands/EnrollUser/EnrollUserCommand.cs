using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Enrollments.Commands.EnrollUser;

public record EnrollUserCommand(Guid ChampionshipId, Guid UserId, string? IdentityName = null) : IRequest<Result<Guid>>;
