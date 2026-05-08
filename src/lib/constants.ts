export const CONSTANTS = { SITE_TITLE: "YTHWKND",
  SITE_SUBTITLE: "AND THE",
  SITE_MAIN_TITLE: "MULTIVERSE OF MYSTERY",
  SITE_DESCRIPTION: "A HIGHSCHOOL EVENT BY @YMFGAKL",

  // Class options for party registration
  HEROES: [
    {
      id: "warrior",
      name: "Warrior",
      icon: "/icons-alt/Warrior.svg",
      class: "WARRIOR",
      perk: "FRONTLINE BREAKER",
      description:
        "Frontline Breaker. Smashes through obstacles, absorbs the hardest hits, and charges first when the mission turns brutal.",
    },
    {
      id: "archer",
      name: "Archer",
      icon: "/icons-alt/Archer.svg",
      class: "ARCHER",
      perk: "PRECISION STRIKER",
      description:
        "Precision Striker. Reads the battlefield, finds the opening, and delivers the shot that changes everything—right when time runs out.",
    },
    {
      id: "scout",
      name: "Scout",
      icon: "/icons-alt/Scout.svg",
      class: "SCOUT",
      perk: "RAPID PATHFINDER",
      description:
        "Rapid Pathfinder. Moves fast, gathers intel, and slips through the cracks to turn impossible routes into winning plays.",
    },
    {
      id: "guardian",
      name: "Guardian",
      icon: "/icons-alt/Guardian.svg",
      class: "GUARDIAN",
      perk: "IRON WALL",
      description:
        "Iron Wall. Holds the line, shields the team, and refuses to let chaos break the formation.",
    },
    {
      id: "scholar",
      name: "Scholar",
      icon: "/icons-alt/Scholar.svg",
      class: "SCHOLAR",
      perk: "TACTICAL MIND",
      description:
        "Tactical Mind. Deciphers patterns, solves locks, and builds the plan that unlocks victory when strength alone won't.",
    },
  ],

  // Party options (24 color-based parties, 5 slots each)
  TEAMS: [
    { id: 1, name: "Crimson", color: "bg-team-01", hex: "#DC143C", code: "PARTY 001" },
    { id: 2, name: "Sapphire", color: "bg-team-02", hex: "#0F52BA", code: "PARTY 002" },
    { id: 3, name: "Emerald", color: "bg-team-03", hex: "#50C878", code: "PARTY 003" },
    { id: 4, name: "Amber", color: "bg-team-04", hex: "#FFBF00", code: "PARTY 004" },
    { id: 5, name: "Violet", color: "bg-team-05", hex: "#7F00FF", code: "PARTY 005" },
    { id: 6, name: "Cobalt", color: "bg-team-06", hex: "#0047AB", code: "PARTY 006" },
    { id: 7, name: "Jade", color: "bg-team-07", hex: "#00A86B", code: "PARTY 007" },
    { id: 8, name: "Coral", color: "bg-team-08", hex: "#FF7F50", code: "PARTY 008" },
    { id: 9, name: "Slate", color: "bg-team-09", hex: "#708090", code: "PARTY 009" },
    { id: 10, name: "Gold", color: "bg-team-10", hex: "#FFD700", code: "PARTY 010" },
    { id: 11, name: "Ivory", color: "bg-team-11", hex: "#FFFFF0", code: "PARTY 011" },
    { id: 12, name: "Onyx", color: "bg-team-12", hex: "#353839", code: "PARTY 012" },
    { id: 13, name: "Rust", color: "bg-team-13", hex: "#B7410E", code: "PARTY 013" },
    { id: 14, name: "Teal", color: "bg-team-14", hex: "#008080", code: "PARTY 014" },
    { id: 15, name: "Bronze", color: "bg-team-15", hex: "#CD7F32", code: "PARTY 015" },
    { id: 16, name: "Silver", color: "bg-team-16", hex: "#C0C0C0", code: "PARTY 016" },
    { id: 17, name: "Scarlet", color: "bg-team-17", hex: "#FF2400", code: "PARTY 017" },
    { id: 18, name: "Azure", color: "bg-team-18", hex: "#007FFF", code: "PARTY 018" },
    { id: 19, name: "Maroon", color: "bg-team-19", hex: "#800000", code: "PARTY 019" },
    { id: 20, name: "Indigo", color: "bg-team-20", hex: "#4B0082", code: "PARTY 020" },
    { id: 21, name: "Magenta", color: "bg-team-21", hex: "#FF00FF", code: "PARTY 021" },
    { id: 22, name: "Lime", color: "bg-team-22", hex: "#BFFF00", code: "PARTY 022" },
    { id: 23, name: "Turquoise", color: "bg-team-23", hex: "#40E0D0", code: "PARTY 023" },
    { id: 24, name: "Plum", color: "bg-team-24", hex: "#8E4585", code: "PARTY 024" },
  ],

  // Class image paths — placeholder for now, classes share a single icon per class
  HERO_IMAGE_PATHS: [] as { teamId: number; hero: string; path: string }[],

  // Updated CG Leaders for 2026
  CG_LEADERS: [
    "Annabelle Foo",
    "Axel Chong",
    "Christopher + Oscar",
    "Daniel Loo",
    "David Tiah",
    "Fanna Tan",
    "Japheth",
    "Jenisha Kong",
    "Jessica Lee",
    "Jonathan Yee",
    "Joshua Yap",
    "Kujeyna",
    "Le Shiuan",
    "Rachel Anne",
    "Samantha Edwin",
    "Yae-ber Neo",
  ],

  // Mock ages for demo
  MOCK_AGES: [13, 14, 15, 16, 17],
};
