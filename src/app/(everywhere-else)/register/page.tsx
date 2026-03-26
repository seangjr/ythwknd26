"use client";

import { RegistrationModal } from "@/components/registration-modal";
import { TeamInviteModal } from "@/components/team-invite-modal";
import { Button } from "@/components/ui/button";
import { HoloCard } from "@/components/ui/holo-card";
import { CONSTANTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { Share01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Class-specific overlay colors for HoloCard
const CLASS_COLORS: Record<string, string> = {
  warrior: "#ef4444",
  archer: "#22c55e",
  scout: "#0ea5e9",
  guardian: "#f59e0b",
  scholar: "#8b5cf6",
};

// SVG background images per hero
const HERO_BG: Record<string, string> = {
  warrior: "/card-bg/Warrior.svg",
  archer: "/card-bg/Archer.svg",
  scout: "/card-bg/Scout.svg",
  guardian: "/card-bg/Guardian.svg",
  scholar: "/card-bg/Scholar.svg",
};

// Alt icons for mobile view
const HERO_ALT_ICON: Record<string, string> = {
  warrior: "/icons-alt/Warrior.svg",
  archer: "/icons-alt/Archer.svg",
  scout: "/icons-alt/Scout.svg",
  guardian: "/icons-alt/Guardian.svg",
  scholar: "/icons-alt/Scholar.svg",
};

interface Registration {
  id: number;
  line_number: number;
  group_number: number;
  nickname: string;
  hero_id: string;
  team_id: number;
  full_name: string;
  age: number;
  instagram_handle?: string;
}

interface HeroAvailability {
  heroId: string;
  teamId: number;
  isAvailable: boolean;
}
export default function Registration() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [heroAvailability, setHeroAvailability] = useState<HeroAvailability[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedHero, setSelectedHero] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [inviteTeam, setInviteTeam] = useState<{
    id: number;
    name: string;
    color: string;
  } | null>(null);
  const [availableHeroes, setAvailableHeroes] = useState<number>(0);
  const [totalHeroes, setTotalHeroes] = useState<number>(0);
  const [clickedHeroData, setClickedHeroData] = useState<{
    heroId: string;
    teamId: number;
    lineNumber: number | null;
  } | null>(null);

  // Fetch all registrations and hero availability
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all registrations via API
        const regRes = await fetch("/api/team-members");
        if (!regRes.ok) throw new Error("Failed to fetch registrations");
        const regJson = await regRes.json();
        const regData: Registration[] = regJson.members || [];

        // Fetch all hero availability via API
        const heroRes = await fetch("/api/hero-availability");
        if (!heroRes.ok) throw new Error("Failed to fetch hero availability");
        const heroData: HeroAvailability[] = await heroRes.json();

        setRegistrations(regData);
        setHeroAvailability(heroData);

        // Calculate available heroes
        const available = heroData.filter((h) => h.isAvailable).length;
        setAvailableHeroes(available);
        setTotalHeroes(heroData.length);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Handle hero selection
  const handleHeroSelect = (heroId: string, teamId: number) => {
    setSelectedHero(heroId);
    setSelectedTeam(teamId);

    // Find next available line in this team
    const nextLine = getNextAvailableLineForTeam(teamId);
    if (nextLine) {
      setSelectedLine(nextLine);
    }
  };

  // Get next available line for a team
  const getNextAvailableLineForTeam = (teamId: number) => {
    const startLine = (teamId - 1) * 5 + 1;
    const endLine = startLine + 4;

    const takenLines = registrations
      .filter((r) => r.team_id === teamId)
      .map((r) => r.line_number);

    for (let i = startLine; i <= endLine; i++) {
      if (!takenLines.includes(i)) {
        return i;
      }
    }

    return null;
  };

  // Handle register button click
  const handleRegisterClick = (heroId: string, teamId: number) => {
    // Find next available line in this team
    const nextLine = getNextAvailableLineForTeam(teamId);

    if (nextLine) {
      // Store all clicked data together instead of in separate states
      setClickedHeroData({
        heroId,
        teamId,
        lineNumber: nextLine,
      });

      // Open modal after setting the data
      setIsModalOpen(true);
    }
  };
  // Handle invite button click
  const handleInviteClick = (teamId: number) => {
    const team = CONSTANTS.TEAMS.find((t) => t.id === teamId);
    if (team) {
      setInviteTeam({
        id: team.id,
        name: team.name,
        color: team.color,
      });
      setIsInviteModalOpen(true);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    // Clear clicked data when modal is closed
    setClickedHeroData(null);
  };
  // Handle invite modal close
  const handleInviteModalClose = () => {
    setIsInviteModalOpen(false);
    // Delay clearing inviteTeam so the Dialog exit animation can play
    setTimeout(() => setInviteTeam(null), 350);
  };

  // Handle successful registration
  const handleRegistrationSuccess = (newRegistration: Registration) => {
    // Use data from clickedHeroData instead of state
    const heroId = clickedHeroData?.heroId || "";
    const teamId = clickedHeroData?.teamId || 1;

    // Update registrations list
    setRegistrations([...registrations, newRegistration]);

    // Update hero availability
    setHeroAvailability((prev) =>
      prev.map((h) =>
        h.heroId === heroId && h.teamId === teamId
          ? { ...h, isAvailable: false }
          : h,
      ),
    );

    // Update available heroes count
    setAvailableHeroes((prev) => prev - 1);

    // Close modal
    // handleModalClose();
  };

  // Get team-specific hero availability
  const getTeamHeroAvailability = (teamId: number) => {
    return heroAvailability.filter((h) => h.teamId === teamId);
  };

  // Check if a hero is available for a team
  const isHeroAvailable = (heroId: string, teamId: number) => {
    const hero = heroAvailability.find(
      (h) => h.heroId === heroId && h.teamId === teamId,
    );
    return hero?.isAvailable ?? true;
  };

  // Get team member count
  const getTeamMemberCount = (teamId: number) => {
    return registrations.filter((r) => r.team_id === teamId).length;
  };

  // Get available heroes count for a team
  const getTeamAvailableHeroesCount = (teamId: number) => {
    return heroAvailability.filter((h) => h.teamId === teamId && h.isAvailable)
      .length;
  };


  const blocks = [
    "PLEASE READ BEFORE PROCEEDING.",
    "SELECT A PARTY FROM THE LIST BELOW AND CHOOSE YOUR CLASS.",
    "THE PARTY THAT YOU SELECT WILL INCLUDE THE PEOPLE YOU WILL PLAY WITH AS A TEAM.",
    "IF YOU ARE REGISTERING ALONE, CHOOSE A PARTY AND CLASS AS YOU WISH.",
    "IF YOU ARE REGISTERING WITH A GROUP OF TWO OR MORE FRIENDS, PLEASE ENSURE THAT THE PARTY HAS ENOUGH SLOTS AVAILABLE FOR YOUR GROUP.",
    "NO RESERVATION OF PARTIES ARE ALLOWED. OTHER PARTICIPANTS MAY SECURE THE SLOTS MEANT FOR YOUR FRIENDS.",
    "VIEW OUR REGISTRATION COUNTER LOCATED BEHIND L5 AFTER SERVICE IF YOU NEED HELP WITH ANY INQUIRIES, SIGNUPS OR PAYMENTS.",
  ];

  return clickedHeroData ? (
    <RegistrationModal
      isOpen={isModalOpen}
      onClose={handleModalClose}
      lineNumber={clickedHeroData.lineNumber || 0}
      teamId={clickedHeroData.teamId}
      preselectedHero={clickedHeroData.heroId}
      onSuccess={handleRegistrationSuccess}
    />
  ) : (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col justify-center px-4 md:px-8 mt-16"
    >
      {/* Desc section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-4 md:gap-6 items-center"
      >
        {/* Small text block */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="uppercase text-center"
        >
          <p className="text-xs md:text-base">Character selection</p>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-4xl md:text-6xl text-center font-jetsytrial"
        >
          Choose your class
        </motion.h1>
        {blocks.map((block, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
            className="uppercase text-center"
          >
            <p className="text-xs md:text-base">{block}</p>
          </motion.div>
        ))}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center py-10 my-10"
        >
          <h2 className="text-8xl mb-2 font-jejuhallasan">
            <motion.span
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className={cn(
                availableHeroes < totalHeroes
                  ? "text-amber-500"
                  : availableHeroes <= 0
                    ? "text-red-500"
                    : "text-green-500",
              )}
            >
              {availableHeroes}
            </motion.span>
            /<span>{totalHeroes}</span>
          </h2>
          <p className="text-3xl uppercase font-jejuhallasan">Classes Available</p>
        </motion.div>
      </motion.section>
      {loading ? (
        <div className="space-y-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="h-48 bg-[#1a1a1a] rounded-lg animate-pulse"
            ></motion.div>
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="space-y-12"
        >
          {/* Team Universes */}
          {CONSTANTS.TEAMS.map((team, teamIndex) => {
            const teamHeroAvailability = getTeamHeroAvailability(team.id);
            const availableCount = getTeamAvailableHeroesCount(team.id);
            const memberCount = getTeamMemberCount(team.id);

            return (
              <motion.div 
                key={team.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.4 + teamIndex * 0.2 }}
                className="mb-8"
              >
                {/* Team Header */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 1.6 + teamIndex * 0.2 }}
                  className="flex justify-between items-center mb-4 p-3"
                >
                  <div className="flex items-center">
                    <h3 className="text-xs md:text-base uppercase">
                      {team.code} {team.name}
                    </h3>
                    <div className="ml-3 hidden md:flex items-center">
                      <HugeiconsIcon icon={UserGroupIcon} size={16} className="mr-1 text-gray-400" />
                      <span className="text-sm text-gray-400">
                        {memberCount}/5
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <span
                      className={cn(
                        availableCount < 5
                          ? "text-amber-500"
                          : "text-green-500",
                        availableCount === 0
                          ? "text-red-500"
                          : "text-green-500",
                        "uppercase md:text-base text-xs",
                      )}
                    >
                      {availableCount !== 0
                        ? `${availableCount}/5 Classes`
                        : "Unavailable"}
                    </span>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="sm"
                        variant="parchment"
                        className="cursor-pointer"
                        onClick={() => handleInviteClick(team.id)}
                      >
                        <HugeiconsIcon icon={Share01Icon} size={16} className="mr-1" />
                        <span className="hidden sm:inline">Invite</span>
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Hero Grid */}
                <div className="grid grid-cols-5 gap-2 md:gap-3 w-full">
                  {CONSTANTS.HEROES.map((hero, heroIndex) => {
                    const isAvailable = isHeroAvailable(hero.id, team.id);
                    const takenByMember = !isAvailable
                      ? registrations.find(
                          (r) => r.hero_id === hero.id && r.team_id === team.id,
                        )
                      : null;
                    const displayName = !isAvailable && takenByMember?.instagram_handle
                      ? `@${takenByMember.instagram_handle.replace(/^@/, "")}`
                      : hero.name;

                    return (
                      <motion.div
                        key={`team-${team.id}-${hero.id}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          duration: 0.4,
                          delay: 1.8 + teamIndex * 0.2 + heroIndex * 0.1
                        }}
                        className="w-full"
                      >
                        {/* Mobile: compact HoloCard with alt icons */}
                        <div
                          className={cn(
                            "md:hidden w-full aspect-square transition-all duration-300",
                            !isAvailable && "grayscale opacity-50"
                          )}
                          onClick={() => isAvailable && handleRegisterClick(hero.id, team.id)}
                        >
                          <HoloCard
                            data={{
                              name: "",
                              backgroundImage: HERO_ALT_ICON[hero.id],
                              overlayColor: team.hex,
                              overlayOpacity: 20,
                            }}
                            width="full"
                            showSparkles={isAvailable}
                            forceSide="front"
                            minimal
                          />
                        </div>

                        {/* Desktop: full HoloCard */}
                        <div className={cn(
                          "hidden md:block w-full aspect-[5/7] transition-all duration-300",
                          !isAvailable && "grayscale opacity-50"
                        )}>
                          <HoloCard
                            data={{
                              name: displayName,
                              subtitle: hero.perk,
                              description: hero.description,
                              backgroundImage: HERO_BG[hero.id],
                              iconImage: hero.icon,
                              overlayColor: team.hex,
                              overlayOpacity: 25,
                            }}
                            width="full"
                            showSparkles={isAvailable}
                            forceSide={!isAvailable ? "front" : undefined}
                            actionLabel={isAvailable ? "Claim Class" : "Claimed"}
                            onAction={isAvailable ? () => handleRegisterClick(hero.id, team.id) : undefined}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Team Invite Modal */}
      <AnimatePresence>
        {inviteTeam && (
          <TeamInviteModal
            isOpen={isInviteModalOpen}
            onClose={handleInviteModalClose}
            teamId={inviteTeam.id}
            teamName={inviteTeam.name}
            teamColor={inviteTeam.color}
          />
        )}
      </AnimatePresence>
    </motion.main>
  );
}
