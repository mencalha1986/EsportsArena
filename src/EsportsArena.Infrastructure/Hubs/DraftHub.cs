using Microsoft.AspNetCore.SignalR;

namespace EsportsArena.Infrastructure.Hubs;

public sealed class DraftHub : Hub
{
    public async Task JoinChampionship(string championshipId)
        => await Groups.AddToGroupAsync(Context.ConnectionId, $"championship-{championshipId}");

    public async Task LeaveChampionship(string championshipId)
        => await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"championship-{championshipId}");
}
