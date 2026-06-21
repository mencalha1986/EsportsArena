-- ============================================================
-- Seed: 100 Players de teste
-- Senha: Player@123  (BCrypt workFactor=12)
-- Execute no Supabase SQL Editor ou psql
-- ============================================================
INSERT INTO users (
    "Id",
    "Email",
    "PasswordHash",
    "PlatformId",
    "DisplayName",
    "Role",
    "IsActive",
    "CreatedAt",
    "UpdatedAt"
)
SELECT
    gen_random_uuid(),
    'player' || LPAD(n::text, 2, '0') || '@test.com',
    '$2a$12$.kWqoKCn8P69iDDy5ISKkOlizQNm8j41bPWjDsDmJlc8bJ9kLKMBa',
    'player' || LPAD(n::text, 2, '0'),
    'Player ' || LPAD(n::text, 2, '0'),
    'Player',
    true,
    now(),
    now()
FROM generate_series(1, 100) AS n
ON CONFLICT DO NOTHING;
