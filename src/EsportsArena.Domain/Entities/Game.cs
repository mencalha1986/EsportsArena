using EsportsArena.Domain.Common;
using EsportsArena.Domain.Enums;

namespace EsportsArena.Domain.Entities;

public sealed class Game : Entity
{
    public string Name { get; private set; } = default!;
    public string Slug { get; private set; } = default!;
    public string Category { get; private set; } = "Other";
    public InscriptionMode InscriptionMode { get; private set; }
    public string ScoreDisplay { get; private set; } = "goals"; // goals | points | sets
    public string? IconUrl { get; private set; }
    public bool IsActive { get; private set; }

    private Game() { }

    public static Result<Game> Create(string name, string slug, InscriptionMode mode, string scoreDisplay = "goals", string? iconUrl = null, string category = "Other")
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result<Game>.Failure("Nome do jogo é obrigatório.");
        if (string.IsNullOrWhiteSpace(slug))
            return Result<Game>.Failure("Slug do jogo é obrigatório.");

        return Result<Game>.Success(new Game
        {
            Name = name.Trim(),
            Slug = slug.ToLowerInvariant(),
            Category = string.IsNullOrWhiteSpace(category) ? "Other" : category.Trim(),
            InscriptionMode = mode,
            ScoreDisplay = scoreDisplay,
            IconUrl = iconUrl,
            IsActive = true
        });
    }

    public Result Deactivate() { IsActive = false; MarkUpdated(); return Result.Success(); }
    public Result Activate() { IsActive = true; MarkUpdated(); return Result.Success(); }
}
