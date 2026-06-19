using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EsportsArena.Application.Common;
using EsportsArena.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace EsportsArena.Infrastructure.Services;

public sealed class JwtTokenService : ITokenService
{
    private readonly string _secret;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int _expiresInMinutes;

    public JwtTokenService(IConfiguration configuration)
    {
        _secret = configuration["Jwt:Secret"]!;
        _issuer = configuration["Jwt:Issuer"] ?? "esportsarena";
        _audience = configuration["Jwt:Audience"] ?? "esportsarena";
        _expiresInMinutes = int.TryParse(configuration["Jwt:ExpiresInMinutes"], out var m) ? m : 10080;
    }

    public AuthTokenDto GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("platformId", user.PlatformId),
            new Claim("role", user.Role.ToString()),
            new Claim("isActive", user.IsActive.ToString().ToLower()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_expiresInMinutes),
            signingCredentials: creds
        );

        return new AuthTokenDto(
            AccessToken: new JwtSecurityTokenHandler().WriteToken(token),
            ExpiresIn: _expiresInMinutes * 60,
            UserId: user.Id,
            PlatformId: user.PlatformId,
            Role: user.Role.ToString()
        );
    }
}
