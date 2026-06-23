namespace EsportsArena.Application.Users.Queries.SearchPlayers;

public sealed record PlayerSearchResultDto(Guid Id, string PlatformId, string DisplayName, string? AvatarUrl);
