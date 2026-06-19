using EsportsArena.Application.Users.Queries.ListUsers;
using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Admin.Commands.CreateClient;

public record CreateClientCommand(
    string Email,
    string Password,
    string PlatformId,
    string DisplayName,
    string? Notes = null)
    : IRequest<Result<UserSummaryDto>>;
