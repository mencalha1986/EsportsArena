using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EsportsArena.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddUserRoleAndSubscription : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "users",
                type: "text",
                nullable: false,
                defaultValue: "Player");

            migrationBuilder.AddColumn<string>(
                name: "SubscriptionNotes",
                table: "users",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "users");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "users");

            migrationBuilder.DropColumn(
                name: "SubscriptionNotes",
                table: "users");
        }
    }
}
