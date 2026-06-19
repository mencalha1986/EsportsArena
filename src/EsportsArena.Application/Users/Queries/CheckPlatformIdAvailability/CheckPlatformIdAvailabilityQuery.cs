using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Users.Queries.CheckPlatformIdAvailability;

public record CheckPlatformIdAvailabilityQuery(string PlatformId) : IRequest<Result<PlatformIdAvailabilityDto>>;

public record PlatformIdAvailabilityDto(bool Available, IReadOnlyList<string> Suggestions);
