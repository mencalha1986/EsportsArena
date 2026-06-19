using System.Text.Json;
using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;

namespace EsportsArena.API.Common;

public sealed class GlobalExceptionHandler : IExceptionHandler
{
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public async ValueTask<bool> TryHandleAsync(HttpContext ctx, Exception ex, CancellationToken ct)
    {
        var (status, error) = ex switch
        {
            ValidationException ve => (StatusCodes.Status422UnprocessableEntity,
                string.Join("; ", ve.Errors.Select(e => e.ErrorMessage))),
            UnauthorizedAccessException => (StatusCodes.Status403Forbidden, "Acesso não autorizado."),
            _ => (StatusCodes.Status500InternalServerError, "Ocorreu um erro inesperado.")
        };

        ctx.Response.StatusCode = status;
        ctx.Response.ContentType = "application/json";

        var response = new ApiResponse<object>(false, null, error);
        await ctx.Response.WriteAsync(JsonSerializer.Serialize(response, JsonOptions), ct);
        return true;
    }
}
