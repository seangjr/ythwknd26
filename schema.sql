-- ythwknd25 schema — Neon Postgres
-- Run once against your Neon database to create the required tables.

-- 1. Teams
CREATE TABLE IF NOT EXISTS teams (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  color       VARCHAR(50)  NOT NULL,
  code        VARCHAR(10)  NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 2. Hero availability (one row per team × hero combination)
CREATE TABLE IF NOT EXISTS hero_availability (
  id           SERIAL PRIMARY KEY,
  team_id      INTEGER      NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  hero_id      VARCHAR(50)  NOT NULL,
  is_available BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (team_id, hero_id)
);

-- 3. Team invites
CREATE TABLE IF NOT EXISTS team_invites (
  id          SERIAL PRIMARY KEY,
  team_id     INTEGER      NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  invite_code VARCHAR(50)  NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ  NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 4. Registrations
CREATE TABLE IF NOT EXISTS registrations (
  id                              SERIAL PRIMARY KEY,
  line_number                     INTEGER,
  group_number                    INTEGER,
  email                           VARCHAR(255) NOT NULL,
  full_name                       VARCHAR(255) NOT NULL,
  nickname                        VARCHAR(100),
  age                             INTEGER,
  gender                          VARCHAR(20),
  nric_passport                   VARCHAR(50),
  contact_number                  VARCHAR(30),
  instagram_handle                VARCHAR(100),
  school_name                     VARCHAR(255),
  ym_member                       BOOLEAN DEFAULT FALSE,
  cg_leader                       VARCHAR(255),
  hero_id                         VARCHAR(50),
  team_id                         INTEGER REFERENCES teams(id) ON DELETE SET NULL,
  invite_code                     VARCHAR(50),
  emergency_contact_name          VARCHAR(255),
  emergency_contact_relationship  VARCHAR(100),
  emergency_contact_phone         VARCHAR(30),
  emergency_contact_email         VARCHAR(255),
  -- Extended registration fields
  is_christian                    VARCHAR(50),
  event_source                    VARCHAR(100),
  other_event_source              VARCHAR(255),
  invited_by_friend               VARCHAR(255),
  church_name                     VARCHAR(255),
  pastor_name                     VARCHAR(255),
  church_role                     VARCHAR(100),
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_registrations_team_id ON registrations(team_id);
CREATE INDEX IF NOT EXISTS idx_registrations_email   ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_hero_availability_team ON hero_availability(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_code     ON team_invites(invite_code);

-- Stored procedure: register_user (transactional insert + hero lock)
CREATE OR REPLACE FUNCTION register_user(
  p_line_number INTEGER,
  p_group_number INTEGER,
  p_email VARCHAR,
  p_full_name VARCHAR,
  p_nickname VARCHAR,
  p_age INTEGER,
  p_gender VARCHAR,
  p_nric_passport VARCHAR,
  p_contact_number VARCHAR,
  p_instagram_handle VARCHAR,
  p_school_name VARCHAR,
  p_ym_member BOOLEAN,
  p_cg_leader VARCHAR,
  p_hero_id VARCHAR,
  p_team_id INTEGER,
  p_invite_code VARCHAR,
  p_emergency_contact_name VARCHAR,
  p_emergency_contact_relationship VARCHAR,
  p_emergency_contact_phone VARCHAR,
  p_emergency_contact_email VARCHAR
) RETURNS JSONB
LANGUAGE plpgsql AS $$
DECLARE v_result JSONB;
BEGIN
  INSERT INTO registrations (
    line_number, group_number, email, full_name, nickname, age, gender,
    nric_passport, contact_number, instagram_handle, school_name, ym_member,
    cg_leader, hero_id, team_id, invite_code,
    emergency_contact_name, emergency_contact_relationship,
    emergency_contact_phone, emergency_contact_email, created_at
  ) VALUES (
    p_line_number, p_group_number, p_email, p_full_name, p_nickname, p_age,
    p_gender, p_nric_passport, p_contact_number, p_instagram_handle,
    p_school_name, p_ym_member, p_cg_leader, p_hero_id, p_team_id,
    p_invite_code, p_emergency_contact_name, p_emergency_contact_relationship,
    p_emergency_contact_phone, p_emergency_contact_email, NOW()
  ) RETURNING to_jsonb(registrations.*) INTO v_result;

  UPDATE hero_availability
    SET is_available = FALSE
    WHERE team_id = p_team_id AND hero_id = p_hero_id;

  RETURN v_result;
END; $$;

-- Stored procedure: register_user_extended (includes survey fields)
CREATE OR REPLACE FUNCTION register_user_extended(
  p_line_number INTEGER,
  p_group_number INTEGER,
  p_email VARCHAR,
  p_full_name VARCHAR,
  p_nickname VARCHAR,
  p_age INTEGER,
  p_gender VARCHAR,
  p_nric_passport VARCHAR,
  p_contact_number VARCHAR,
  p_instagram_handle VARCHAR,
  p_school_name VARCHAR,
  p_ym_member BOOLEAN,
  p_cg_leader VARCHAR,
  p_hero_id VARCHAR,
  p_team_id INTEGER,
  p_invite_code VARCHAR,
  p_emergency_contact_name VARCHAR,
  p_emergency_contact_relationship VARCHAR,
  p_emergency_contact_phone VARCHAR,
  p_emergency_contact_email VARCHAR,
  p_is_christian VARCHAR,
  p_event_source VARCHAR,
  p_other_event_source VARCHAR,
  p_invited_by_friend VARCHAR,
  p_church_name VARCHAR,
  p_pastor_name VARCHAR,
  p_church_role VARCHAR
) RETURNS JSONB
LANGUAGE plpgsql AS $$
DECLARE v_result JSONB;
BEGIN
  INSERT INTO registrations (
    line_number, group_number, email, full_name, nickname, age, gender,
    nric_passport, contact_number, instagram_handle, school_name, ym_member,
    cg_leader, hero_id, team_id, invite_code,
    emergency_contact_name, emergency_contact_relationship,
    emergency_contact_phone, emergency_contact_email,
    is_christian, event_source, other_event_source, invited_by_friend,
    church_name, pastor_name, church_role, created_at
  ) VALUES (
    p_line_number, p_group_number, p_email, p_full_name, p_nickname, p_age,
    p_gender, p_nric_passport, p_contact_number, p_instagram_handle,
    p_school_name, p_ym_member, p_cg_leader, p_hero_id, p_team_id,
    p_invite_code, p_emergency_contact_name, p_emergency_contact_relationship,
    p_emergency_contact_phone, p_emergency_contact_email,
    p_is_christian, p_event_source, p_other_event_source, p_invited_by_friend,
    p_church_name, p_pastor_name, p_church_role, NOW()
  ) RETURNING to_jsonb(registrations.*) INTO v_result;

  UPDATE hero_availability
    SET is_available = FALSE
    WHERE team_id = p_team_id AND hero_id = p_hero_id;

  RETURN v_result;
END; $$;
