using EsportsArena.Domain.Common;
using EsportsArena.Domain.Interfaces;
using MediatR;

namespace EsportsArena.Application.Championships.Commands.OpenEnrollments;

public sealed class OpenEnrollmentsHandler : IRequestHandler<OpenEnrollmentsCommand, Result>
{
    private readonly IChampionshipRepository _championships;
    private readonly IUnitOfWork _uow;

    public OpenEnrollmentsHandler(IChampionshipRepository championships, IUnitOfWork uow)
    {
        _championships = championships; _uow = uow;
    }

    public async Task<Result> Handle(OpenEnrollmentsCommand request, CancellationToken ct)
    {
        var championship = await _championships.GetByIdAsync(request.ChampionshipId, ct);
        if (championship is null) return Result.Failure("Campeonato não encontrado.");
        if (championship.OrganizerId != request.RequesterId) return Result.Failure("Somente o organizador pode abrir inscrições.");

        var result = championship.OpenEnrollments();
        if (!result.IsSuccess) return result;

        await _uow.CommitAsync(ct);
        return Result.Success();
    }
}
