using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EsportsArena.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixEnrollmentStatusDefault : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "enrollments",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text",
                oldDefaultValue: "Accepted");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "enrollments",
                type: "text",
                nullable: false,
                defaultValue: "Accepted",
                oldClrType: typeof(string),
                oldType: "text");
        }
    }
}
