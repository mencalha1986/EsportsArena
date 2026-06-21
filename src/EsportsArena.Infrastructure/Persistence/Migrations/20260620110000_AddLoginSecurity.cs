using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EsportsArena.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddLoginSecurity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FailedLoginAttempts",
                table: "users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "RequiresPasswordChange",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "FailedLoginAttempts", table: "users");
            migrationBuilder.DropColumn(name: "RequiresPasswordChange", table: "users");
        }
    }
}
