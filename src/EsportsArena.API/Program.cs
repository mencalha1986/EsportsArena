using EsportsArena.API.Common;
using EsportsArena.API.Endpoints;
using EsportsArena.Application;
using EsportsArena.Infrastructure;
using EsportsArena.Infrastructure.Hubs;
using EsportsArena.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// Supabase JWT validation via JWKS (RS256) - no custom token generation
var supabaseUrl = builder.Configuration["Supabase:Url"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opts =>
    {
        opts.Authority = $"{supabaseUrl}/auth/v1";
        opts.Audience = "authenticated";
        opts.TokenValidationParameters = new()
        {
            ValidateIssuer = true,
            ValidIssuer = $"{supabaseUrl}/auth/v1",
            ValidateAudience = true,
            ValidAudience = "authenticated",
            ValidateLifetime = true
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddSignalR();

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddCors(opts =>
    opts.AddDefaultPolicy(policy =>
        policy.WithOrigins(builder.Configuration["Cors:AllowedOrigins"]?.Split(',') ?? ["http://localhost:5173"])
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()));

builder.Services.AddHealthChecks();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

app.UseExceptionHandler();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapUserEndpoints();
app.MapGameEndpoints();
app.MapChampionshipEndpoints();
app.MapEnrollmentEndpoints();
app.MapMatchEndpoints();
app.MapDraftEndpoints();

app.MapHub<DraftHub>("/hubs/draft");
app.MapHealthChecks("/health");

app.Run();

public partial class Program { }
