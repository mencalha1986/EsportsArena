using EsportsArena.Domain.Common;
using EsportsArena.Domain.Interfaces;
using MediatR;

namespace EsportsArena.Application.Games.Queries.GetLicensedTeams;

public sealed class GetLicensedTeamsHandler
    : IRequestHandler<GetLicensedTeamsQuery, Result<IReadOnlyList<LicensedTeamDto>>>
{
    private readonly ILicensedTeamRepository _teams;

    public GetLicensedTeamsHandler(ILicensedTeamRepository teams) => _teams = teams;

    public async Task<Result<IReadOnlyList<LicensedTeamDto>>> Handle(
        GetLicensedTeamsQuery request, CancellationToken ct)
    {
        var teams = await _teams.GetEligibleTeamsAsync(request.GameId, request.MinStars, request.MaxStars, ct);

        var dtos = teams
            .Select(t => new LicensedTeamDto(t.Id, t.Name, t.Stars, t.LogoUrl))
            .ToList();

        return Result<IReadOnlyList<LicensedTeamDto>>.Success(dtos);
    }
}
