-- ============================================================
-- EsportsArena — Script SQL completo (schema atual)
-- Gerado a partir das migrations EF Core aplicadas em ordem.
-- Execute este arquivo no Supabase SQL Editor ou psql para
-- criar o banco do zero.
-- ============================================================

CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

-- ============================================================
-- Migration: 20260618005556_InitialCreate
-- ============================================================
DO $EF$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260618005556_InitialCreate') THEN

    CREATE TABLE games (
        "Id"              uuid                       NOT NULL,
        "Name"            character varying(100)     NOT NULL,
        "Slug"            character varying(60)      NOT NULL,
        "InscriptionMode" text                       NOT NULL,
        "ScoreDisplay"    character varying(20)      NOT NULL DEFAULT 'goals',
        "IconUrl"         character varying(1000),
        "IsActive"        boolean                    NOT NULL,
        "CreatedAt"       timestamp with time zone   NOT NULL,
        "UpdatedAt"       timestamp with time zone   NOT NULL,
        CONSTRAINT "PK_games" PRIMARY KEY ("Id")
    );

    CREATE TABLE users (
        "Id"          uuid                     NOT NULL,
        "PlatformId"  character varying(30)    NOT NULL,
        "DisplayName" character varying(100)   NOT NULL,
        "AvatarUrl"   character varying(1000),
        "CreatedAt"   timestamp with time zone NOT NULL,
        "UpdatedAt"   timestamp with time zone NOT NULL,
        CONSTRAINT "PK_users" PRIMARY KEY ("Id")
    );

    CREATE TABLE licensed_teams (
        "Id"        uuid                     NOT NULL,
        "GameId"    uuid                     NOT NULL,
        "Name"      character varying(150)   NOT NULL,
        "LogoUrl"   character varying(1000),
        "Stars"     smallint                 NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_licensed_teams"       PRIMARY KEY ("Id"),
        CONSTRAINT "FK_licensed_teams_games" FOREIGN KEY ("GameId") REFERENCES games ("Id") ON DELETE CASCADE
    );

    CREATE TABLE championships (
        "Id"          uuid                     NOT NULL,
        "GameId"      uuid                     NOT NULL,
        "OrganizerId" uuid                     NOT NULL,
        "Name"        character varying(150)   NOT NULL,
        "Description" character varying(500),
        "Status"      text                     NOT NULL,
        "Format"      text                     NOT NULL,
        "MinStars"    smallint,
        "MaxStars"    smallint,
        "CreatedAt"   timestamp with time zone NOT NULL,
        "UpdatedAt"   timestamp with time zone NOT NULL,
        CONSTRAINT "PK_championships"                PRIMARY KEY ("Id"),
        CONSTRAINT "FK_championships_games"          FOREIGN KEY ("GameId")      REFERENCES games ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_championships_users_Organizer" FOREIGN KEY ("OrganizerId") REFERENCES users ("Id") ON DELETE CASCADE
    );

    CREATE TABLE enrollments (
        "Id"             uuid                     NOT NULL,
        "ChampionshipId" uuid                     NOT NULL,
        "UserId"         uuid                     NOT NULL,
        "IdentityName"   character varying(100),
        "LicensedTeamId" uuid,
        "WithdrewAt"     timestamp with time zone,
        "CreatedAt"      timestamp with time zone NOT NULL,
        "UpdatedAt"      timestamp with time zone NOT NULL,
        CONSTRAINT "PK_enrollments"                       PRIMARY KEY ("Id"),
        CONSTRAINT "FK_enrollments_championships"         FOREIGN KEY ("ChampionshipId") REFERENCES championships ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_enrollments_licensed_teams"        FOREIGN KEY ("LicensedTeamId") REFERENCES licensed_teams ("Id"),
        CONSTRAINT "FK_enrollments_users"                 FOREIGN KEY ("UserId")         REFERENCES users ("Id") ON DELETE CASCADE
    );

    CREATE TABLE rounds (
        "Id"             uuid                     NOT NULL,
        "ChampionshipId" uuid                     NOT NULL,
        "Number"         smallint                 NOT NULL,
        "Label"          character varying(100),
        "CreatedAt"      timestamp with time zone NOT NULL,
        "UpdatedAt"      timestamp with time zone NOT NULL,
        CONSTRAINT "PK_rounds"            PRIMARY KEY ("Id"),
        CONSTRAINT "FK_rounds_championships" FOREIGN KEY ("ChampionshipId") REFERENCES championships ("Id") ON DELETE CASCADE
    );

    CREATE TABLE draft_events (
        "Id"             uuid                     NOT NULL,
        "ChampionshipId" uuid                     NOT NULL,
        "EnrollmentId"   uuid                     NOT NULL,
        "LicensedTeamId" uuid                     NOT NULL,
        "DrawnAt"        timestamp with time zone NOT NULL,
        "CreatedAt"      timestamp with time zone NOT NULL,
        "UpdatedAt"      timestamp with time zone NOT NULL,
        CONSTRAINT "PK_draft_events"                      PRIMARY KEY ("Id"),
        CONSTRAINT "FK_draft_events_championships"        FOREIGN KEY ("ChampionshipId") REFERENCES championships ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_draft_events_enrollments"          FOREIGN KEY ("EnrollmentId")   REFERENCES enrollments ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_draft_events_licensed_teams"       FOREIGN KEY ("LicensedTeamId") REFERENCES licensed_teams ("Id") ON DELETE CASCADE
    );

    CREATE TABLE matches (
        "Id"               uuid                     NOT NULL,
        "RoundId"          uuid                     NOT NULL,
        "HomeEnrollmentId" uuid                     NOT NULL,
        "AwayEnrollmentId" uuid                     NOT NULL,
        "HomeScore"        smallint,
        "AwayScore"        smallint,
        "Status"           text                     NOT NULL,
        "PlayedAt"         timestamp with time zone,
        "CreatedAt"        timestamp with time zone NOT NULL,
        "UpdatedAt"        timestamp with time zone NOT NULL,
        CONSTRAINT "PK_matches"                         PRIMARY KEY ("Id"),
        CONSTRAINT "FK_matches_enrollments_Away"        FOREIGN KEY ("AwayEnrollmentId") REFERENCES enrollments ("Id") ON DELETE RESTRICT,
        CONSTRAINT "FK_matches_enrollments_Home"        FOREIGN KEY ("HomeEnrollmentId") REFERENCES enrollments ("Id") ON DELETE RESTRICT,
        CONSTRAINT "FK_matches_rounds"                  FOREIGN KEY ("RoundId")          REFERENCES rounds ("Id") ON DELETE CASCADE
    );

    CREATE INDEX        "IX_championships_GameId"              ON championships ("GameId");
    CREATE INDEX        "IX_championships_OrganizerId"         ON championships ("OrganizerId");
    CREATE INDEX        "IX_draft_events_ChampionshipId"       ON draft_events  ("ChampionshipId");
    CREATE INDEX        "IX_draft_events_EnrollmentId"         ON draft_events  ("EnrollmentId");
    CREATE INDEX        "IX_draft_events_LicensedTeamId"       ON draft_events  ("LicensedTeamId");
    CREATE UNIQUE INDEX "IX_enrollments_ChampionshipId_UserId" ON enrollments   ("ChampionshipId", "UserId");
    CREATE INDEX        "IX_enrollments_LicensedTeamId"        ON enrollments   ("LicensedTeamId");
    CREATE INDEX        "IX_enrollments_UserId"                ON enrollments   ("UserId");
    CREATE UNIQUE INDEX "IX_games_Slug"                        ON games         ("Slug");
    CREATE INDEX        "IX_licensed_teams_GameId_Stars"       ON licensed_teams("GameId", "Stars");
    CREATE INDEX        "IX_matches_AwayEnrollmentId"          ON matches       ("AwayEnrollmentId");
    CREATE INDEX        "IX_matches_HomeEnrollmentId"          ON matches       ("HomeEnrollmentId");
    CREATE INDEX        "IX_matches_RoundId"                   ON matches       ("RoundId");
    CREATE UNIQUE INDEX "IX_rounds_ChampionshipId_Number"      ON rounds        ("ChampionshipId", "Number");
    CREATE UNIQUE INDEX "IX_users_PlatformId"                  ON users         ("PlatformId");

    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260618005556_InitialCreate', '10.0.9');
  END IF;
