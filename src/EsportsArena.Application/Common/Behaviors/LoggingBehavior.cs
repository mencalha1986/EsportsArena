using MediatR;
using Microsoft.Extensions.Logging;

namespace EsportsArena.Application.Common.Behaviors;

public sealed class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;

    public LoggingBehavior(ILogger<LoggingBehavior<TRequest, TResponse>> logger) => _logger = logger;

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        var name = typeof(TRequest).Name;
        _logger.LogInformation("EsportsArena — handling {RequestName}", name);
        var response = await next(ct);
        _logger.LogInformation("EsportsArena — completed {RequestName}", name);
        return response;
    }
}
