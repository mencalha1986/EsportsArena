using EsportsArena.Domain.Enums;
using EsportsArena.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace EsportsArena.API.Common;

public sealed class SuperAdminRequirement : IAuthorizationRequirement { }
public sealed class AdminOrAboveRequirement : IAuthorizationRequirement { }

public sealed class SuperAdminHandler : AuthorizationHandler<SuperAdminRequirement>
{
    private readonly IUserRepository _users;
    public SuperAdminHandler(IUserRepository users) => _users = users;

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context, SuperAdminRequirement requirement)
    {
        var sub = context.User.FindFirstValue(ClaimTypes.NameIdentifier)
               ?? context.User.FindFirstValue("sub");
        if (sub is null || !Guid.TryParse(sub, out var userId)) { context.Fail(); return; }

        var user = await _users.GetByIdAsync(userId);
        if (user?.Role == UserRole.SuperAdmin)
            context.Succeed(requirement);
        else
            context.Fail();
    }
}

public sealed class AdminOrAboveHandler : AuthorizationHandler<AdminOrAboveRequirement>
{
    private readonly IUserRepository _users;
    public AdminOrAboveHandler(IUserRepository users) => _users = users;

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context, AdminOrAboveRequirement requirement)
    {
        var sub = context.User.FindFirstValue(ClaimTypes.NameIdentifier)
               ?? context.User.FindFirstValue("sub");
        if (sub is null || !Guid.TryParse(sub, out var userId)) { context.Fail(); return; }

        var user = await _users.GetByIdAsync(userId);

        var allowed = user is not null && (
            user.Role == UserRole.SuperAdmin ||
            (user.Role == UserRole.Admin && user.IsActive));

        if (allowed) context.Succeed(requirement);
        else context.Fail();
    }
}
