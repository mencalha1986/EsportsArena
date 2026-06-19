using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Championships.Commands.StartChampionship;

public record StartChampionshipCommand(Guid ChampionshipId, Guid RequesterId) : IRequest<Result>;
