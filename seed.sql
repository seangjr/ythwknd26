-- ythwknd25 seed data — matches constants.ts
-- Run after schema.sql to populate initial data.

-- Teams (24 parties from CONSTANTS.TEAMS)
INSERT INTO teams (id, name, color, code) VALUES
  ( 1, 'Crimson',   'bg-team-01', 'P001'),
  ( 2, 'Sapphire',  'bg-team-02', 'P002'),
  ( 3, 'Emerald',   'bg-team-03', 'P003'),
  ( 4, 'Amber',     'bg-team-04', 'P004'),
  ( 5, 'Violet',    'bg-team-05', 'P005'),
  ( 6, 'Cobalt',    'bg-team-06', 'P006'),
  ( 7, 'Jade',      'bg-team-07', 'P007'),
  ( 8, 'Coral',     'bg-team-08', 'P008'),
  ( 9, 'Slate',     'bg-team-09', 'P009'),
  (10, 'Gold',      'bg-team-10', 'P010'),
  (11, 'Ivory',     'bg-team-11', 'P011'),
  (12, 'Onyx',      'bg-team-12', 'P012'),
  (13, 'Rust',      'bg-team-13', 'P013'),
  (14, 'Teal',      'bg-team-14', 'P014'),
  (15, 'Bronze',    'bg-team-15', 'P015'),
  (16, 'Silver',    'bg-team-16', 'P016'),
  (17, 'Scarlet',   'bg-team-17', 'P017'),
  (18, 'Azure',     'bg-team-18', 'P018'),
  (19, 'Maroon',    'bg-team-19', 'P019'),
  (20, 'Indigo',    'bg-team-20', 'P020'),
  (21, 'Magenta',   'bg-team-21', 'P021'),
  (22, 'Lime',      'bg-team-22', 'P022'),
  (23, 'Turquoise', 'bg-team-23', 'P023'),
  (24, 'Plum',      'bg-team-24', 'P024')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, color = EXCLUDED.color, code = EXCLUDED.code;

-- Reset the teams id sequence so future inserts don't collide
SELECT setval('teams_id_seq', (SELECT MAX(id) FROM teams));

-- Hero availability: 5 classes × 24 teams = 120 rows, all initially available
-- Class IDs match CONSTANTS.HEROES[].id in constants.ts
INSERT INTO hero_availability (team_id, hero_id, is_available)
SELECT t.id, h.hero_id, TRUE
FROM teams t
CROSS JOIN (
  VALUES ('warrior'), ('archer'), ('scout'), ('guardian'), ('scholar')
) AS h(hero_id)
ON CONFLICT (team_id, hero_id) DO NOTHING;
