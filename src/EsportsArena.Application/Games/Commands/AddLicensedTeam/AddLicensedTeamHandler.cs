using EsportsArena.Domain.Common;
using EsportsArena.Domain.Entities;
using EsportsArena.Domain.Enums;
using EsportsArena.Domain.Interfaces;
using MediatR;

namespace EsportsArena.Application.Games.Commands.AddLicensedTeam;

public sealed class AddLicensedTeamHandler : IRequestHandler<AddLicensedTeamCommand, Result<Guid>>
{
    private readonly ILicensedTeamRepository _teams;
    private readonly IGameRepository _games;
    private readonly IUnitOfWork _uow;

    public AddLicensedTeamHandler(ILicensedTeamRepository teams, IGameRepository games, IUnitOfWork uow)
    {
        _teams = teams; _games = games; _uow = uow;
    }

    public async Task<Result<Guid>> Handle(AddLicensedTeamCommand request, CancellationToken ct)
    {
        var game = await _games.GetByIdAsync(request.GameId, ct);
        if (game is null) return Result<Guid>.Failure("Jogo não encontrado.");
        if (game.InscriptionMode != InscriptionMode.LicensedTeams)
            return Result<Guid>.Failure("Este jogo não usa times licenciados.");

        var result = LicensedTeam.Create(request.GameId, request.Name, request.Stars, request.LogoUrl);
        if (!result.IsSuccess) return Result<Guid>.Failure(result.Error);

        await _teams.AddAsync(result.Value, ct);
        await _uow.CommitAsync(ct);
        return Result<Guid>.Success(result.Value.Id);
    }
}
