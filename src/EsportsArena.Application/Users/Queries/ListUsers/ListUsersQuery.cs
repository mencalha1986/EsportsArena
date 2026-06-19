using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Users.Queries.ListUsers;

public record ListUsersQuery(string? Role = null, bool? IsActive = null) : IRequest<Result<IReadOnlyList<UserSummaryDto>>>;

public record UserSummaryDto(
    Guid Id,
    string PlatformId,
    string DisplayName,
    string Role,
    bool IsActive,
    string? SubscriptionNotes,
    DateTime CreatedAt);
