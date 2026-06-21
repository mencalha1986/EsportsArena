using EsportsArena.Domain.Common;
using EsportsArena.Domain.Interfaces;
using MediatR;

namespace EsportsArena.Application.Enrollments.Commands.ReviewEnrollment;

public sealed class ReviewEnrollmentHandler : IRequestHandler<ReviewEnrollmentCommand, Result>
{
    private readonly IEnrollmentRepository _enrollments;
    private readonly IChampionshipRepository _championships;
    private readonly IUnitOfWork _uow;

    public ReviewEnrollmentHandler(IEnrollmentRepository enrollments, IChampionshipRepository championships, IUnitOfWork uow)
    {
        _enrollments = enrollments;
        _championships = championships;
        _uow = uow;
    }

    public async Task<Result> Handle(ReviewEnrollmentCommand request, CancellationToken ct)
    {
        var enrollment = await _enrollments.GetByIdAsync(request.EnrollmentId, ct);
        if (enrollment is null) return Result.Failure("Inscrição não encontrada.");

        var championship = await _championships.GetByIdAsync(enrollment.ChampionshipId, ct);
        if (championship is null) return Result.Failure("Campeonato não encontrado.");
        if (championship.OrganizerId != request.RequesterId)
            return Result.Failure("Somente o organizador pode revisar inscrições.");

        var result = request.Action.ToLower() switch
        {
            "accept" => enrollment.Accept(),
            "reject" => enrollment.Reject(),
            _ => Result.Failure("Ação inválida. Use 'accept' ou 'reject'.")
        };

        if (!result.IsSuccess) return result;

        await _uow.CommitAsync(ct);
        return Result.Success();
    }
}
