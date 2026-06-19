using EsportsArena.Domain.Common;

namespace EsportsArena.Domain.Entities;

public sealed class Enrollment : Entity
{
    public Guid ChampionshipId { get; private set; }
    public Guid UserId { get; private set; }
    public string? IdentityName { get; private set; }
    public Guid? LicensedTeamId { get; private set; }
    public DateTime? WithdrewAt { get; private set; }

    public bool IsActive => WithdrewAt == null;

    private Enrollment() { }

    public static Result<Enrollment> Create(Guid championshipId, Guid userId, string? identityName = null)
    {
        if (championshipId == Guid.Empty) return Result<Enrollment>.Failure("ChampionshipId é obrigatório.");
        if (userId == Guid.Empty) return Result<Enrollment>.Failure("UserId é obrigatório.");

        return Result<Enrollment>.Success(new Enrollment
        {
            ChampionshipId = championshipId,
            UserId = userId,
            IdentityName = identityName?.Trim()
        });
    }

    public Result AssignTeam(Guid licensedTeamId)
    {
        if (LicensedTeamId.HasValue)
            return Result.Failure("Time já atribuído a esta inscrição.");
        if (licensedTeamId == Guid.Empty)
            return Result.Failure("LicensedTeamId inválido.");
        LicensedTeamId = licensedTeamId;
        MarkUpdated();
        return Result.Success();
    }

    public Result Withdraw()
    {
        if (!IsActive)
            return Result.Failure("Inscrição já está desistente.");
        WithdrewAt = DateTime.UtcNow;
        MarkUpdated();
        return Result.Success();
    }
}
