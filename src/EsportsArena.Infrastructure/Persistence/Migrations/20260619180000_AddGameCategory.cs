using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EsportsArena.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddGameCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "games",
                type: "character varying(60)",
                maxLength: 60,
                nullable: false,
                defaultValue: "Other");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "games");
        }
    }
}
