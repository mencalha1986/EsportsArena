using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Draft.Commands.RunLiveDraft;

public record RunLiveDraftCommand(Guid ChampionshipId, Guid RequesterId) : IRequest<Result<IReadOnlyList<DraftResultDto>>>;

public record DraftResultDto(Guid EnrollmentId, string PlayerPlatformId, Guid TeamId, string TeamName, byte TeamStars);
