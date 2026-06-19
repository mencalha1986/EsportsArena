namespace EsportsArena.Application.Admin.Queries.GetAdminStats;

public record AdminStatsDto(
    int TotalUsers,
    int TotalAdmins,
    int TotalChampionships,
    int ChampionshipsInProgress,
    int ChampionshipsFinished,
    int ChampionshipsOpen,
    IReadOnlyList<GameRankingDto> GameRankings
);

public record GameRankingDto(string GameName, string? IconUrl, int ChampionshipCount);
