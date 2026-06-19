using EsportsArena.Domain.Common;
using EsportsArena.Domain.Enums;

namespace EsportsArena.Domain.Entities;

public sealed class User : Entity
{
    public string? SupabaseUid { get; private set; }
    public string Email { get; private set; } = default!;
    public string PasswordHash { get; private set; } = default!;
    public string PlatformId { get; private set; } = default!;
    public string DisplayName { get; private set; } = default!;
    public string? AvatarUrl { get; private set; }
    public UserRole Role { get; private set; } = UserRole.Player;
    public bool IsActive { get; private set; } = true;
    public string? SubscriptionNotes { get; private set; }

    private User() { }

    public static Result<User> Create(string email, string passwordHash, string platformId, string displayName)
    {
        if (string.IsNullOrWhiteSpace(email))
            return Result<User>.Failure("E-mail é obrigatório.");
        if (string.IsNullOrWhiteSpace(passwordHash))
            return Result<User>.Failure("Senha é obrigatória.");
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
            Email = email.Trim().ToLowerInvariant(),
            PasswordHash = passwordHash,
            PlatformId = platformId.ToLowerInvariant(),
            DisplayName = displayName.Trim()
        });
    }

    public void ActivateAsAdmin(string? notes = null)
    {
        Role = UserRole.Admin;
        IsActive = true;
        SubscriptionNotes = notes;
        MarkUpdated();
    }

    public void Deactivate(string? reason = null)
    {
        IsActive = false;
        SubscriptionNotes = reason;
        MarkUpdated();
    }

    public void Reactivate(string? notes = null)
    {
        IsActive = true;
        SubscriptionNotes = notes;
        MarkUpdated();
    }

    public void PromoteToSuperAdmin()
    {
        Role = UserRole.SuperAdmin;
        MarkUpdated();
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