END $EF$;

-- ============================================================
-- Migration: 20260619134734_AddUserRoleAndSubscription
-- ============================================================
DO $EF$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260619134734_AddUserRoleAndSubscription') THEN
    ALTER TABLE users
        ADD COLUMN "IsActive"          boolean              NOT NULL DEFAULT true,
        ADD COLUMN "Role"              text                 NOT NULL DEFAULT 'Player',
        ADD COLUMN "SubscriptionNotes" character varying(500);

    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260619134734_AddUserRoleAndSubscription', '10.0.9');
  END IF;
END $EF$;

-- ============================================================
-- Migration: 20260619151228_AddEmailPasswordAuth
-- ============================================================
DO $EF$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260619151228_AddEmailPasswordAuth') THEN
    ALTER TABLE users
        ADD COLUMN "Email"        character varying(256) NOT NULL DEFAULT '',
        ADD COLUMN "PasswordHash" character varying(256) NOT NULL DEFAULT '';

    ALTER TABLE users
        ALTER COLUMN "Email"        DROP DEFAULT,
        ALTER COLUMN "PasswordHash" DROP DEFAULT;

    CREATE UNIQUE INDEX "IX_users_Email" ON users ("Email");

    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260619151228_AddEmailPasswordAuth', '10.0.9');
  END IF;
