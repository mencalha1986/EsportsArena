using EsportsArena.Domain.Common;

namespace EsportsArena.Domain.Entities;

public sealed class User : Entity
{
    public string SupabaseUid { get; private set; } = default!;
    public string PlatformId { get; private set; } = default!;
    public string DisplayName { get; private set; } = default!;
    public string? AvatarUrl { get; private set; }

    private User() { }

    public static Result<User> Create(string supabaseUid, string platformId, string displayName)
    {
        if (string.IsNullOrWhiteSpace(supabaseUid))
            return Result<User>.Failure("SupabaseUid é obrigatório.");
        if (string.IsNullOrWhiteSpace(platformId))
            return Result<User>.Failure("ID da plataforma é obrigatório.");
        if (platformId.Length < 3 || platformId.Length > 30)
            return Result<User>.Failure("ID da plataforma deve ter entre 3 e 30 caracteres.");
        if (!System.Text.RegularExpressions.Regex.IsMatch(platformId, @"^[a-zA-Z0-9_\-\.]+$"))
            return Result<User>.Failure("ID da plataforma só pode conter letras, números, _, - e .");
        if (string.IsNullOrWhiteSpace(displayName))
            return Result<User>.Failure("Nome de exibição é obrigatório.");

        return Result<User>.Success(new User
        {
            SupabaseUid = supabaseUid,
            PlatformId = platformId.ToLowerInvariant(),
            DisplayName = displayName.Trim()
        });
    }

    public Result UpdateProfile(string displayName, string? avatarUrl)
    {
        if (string.IsNullOrWhiteSpace(displayName))
            return Result.Failure("Nome de exibição é obrigatório.");
        DisplayName = displayName.Trim();
        AvatarUrl = avatarUrl;
        MarkUpdated();
        return Result.Success();
    }
}
