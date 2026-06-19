using EsportsArena.Domain.Entities;

namespace EsportsArena.Application.Common;

public record AuthTokenDto(string AccessToken, int ExpiresIn, Guid UserId, string PlatformId, string Role);

public interface ITokenService
{
    AuthTokenDto GenerateToken(User user);
}