END $EF$;

-- ============================================================
-- Migration: 20260619164837_RemoveSupabaseUid
-- ============================================================
DO $EF$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260619164837_RemoveSupabaseUid') THEN
    -- Remover índice e coluna SupabaseUid se ainda existirem
    DROP INDEX IF EXISTS "IX_users_SupabaseUid";
    ALTER TABLE users DROP COLUMN IF EXISTS "SupabaseUid";

    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260619164837_RemoveSupabaseUid', '10.0.9');
  END IF;
END $EF$;

-- ============================================================
-- Seed: SuperAdmin — mencalha1986@gmail.com / admin123@
-- Hash BCrypt (workFactor=12) gerado pela aplicação .NET.
-- ATENÇÃO: troque a senha após o primeiro login!
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM users WHERE "Email" = 'mencalha1986@gmail.com' OR "PlatformId" = 'mencalha') THEN
    UPDATE users
       SET "Email"        = 'mencalha1986@gmail.com',
           "PasswordHash" = '$2a$12$1ClnfwmOrXyb.B/C32v9aOO9Zi2lPOYpsfq/bpPTfTkK632mJ0ZJC',
           "Role"         = 'SuperAdmin',
           "IsActive"     = true,
           "UpdatedAt"    = now()
     WHERE "Email" = 'mencalha1986@gmail.com' OR "PlatformId" = 'mencalha';
  ELSE
    INSERT INTO users (
        "Id", "Email", "PasswordHash", "PlatformId", "DisplayName",
        "Role", "IsActive", "CreatedAt", "UpdatedAt"
    ) VALUES (
        gen_random_uuid(),
        'mencalha1986@gmail.com',
        '$2a$12$1ClnfwmOrXyb.B/C32v9aOO9Zi2lPOYpsfq/bpPTfTkK632mJ0ZJC',
        'mencalha',
        'CEO',
        'SuperAdmin',
        true,
        now(), now()
    );
  END IF;
END $$;
