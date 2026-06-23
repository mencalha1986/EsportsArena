using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Users.Queries.SearchPlayers;

public sealed record SearchPlayersQuery(string Query) : IRequest<Result<List<PlayerSearchResultDto>>>;
