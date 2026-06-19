using EsportsArena.Domain.Common;
using EsportsArena.Domain.Enums;

namespace EsportsArena.Domain.Entities;

public sealed class Championship : Entity
{
    public Guid GameId { get; private set; }
    public Guid OrganizerId { get; private set; }
    public string Name { get; private set; } = default!;
    public string? Description { get; private set; }
    public ChampionshipStatus Status { get; private set; }
    public LeagueFormat Format { get; private set; }
    public byte? MinStars { get; private set; }
    public byte? MaxStars { get; private set; }

    private Championship() { }

    public static Result<Championship> Create(
        Guid gameId, Guid organizerId, string name, LeagueFormat format,
        string? description = null, byte? minStars = null, byte? maxStars = null)
    {
        if (gameId == Guid.Empty) return Result<Championship>.Failure("GameId é obrigatório.");
        if (organizerId == Guid.Empty) return Result<Championship>.Failure("OrganizerId é obrigatório.");
        if (string.IsNullOrWhiteSpace(name)) return Result<Championship>.Failure("Nome é obrigatório.");
        if (minStars.HasValue && maxStars.HasValue && minStars > maxStars)
            return Result<Championship>.Failure("MinStars não pode ser maior que MaxStars.");

        return Result<Championship>.Success(new Championship
        {
            GameId = gameId,
            OrganizerId = organizerId,
            Name = name.Trim(),
            Description = description?.Trim(),
            Status = ChampionshipStatus.Draft,
            Format = format,
            MinStars = minStars,
            MaxStars = maxStars
        });
    }

    public Result OpenEnrollments()
    {
        if (Status != ChampionshipStatus.Draft)
            return Result.Failure("Campeonato precisa estar em rascunho para abrir inscrições.");
        Status = ChampionshipStatus.EnrollmentsOpen;
        MarkUpdated();
        return Result.Success();
    }

    public Result Start()
    {
        if (Status != ChampionshipStatus.EnrollmentsOpen)
            return Result.Failure("Inscrições precisam estar abertas para iniciar o campeonato.");
        Status = ChampionshipStatus.InProgress;
        MarkUpdated();
        return Result.Success();
    }

    public Result Finish()
    {
        if (Status != ChampionshipStatus.InProgress)
            return Result.Failure("Campeonato precisa estar em andamento para ser encerrado.");
        Status = ChampionshipStatus.Finished;
        MarkUpdated();
        return Result.Success();
    }
}
