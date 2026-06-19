using EsportsArena.API.Common;
using EsportsArena.API.Endpoints;
using Microsoft.AspNetCore.Authorization;
using EsportsArena.Application;
using EsportsArena.Infrastructure;
using EsportsArena.Infrastructure.Hubs;
using EsportsArena.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

var port = Environment.GetEnvironmentVariable("PORT");
if (port != null)
    builder.WebHost.UseUrls($"http://+:{port}");

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

builder.Services.AddScoped<IAuthorizationHandler, SuperAdminHandler>();
builder.Services.AddScoped<IAuthorizationHandler, AdminOrAboveHandler>();
builder.Services.AddAuthorization(opts =>
{
    opts.AddPolicy("SuperAdminOnly", p =>
        p.RequireAuthenticatedUser().AddRequirements(new SuperAdminRequirement()));
    opts.AddPolicy("AdminOrAbove", p =>
        p.RequireAuthenticatedUser().AddRequirements(new AdminOrAboveRequirement()));
});
builder.Services.AddSignalR();

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddCors(opts =>
    opts.AddDefaultPolicy(policy =>
        policy.WithOrigins(builder.Configuration["Cors:AllowedOrigins"]?.Split(',') ?? ["http://localhost:5173"])
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "EsportsArena API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Cole o JWT do Supabase: Bearer {token}"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            []
        }
    });
});

builder.Services.AddHealthChecks();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "EsportsArena API v1"));

app.UseExceptionHandler();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapUserEndpoints();
app.MapGameEndpoints();
app.MapAdminManagementEndpoints();
app.MapChampionshipEndpoints();
app.MapEnrollmentEndpoints();
app.MapMatchEndpoints();
app.MapDraftEndpoints();

app.MapHub<DraftHub>("/hubs/draft");
app.MapHealthChecks("/health");

app.Run();

public partial class Program { }
