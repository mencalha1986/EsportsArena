using EsportsArena.Domain.Common;

namespace EsportsArena.Domain.Entities;

public sealed class Round : Entity
{
    public Guid ChampionshipId { get; private set; }
    public short Number { get; private set; }
    public string? Label { get; private set; }

    private Round() { }

    public static Round Create(Guid championshipId, short number, string? label = null) =>
        new()
        {
            ChampionshipId = championshipId,
            Number = number,
            Label = label
        };
}
