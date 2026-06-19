using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Championships.Commands.RecordWithdrawal;

public record RecordWithdrawalCommand(Guid EnrollmentId, Guid RequesterId) : IRequest<Result>;
