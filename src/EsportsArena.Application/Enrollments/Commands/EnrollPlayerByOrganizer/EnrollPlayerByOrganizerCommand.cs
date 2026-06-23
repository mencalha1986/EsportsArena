using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Enrollments.Commands.EnrollPlayerByOrganizer;

public sealed record EnrollPlayerByOrganizerCommand(
    Guid ChampionshipId,
    Guid OrganizerId,
    Guid TargetUserId,
    string? IdentityName
) : IRequest<Result<Guid>>;
