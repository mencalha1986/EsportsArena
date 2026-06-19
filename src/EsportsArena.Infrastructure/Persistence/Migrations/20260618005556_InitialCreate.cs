using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EsportsArena.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "games",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Slug = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    InscriptionMode = table.Column<string>(type: "text", nullable: false),
                    ScoreDisplay = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "goals"),
                    IconUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_games", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SupabaseUid = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    PlatformId = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    DisplayName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    AvatarUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "licensed_teams",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    GameId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    LogoUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Stars = table.Column<byte>(type: "smallint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_licensed_teams", x => x.Id);
                    table.ForeignKey(
                        name: "FK_licensed_teams_games_GameId",
                        column: x => x.GameId,
                        principalTable: "games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "championships",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    GameId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrganizerId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Format = table.Column<string>(type: "text", nullable: false),
                    MinStars = table.Column<byte>(type: "smallint", nullable: true),
                    MaxStars = table.Column<byte>(type: "smallint", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_championships", x => x.Id);
                    table.ForeignKey(
                        name: "FK_championships_games_GameId",
                        column: x => x.GameId,
                        principalTable: "games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_championships_users_OrganizerId",
                        column: x => x.OrganizerId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "enrollments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ChampionshipId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    IdentityName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    LicensedTeamId = table.Column<Guid>(type: "uuid", nullable: true),
                    WithdrewAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_enrollments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_enrollments_championships_ChampionshipId",
                        column: x => x.ChampionshipId,
                        principalTable: "championships",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_enrollments_licensed_teams_LicensedTeamId",
                        column: x => x.LicensedTeamId,
                        principalTable: "licensed_teams",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_enrollments_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "rounds",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ChampionshipId = table.Column<Guid>(type: "uuid", nullable: false),
                    Number = table.Column<short>(type: "smallint", nullable: false),
                    Label = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_rounds", x => x.Id);
                    table.ForeignKey(
                        name: "FK_rounds_championships_ChampionshipId",
                        column: x => x.ChampionshipId,
                        principalTable: "championships",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "draft_events",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ChampionshipId = table.Column<Guid>(type: "uuid", nullable: false),
                    EnrollmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    LicensedTeamId = table.Column<Guid>(type: "uuid", nullable: false),
                    DrawnAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_draft_events", x => x.Id);
                    table.ForeignKey(
                        name: "FK_draft_events_championships_ChampionshipId",
                        column: x => x.ChampionshipId,
                        principalTable: "championships",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_draft_events_enrollments_EnrollmentId",
                        column: x => x.EnrollmentId,
                        principalTable: "enrollments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_draft_events_licensed_teams_LicensedTeamId",
                        column: x => x.LicensedTeamId,
                        principalTable: "licensed_teams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "matches",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RoundId = table.Column<Guid>(type: "uuid", nullable: false),
                    HomeEnrollmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    AwayEnrollmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    HomeScore = table.Column<short>(type: "smallint", nullable: true),
                    AwayScore = table.Column<short>(type: "smallint", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    PlayedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_matches", x => x.Id);
                    table.ForeignKey(
                        name: "FK_matches_enrollments_AwayEnrollmentId",
                        column: x => x.AwayEnrollmentId,
                        principalTable: "enrollments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_matches_enrollments_HomeEnrollmentId",
                        column: x => x.HomeEnrollmentId,
                        principalTable: "enrollments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_matches_rounds_RoundId",
                        column: x => x.RoundId,
                        principalTable: "rounds",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_championships_GameId",
                table: "championships",
                column: "GameId");

            migrationBuilder.CreateIndex(
                name: "IX_championships_OrganizerId",
                table: "championships",
                column: "OrganizerId");

            migrationBuilder.CreateIndex(
                name: "IX_draft_events_ChampionshipId",
                table: "draft_events",
                column: "ChampionshipId");

            migrationBuilder.CreateIndex(
                name: "IX_draft_events_EnrollmentId",
                table: "draft_events",
                column: "EnrollmentId");

            migrationBuilder.CreateIndex(
                name: "IX_draft_events_LicensedTeamId",
                table: "draft_events",
                column: "LicensedTeamId");

            migrationBuilder.CreateIndex(
                name: "IX_enrollments_ChampionshipId_UserId",
                table: "enrollments",
                columns: new[] { "ChampionshipId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_enrollments_LicensedTeamId",
                table: "enrollments",
                column: "LicensedTeamId");

            migrationBuilder.CreateIndex(
                name: "IX_enrollments_UserId",
                table: "enrollments",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_games_Slug",
                table: "games",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_licensed_teams_GameId_Stars",
                table: "licensed_teams",
                columns: new[] { "GameId", "Stars" });

            migrationBuilder.CreateIndex(
                name: "IX_matches_AwayEnrollmentId",
                table: "matches",
                column: "AwayEnrollmentId");

            migrationBuilder.CreateIndex(
                name: "IX_matches_HomeEnrollmentId",
                table: "matches",
                column: "HomeEnrollmentId");

            migrationBuilder.CreateIndex(
                name: "IX_matches_RoundId",
                table: "matches",
                column: "RoundId");

            migrationBuilder.CreateIndex(
                name: "IX_rounds_ChampionshipId_Number",
                table: "rounds",
                columns: new[] { "ChampionshipId", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_PlatformId",
                table: "users",
                column: "PlatformId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_SupabaseUid",
                table: "users",
                column: "SupabaseUid",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "draft_events");

            migrationBuilder.DropTable(
                name: "matches");

            migrationBuilder.DropTable(
                name: "enrollments");

            migrationBuilder.DropTable(
                name: "rounds");

            migrationBuilder.DropTable(
                name: "licensed_teams");

            migrationBuilder.DropTable(
                name: "championships");

            migrationBuilder.DropTable(
                name: "games");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
