using System.Data;
using Dapper;
using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Users.Queries.ListUsers;

public sealed class ListUsersHandler : IRequestHandler<ListUsersQuery, Result<IReadOnlyList<UserSummaryDto>>>
{
    private readonly IDbConnection _db;
    public ListUsersHandler(IDbConnection db) => _db = db;

    public async Task<Result<IReadOnlyList<UserSummaryDto>>> Handle(ListUsersQuery request, CancellationToken ct)
    {
        var sql = """
            SELECT id, platform_id, display_name, "Role" AS role, "IsActive" AS is_active,
                   "SubscriptionNotes" AS subscription_notes, created_at
            FROM users
            WHERE (@Role IS NULL OR "Role" = @Role)
              AND (@IsActive IS NULL OR "IsActive" = @IsActive)
            ORDER BY created_at DESC
            """;

        var rows = await _db.QueryAsync<dynamic>(sql, new { request.Role, request.IsActive });

        var result = rows.Select(r => new UserSummaryDto(
            (Guid)r.id,
            (string)r.platform_id,
            (string)r.display_name,
            (string)r.role,
            (bool)r.is_active,
            (string?)r.subscription_notes,
            (DateTime)r.created_at
        )).ToList();

        return Result<IReadOnlyList<UserSummaryDto>>.Success(result);
    }
}
