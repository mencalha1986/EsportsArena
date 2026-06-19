CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260618005556_InitialCreate') THEN
    CREATE TABLE games (
        "Id" uuid NOT NULL,
        "Name" character varying(100) NOT NULL,
        "Slug" character varying(60) NOT NULL,
        "InscriptionMode" text NOT NULL,
        "ScoreDisplay" character varying(20) NOT NULL DEFAULT 'goals',
        "IconUrl" character varying(1000),
        "IsActive" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_games" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260618005556_InitialCreate') THEN
    CREATE TABLE users (
        "Id" uuid NOT NULL,
        "SupabaseUid" character varying(256) NOT NULL,
        "PlatformId" character varying(30) NOT NULL,
        "DisplayName" character varying(100) NOT NULL,
        "AvatarUrl" character varying(1000),
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_users" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260618005556_InitialCreate') THEN
    CREATE TABLE licensed_teams (
        "Id" uuid NOT NULL,
        "GameId" uuid NOT NULL,
        "Name" character varying(150) NOT NULL,
        "LogoUrl" character varying(1000),
        "Stars" smallint NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_licensed_teams" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_licensed_teams_games_GameId" FOREIGN KEY ("GameId") REFERENCES games ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260618005556_InitialCreate') THEN
    CREATE TABLE championships (
        "Id" uuid NOT NULL,
        "GameId" uuid NOT NULL,
        "OrganizerId" uuid NOT NULL,
        "Name" character varying(150) NOT NULL,
        "Description" character varying(500),
        "Status" text NOT NULL,
        "Format" text NOT NULL,
        "MinStars" smallint,
        "MaxStars" smallint,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_championships" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_championships_games_GameId" FOREIGN KEY ("GameId") REFERENCES games ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_championships_users_OrganizerId" FOREIGN KEY ("OrganizerId") REFERENCES users ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260618005556_InitialCreate') THEN
    CREATE TABLE enrollments (
        "Id" uuid NOT NULL,
        "ChampionshipId" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "IdentityName" character varying(100),
        "LicensedTeamId" uuid,
        "WithdrewAt" timestamp with time zone,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_enrollments" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_enrollments_championships_ChampionshipId" FOREIGN KEY ("ChampionshipId") REFERENCES championships ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_enrollments_licensed_teams_LicensedTeamId" FOREIGN KEY ("LicensedTeamId") REFERENCES licensed_teams ("Id"),
        CONSTRAINT "FK_enrollments_users_UserId" FOREIGN KEY ("UserId") REFERENCES users ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260618005556_InitialCreate') THEN
    CREATE TABLE rounds (
        "Id" uuid NOT NULL,
        "ChampionshipId" uuid NOT NULL,
        "Number" smallint NOT NULL,
        "Label" character varying(100),
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_rounds" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_rounds_championships_ChampionshipId" FOREIGN KEY ("ChampionshipId") REFERENCES championships ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260618005556_InitialCreate') THEN
    CREATE TABLE draft_events (
        "Id" uuid NOT NULL,
        "ChampionshipId" uuid NOT NULL,
        "EnrollmentId" uuid NOT NULL,
        "LicensedTeamId" uuid NOT NULL,
        "DrawnAt" timestamp with time zone NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_draft_events" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_draft_events_championships_ChampionshipId" FOREIGN KEY ("ChampionshipId") REFERENCES championships ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_draft_events_enrollments_EnrollmentId" FOREIGN KEY ("EnrollmentId") REFERENCES enrollments ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_draft_events_licensed_teams_LicensedTeamId" FOREIGN KEY ("LicensedTeamId") REFERENCES licensed_teams ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260618005556_InitialCreate') THEN
    CREATE TABLE matches (
        "Id" uuid NOT NULL,
        "RoundId" uuid NOT NULL,
        "HomeEnrollmentId" uuid NOT NULL,
        "AwayEnrollmentId" uuid NOT NULL,
        "HomeScore" smallint,
        "AwayScore" smallint,
        "Status" text NOT NULL,
        "PlayedAt" timestamp with time zone,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_matches" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_matches_enrollments_AwayEnrollmentId" FOREIGN KEY ("AwayEnrollmentId") REFERENCES enrollments ("Id") ON DELETE RESTRICT,
        CONSTRAINT "FK_matches_enrollments_HomeEnrollmentId" FOREIGN KEY ("HomeEnrollmentId") REFERENCES enrollments ("Id") ON DELETE RESTRICT,
        CONSTRAINT "FK_matches_rounds_RoundId" FOREIGN KEY ("RoundId") REFERENCES rounds ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260618005556_InitialCreate') THEN
    CREATE INDEX "IX_championships_GameId" ON championships ("GameId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260618005556_InitialCreate') THEN
    CREATE INDEX "IX_championships_OrganizerId" ON championships ("OrganizerId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260618005556_InitialCreate') THEN
    CREATE INDEX "IX_draft_events_ChampionshipId" ON draft_events ("ChampionshipId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260618005556_InitialCreate') THEN
    CREATE INDEX "IX_draft_events_EnrollmentId" ON draft_events ("EnrollmentId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260618005556_InitialCreate') THEN
    CREATE INDEX "IX_draft_events_LicensedTeamId" ON draft_events ("LicensedTeamId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260618005556_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_enrollments_ChampionshipId_UserId" ON enrollments ("ChampionshipId", "UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260618005556_InitialCreate') THEN
    CREATE INDEX "IX_enrollments_LicensedTeamId" ON enrollments ("LicensedTeamId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260618005556_InitialCreate') THEN
    CREATE INDEX "IX_enrollments_UserId" ON enrollments ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260618005556_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_games_Slug" ON games ("Slug");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260618005556_InitialCreate') THEN
    CREATE INDEX "IX_licensed_teams_GameId_Stars" ON licensed_teams ("GameId", "Stars");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260618005556_InitialCreate') THEN
    CREATE INDEX "IX_matches_AwayEnrollmentId" ON matches ("AwayEnrollmentId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260618005556_InitialCreate') THEN
    CREATE INDEX "IX_matches_HomeEnrollmentId" ON matches ("HomeEnrollmentId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260618005556_InitialCreate') THEN
    CREATE INDEX "IX_matches_RoundId" ON matches ("RoundId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260618005556_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_rounds_ChampionshipId_Number" ON rounds ("ChampionshipId", "Number");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260618005556_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_users_PlatformId" ON users ("PlatformId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260618005556_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_users_SupabaseUid" ON users ("SupabaseUid");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260618005556_InitialCreate') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260618005556_InitialCreate', '10.0.9');
    END IF;
END $EF$;
COMMIT;

