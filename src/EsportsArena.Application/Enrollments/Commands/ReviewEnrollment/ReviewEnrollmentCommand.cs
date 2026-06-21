using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Enrollments.Commands.ReviewEnrollment;

public record ReviewEnrollmentCommand(Guid EnrollmentId, Guid RequesterId, string Action) : IRequest<Result>;
