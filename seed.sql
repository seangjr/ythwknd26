-- ythwknd25 seed data — matches constants.ts on this branch
-- Run after schema.sql to populate initial data.

-- Teams (21 teams from CONSTANTS.TEAMS)
INSERT INTO teams (id, name, color, code) VALUES
  ( 1, 'The Original Five',    'bg-team-01', 'U001'),
  ( 2, 'The Shrek Five',       'bg-team-02', 'U002'),
  ( 3, 'The Powerpuff Five',   'bg-team-03', 'U003'),
  ( 4, 'The Real Five',        'bg-team-04', 'U004'),
  ( 5, 'The Funko Five',       'bg-team-05', 'U005'),
  ( 6, 'The Spider Five',      'bg-team-06', 'U006'),
  ( 7, 'The Panda Five',       'bg-team-07', 'U007'),
  ( 8, 'The Little Miss Five', 'bg-team-08', 'U008'),
  ( 9, 'The Conan Five',       'bg-team-09', 'U009'),
  (10, 'The Minion Five',      'bg-team-10', 'U010'),
  (11, 'The Lego Five',        'bg-team-11', 'U011'),
  (12, 'The Avengers Five',    'bg-team-12', 'U012'),
  (13, 'The Smurfed Five',     'bg-team-13', 'U013'),
  (14, 'The Minecraft Five',   'bg-team-14', 'U014'),
  (15, 'The Clay Five',        'bg-team-15', 'U015'),
  (16, 'The Barbie Five',      'bg-team-16', 'U016'),
  (17, 'The 8 bit Five',       'bg-team-17', 'U017'),
  (18, 'The Quest Five',       'bg-team-18', 'U018'),
  (19, 'The Future Five',      'bg-team-19', 'U019'),
  (20, 'The Steampunk Five',   'bg-team-20', 'U020'),
  (21, 'The Cars Five',        'bg-team-21', 'U021')
ON CONFLICT (id) DO NOTHING;

-- Reset the teams id sequence so future inserts don't collide
SELECT setval('teams_id_seq', (SELECT MAX(id) FROM teams));

-- Hero availability: 5 heroes × 21 teams = 105 rows, all initially available
INSERT INTO hero_availability (team_id, hero_id, is_available)
SELECT t.id, h.hero_id, TRUE
FROM teams t
CROSS JOIN (
  VALUES ('alex'), ('suzzy'), ('charlotte'), ('charlie'), ('kai')
) AS h(hero_id)
ON CONFLICT (team_id, hero_id) DO NOTHING;
