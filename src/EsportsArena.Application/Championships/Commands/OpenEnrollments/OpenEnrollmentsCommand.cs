using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Championships.Commands.OpenEnrollments;

public record OpenEnrollmentsCommand(Guid ChampionshipId, Guid RequesterId) : IRequest<Result>;
