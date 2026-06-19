using EsportsArena.Domain.Common;
using MediatR;

namespace EsportsArena.Application.Admin.Queries.GetAdminStats;

public sealed record GetAdminStatsQuery : IRequest<Result<AdminStatsDto>>;
