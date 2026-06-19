using FluentValidation;

namespace EsportsArena.Application.Users.Commands.RegisterUser;

public sealed class RegisterUserValidator : AbstractValidator<RegisterUserCommand>
{
    public RegisterUserValidator()
    {
        RuleFor(x => x.SupabaseUid).NotEmpty().WithMessage("SupabaseUid é obrigatório.");
        RuleFor(x => x.PlatformId).NotEmpty().MinimumLength(3).MaximumLength(30)
            .Matches(@"^[a-zA-Z0-9_\-\.]+$").WithMessage("ID da plataforma inválido.");
        RuleFor(x => x.DisplayName).NotEmpty().MaximumLength(100);
    }
}
