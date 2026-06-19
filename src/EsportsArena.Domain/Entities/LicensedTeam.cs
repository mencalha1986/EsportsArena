using EsportsArena.Domain.Common;

namespace EsportsArena.Domain.Entities;

public sealed class LicensedTeam : Entity
{
    public Guid GameId { get; private set; }
    public string Name { get; private set; } = default!;
    public string? LogoUrl { get; private set; }
    public byte Stars { get; private set; }

    private LicensedTeam() { }

    public static Result<LicensedTeam> Create(Guid gameId, string name, byte stars, string? logoUrl = null)
    {
        if (gameId == Guid.Empty)
            return Result<LicensedTeam>.Failure("GameId é obrigatório.");
        if (string.IsNullOrWhiteSpace(name))
            return Result<LicensedTeam>.Failure("Nome do time é obrigatório.");
        if (stars < 1 || stars > 5)
            return Result<LicensedTeam>.Failure("Stars deve ser entre 1 e 5.");

        return Result<LicensedTeam>.Success(new LicensedTeam
        {
            GameId = gameId,
            Name = name.Trim(),
            Stars = stars,
            LogoUrl = logoUrl
        });
    }
}
