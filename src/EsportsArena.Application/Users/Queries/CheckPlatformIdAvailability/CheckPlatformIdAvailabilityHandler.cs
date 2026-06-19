using EsportsArena.Domain.Common;
using EsportsArena.Domain.Interfaces;
using MediatR;

namespace EsportsArena.Application.Users.Queries.CheckPlatformIdAvailability;

public sealed class CheckPlatformIdAvailabilityHandler
    : IRequestHandler<CheckPlatformIdAvailabilityQuery, Result<PlatformIdAvailabilityDto>>
{
    private readonly IUserRepository _users;

    public CheckPlatformIdAvailabilityHandler(IUserRepository users) => _users = users;

    public async Task<Result<PlatformIdAvailabilityDto>> Handle(
        CheckPlatformIdAvailabilityQuery request, CancellationToken ct)
    {
        var exists = await _users.PlatformIdExistsAsync(request.PlatformId, ct);
        if (!exists)
            return Result<PlatformIdAvailabilityDto>.Success(new PlatformIdAvailabilityDto(true, []));

        var suggestions = await _users.SuggestAvailableIdsAsync(request.PlatformId, 3, ct);
        return Result<PlatformIdAvailabilityDto>.Success(new PlatformIdAvailabilityDto(false, suggestions));
    }
}
