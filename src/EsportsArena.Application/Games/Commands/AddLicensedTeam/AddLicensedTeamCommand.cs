using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Games.Commands.AddLicensedTeam;

public record AddLicensedTeamCommand(Guid GameId, string Name, byte Stars, string? LogoUrl) : IRequest<Result<Guid>>;
