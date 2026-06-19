using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Matches.Commands.RecordMatchScore;

public record RecordMatchScoreCommand(Guid MatchId, Guid RequesterId, short HomeScore, short AwayScore) : IRequest<Result>;
