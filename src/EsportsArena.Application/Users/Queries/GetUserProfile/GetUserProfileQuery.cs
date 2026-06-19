using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Users.Queries.GetUserProfile;

public record GetUserProfileQuery(string PlatformId) : IRequest<Result<UserProfileDto>>;

public record UserProfileDto(
    Guid Id,
    string PlatformId,
    string DisplayName,
    string? AvatarUrl,
    int Wins,
    int Draws,
    int Losses,
    int Titles,
    IReadOnlyList<RecentMatchDto> RecentMatches,
    string Role,
    bool IsActive);

public record RecentMatchDto(
    string ChampionshipName,
    string OpponentPlatformId,
    string? OpponentTeamName,
    short? MyScore,
    short? OpponentScore,
    string Status,
    DateTime? PlayedAt);
