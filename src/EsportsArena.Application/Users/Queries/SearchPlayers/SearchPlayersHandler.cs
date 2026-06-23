using EsportsArena.Domain.Common;
using EsportsArena.Domain.Interfaces;
using MediatR;

namespace EsportsArena.Application.Users.Queries.SearchPlayers;

public sealed class SearchPlayersHandler : IRequestHandler<SearchPlayersQuery, Result<List<PlayerSearchResultDto>>>
{
    private readonly IUserRepository _users;

    public SearchPlayersHandler(IUserRepository users) => _users = users;

    public async Task<Result<List<PlayerSearchResultDto>>> Handle(SearchPlayersQuery request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Query) || request.Query.Trim().Length < 2)
            return Result<List<PlayerSearchResultDto>>.Failure("Digite ao menos 2 caracteres para pesquisar.");

        var users = await _users.SearchByEmailOrPlatformIdAsync(request.Query.Trim(), 10, ct);
        var dtos = users.Select(u => new PlayerSearchResultDto(u.Id, u.PlatformId, u.DisplayName, u.AvatarUrl)).ToList();
        return Result<List<PlayerSearchResultDto>>.Success(dtos);
    }
}
