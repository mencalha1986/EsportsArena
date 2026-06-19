using EsportsArena.Domain.Common;

namespace EsportsArena.Domain.Entities;

public sealed class DraftEvent : Entity
{
    public Guid ChampionshipId { get; private set; }
    public Guid EnrollmentId { get; private set; }
    public Guid LicensedTeamId { get; private set; }
    public DateTime DrawnAt { get; private set; }

    private DraftEvent() { }

    public static DraftEvent Create(Guid championshipId, Guid enrollmentId, Guid licensedTeamId) =>
        new()
        {
            ChampionshipId = championshipId,
            EnrollmentId = enrollmentId,
            LicensedTeamId = licensedTeamId,
            DrawnAt = DateTime.UtcNow
        };
}
