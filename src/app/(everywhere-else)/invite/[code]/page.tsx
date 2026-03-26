"use client";

import { RegistrationModal } from "@/components/registration-modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { HoloCard } from "@/components/ui/holo-card";
import { Skeleton } from "@/components/ui/skeleton";
import { CONSTANTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  Alert02Icon,
  ArrowLeft02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { usePageTransition } from "@/components/page-transition";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

interface TeamInvite {
  teamId: number;
  teamName: string;
  teamColor: string;
  expiresAt: string;
}

interface HeroAvailability {
  heroId: string;
  isAvailable: boolean;
}

const getHeroIcon = (heroId: string) => {
  const heroObj = CONSTANTS.HEROES.find(h => h.id === heroId);
  return heroObj?.icon || "/placeholder.svg";
};

export default function TeamInvitePage() {
  const params = useParams();
  const { navigateTo } = usePageTransition();
  const [invite, setInvite] = useState<TeamInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableLines, setAvailableLines] = useState<number[]>([]);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [availableHeroes, setAvailableHeroes] = useState<HeroAvailability[]>(
    [],
  );
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [selectedHero, setSelectedHero] = useState<string | null>(null);
  const [totalHeroes, setTotalHeroes] = useState(0);
  const [availableHeroCount, setAvailableHeroCount] = useState(0);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [isHeroesLoaded, setIsHeroesLoaded] = useState(false);

  const inviteCode = params.code as string;

  // Fetch invite details
  useEffect(() => {
    async function fetchInvite() {
      try {
        const response = await fetch(`/api/team-invite?code=${inviteCode}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Invalid invite code");
        }

        const data = await response.json();
        setInvite(data);
      } catch (error) {
        console.error("Error fetching invite:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load invite",
        );
      } finally {
        setLoading(false);
      }
    }

    if (inviteCode) {
      fetchInvite();
    }
  }, [inviteCode]);

  // Fetch available lines and heroes for this team
  const fetchAvailableData = async () => {
    if (!invite) return;

    try {
      setIsHeroesLoaded(false);

      // Fetch team members, team hero availability, and all hero availability in parallel
      const [membersRes, teamHeroRes, allHeroRes] = await Promise.all([
        fetch(`/api/team-members?teamId=${invite.teamId}`),
        fetch(`/api/hero-availability?teamId=${invite.teamId}`),
        fetch(`/api/hero-availability`),
      ]);

      if (!membersRes.ok) throw new Error("Failed to fetch team members");
      if (!teamHeroRes.ok) throw new Error("Failed to fetch team hero availability");
      if (!allHeroRes.ok) throw new Error("Failed to fetch all hero availability");

      // Team members — API returns { members: [...] } with snake_case DB fields
      const membersData = await membersRes.json();
      const registrations = membersData.members || [];
      setTeamMembers(registrations);

      // Calculate which lines are taken (API returns snake_case field names)
      const takenLines = registrations.map((r: any) => r.line_number);

      // Calculate available lines (5 lines per team)
      const teamIndex = invite.teamId - 1;
      const startLine = teamIndex * 5 + 1;
      const availLines = Array.from(
        { length: 5 },
        (_, i) => startLine + i,
      ).filter((line) => !takenLines.includes(line));

      setAvailableLines(availLines);

      // Team hero availability — API returns camelCase array [{ heroId, teamId, isAvailable }]
      const teamHeroData: HeroAvailability[] = await teamHeroRes.json();
      setAvailableHeroes(teamHeroData);

      // Set the first available hero as default
      const firstAvailableHero = CONSTANTS.HEROES.find(hero => 
        !registrations.some((r: any) => r.hero_id === hero.id)
      );
      setSelectedHero(firstAvailableHero?.id || null);

      // All hero availability — API returns camelCase array [{ heroId, teamId, isAvailable }]
      const allHeroData: HeroAvailability[] = await allHeroRes.json();
      setTotalHeroes(allHeroData.length);
      setAvailableHeroCount(
        allHeroData.filter((h) => h.isAvailable).length,
      );
    } catch (error) {
      console.error("Error fetching available data:", error);
    } finally {
      setIsHeroesLoaded(true);
    }
  };

  useEffect(() => {
    if (invite) {
      fetchAvailableData();
    }
  }, [invite]);

  // Handle hero selection
  const handleHeroSelect = (heroId: string) => {
    // Clear any previous errors
    setSelectionError(null);

    // Check if hero is available
    const isHeroTaken = teamMembers.some((member) => member.hero_id === heroId);

    if (isHeroTaken) {
      setSelectionError(
        "This class has already been selected by another team member.",
      );
      return;
    }

    setSelectedHero(heroId);
  };

  // Handle registration button click
  const handleRegister = () => {
    if (availableLines.length === 0) return;
    if (!selectedHero || !isHeroAvailable(selectedHero)) {
      setSelectionError("Please select an available class before registering.");
      return;
    }

    setSelectedLine(availableLines[0]);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedLine(null);
    // Refresh team members data when modal is closed
    fetchAvailableData();
  };

  // Handle successful registration
  const handleRegistrationSuccess = (registration: any) => {
    // Mark the selected hero as taken locally
    if (selectedHero) {
      setTeamMembers((prev) => [
        ...prev,
        { hero_id: selectedHero, line_number: selectedLine },
      ]);
      setAvailableHeroes((prev) =>
        prev.map((h) =>
          h.heroId === selectedHero
            ? { ...h, isAvailable: false }
            : h,
        ),
      );
      setAvailableHeroCount((prev) => prev - 1);
      setAvailableLines((prev) =>
        prev.filter((line) => line !== selectedLine),
      );
    }
    // Close modal
    setIsModalOpen(false);
    setSelectedLine(null);
  };

  // Check if a hero is available
  const isHeroAvailable = (heroId: string) => {
    return !teamMembers.some((member) => member.hero_id === heroId);
  };

  if (loading) {
    return (
      <div className="min-h-screen text-[#F7EAD9] flex flex-col">
        {/* Header */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full space-y-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-4"
            >
              <Skeleton className="h-12 w-2/3 mx-auto rounded-lg bg-[#1a1a1a]" />
              <Skeleton className="h-8 w-1/3 mx-auto rounded-lg bg-[#1a1a1a]" />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-2 gap-6"
            >
              <div className="space-y-6">
                <Skeleton className="h-64 w-full rounded-2xl bg-[#1a1a1a]" />
                <Skeleton className="h-16 w-full rounded-full bg-[#1a1a1a]" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/2 rounded-lg bg-[#1a1a1a]" />
                <Skeleton className="h-48 w-full rounded-2xl bg-[#1a1a1a]" />
                <Skeleton className="h-24 w-full rounded-lg bg-[#1a1a1a]" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen text-[#F7EAD9] flex flex-col">
        {/* Header */}
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full space-y-8 text-center"
          >
            <div className="mt-12">
              <motion.h3 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-2xl font-bold text-red-500"
              >
                Invalid Invite
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-gray-400 mt-2"
              >
                {error || "This invite link is invalid or has expired."}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => navigateTo("/")}
                  variant="parchment" size="xl" className="mt-6"
                >
                  RETURN TO HOME
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>

      </div>
    );
  }

  // Get team details
  const team =
    CONSTANTS.TEAMS.find((t) => t.id === invite.teamId) || CONSTANTS.TEAMS[0];
  const availableHeroesCount = CONSTANTS.HEROES.filter((hero) =>
    isHeroAvailable(hero.id),
  ).length;

  const blocks = [
    "PLEASE READ BEFORE PROCEEDING.",
    "SELECT A PARTY FROM THE LIST BELOW AND CHOOSE YOUR CLASS.",
    "THE PARTY THAT YOU SELECT WILL INCLUDE THE PEOPLE YOU WILL PLAY WITH AS A TEAM.",
    "IF YOU ARE REGISTERING ALONE, CHOOSE A PARTY AND CLASS AS YOU WISH.",
    "IF YOU ARE REGISTERING WITH A GROUP OF TWO OR MORE FRIENDS, PLEASE ENSURE THAT THE PARTY HAS ENOUGH SLOTS AVAILABLE FOR YOUR GROUP.",
    "NO RESERVATION OF PARTIES ARE ALLOWED. OTHER PARTICIPANTS MAY SECURE THE SLOTS MEANT FOR YOUR FRIENDS.",
    "VIEW OUR REGISTRATION COUNTER LOCATED BEHIND L5 AFTER SERVICE IF YOU NEED HELP WITH ANY INQUIRIES, SIGNUPS OR PAYMENTS.",
  ];

  return (
    <>
      {/* Registration Modal */}
      <AnimatePresence>
        {selectedLine && (
          <RegistrationModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            lineNumber={selectedLine}
            teamId={invite.teamId}
            inviteCode={inviteCode}
            preselectedHero={selectedHero || undefined}
            onSuccess={handleRegistrationSuccess}
          />
        )}
      </AnimatePresence>

      {!selectedLine && (
        <div className="min-h-screen text-[#F7EAD9] flex flex-col">
          {/* Back button */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="p-4"
          >
            <button
              onClick={() => navigateTo("/register")}
              className="cursor-pointer flex items-center text-gray-400 hover:text-[#F7EAD9] transition-colors"
            >
              <HugeiconsIcon icon={ArrowLeft02Icon} size={16} className="mr-2" />
              <span>BACK</span>
            </button>
          </motion.div>

          <main className="flex-1 container mx-auto px-4 py-4 flex flex-col items-center text-[#F7EAD9]">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-6"
            >
              <div className="uppercase text-center">
                <p className="text-xs md:text-base">Class selection</p>
              </div>
              <h1 className="text-4xl md:text-6xl text-center font-jetsytrial mt-4">
                Choose your class
              </h1>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid gap-4"
            >
              {blocks.map((block, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  className="uppercase text-center"
                >
                  <p className="text-xs md:text-base">{block}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Hero count */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-center py-10 my-10"
            >
              <h2 className="text-8xl mb-2 font-jejuhallasan">
                <span className="text-amber-500">{availableHeroesCount}</span>/
                <span>{CONSTANTS.HEROES.length}</span>
              </h2>
              <p className="text-3xl uppercase font-jejuhallasan">Classes Available</p>
            </motion.div>

            {/* Selection Error */}
            <AnimatePresence>
              {selectionError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert className="bg-red-900/50 border-red-800 text-[#F7EAD9] mb-4 max-w-2xl">
                    <HugeiconsIcon icon={Alert02Icon} size={16} />
                    <AlertDescription>{selectionError}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Team Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="w-full max-w-4xl flex justify-between items-center mb-4 px-2"
            >
              <h3 className="text-xs md:text-base uppercase">
                {team.code} {team.name}
              </h3>
              <span className={cn(
                "uppercase md:text-base text-xs",
                availableHeroesCount === 0 ? "text-red-500" : availableHeroesCount < 5 ? "text-amber-500" : "text-green-500",
              )}>
                {availableHeroesCount > 0 ? `${availableHeroesCount}/5 Classes` : "Unavailable"}
              </span>
            </motion.div>

            {/* Hero Grid — HoloCards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="w-full max-w-4xl mb-8"
            >
              <div className="grid grid-cols-5 gap-2 md:gap-3 w-full">
                {CONSTANTS.HEROES.map((hero, heroIndex) => {
                  const isAvail = isHeroAvailable(hero.id);
                  const member = teamMembers.find((m: any) => m.hero_id === hero.id);
                  const username = !isAvail && member?.instagram_handle
                    ? `@${member.instagram_handle.replace(/^@/, "")}`
                    : undefined;

                  return (
                    <motion.div
                      key={hero.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.9 + heroIndex * 0.1 }}
                      className="w-full"
                    >
                      {/* Mobile: compact HoloCard */}
                      <div
                        className={cn(
                          "md:hidden w-full aspect-square transition-all duration-300",
                          !isAvail && "grayscale opacity-50"
                        )}
                        onClick={() => isAvail && handleHeroSelect(hero.id)}
                      >
                        <HoloCard
                          data={{
                            name: "",
                            backgroundImage: HERO_ALT_ICON[hero.id],
                            overlayColor: team.hex,
                            overlayOpacity: 20,
                          }}
                          width="full"
                          showSparkles={isAvail}
                          forceSide="front"
                          minimal
                        />
                      </div>

                      {/* Desktop: full HoloCard */}
                      <div className={cn(
                        "hidden md:block w-full aspect-[5/7] transition-all duration-300",
                        !isAvail && "grayscale opacity-50"
                      )}>
                        <HoloCard
                          data={{
                            name: hero.name,
                            username,
                            subtitle: hero.perk,
                            description: hero.description,
                            backgroundImage: HERO_BG[hero.id],
                            iconImage: hero.icon,
                            overlayColor: team.hex,
                            overlayOpacity: 25,
                          }}
                          width="full"
                          showSparkles={isAvail}
                          forceSide={!isAvail ? "front" : undefined}
                          actionLabel={isAvail ? "Claim Class" : "Claimed"}
                          onAction={isAvail ? () => {
                            handleHeroSelect(hero.id);
                            handleRegister();
                          } : undefined}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Mobile: Register button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.2 }}
                className="md:hidden mt-4"
              >
                {availableLines.length > 0 ? (
                  <Button
                    onClick={handleRegister}
                    disabled={!isHeroesLoaded || !selectedHero || !isHeroAvailable(selectedHero)}
                    variant="parchment" size="xl"
                    className="cursor-pointer w-full"
                  >
                    {!isHeroesLoaded
                      ? "Loading..."
                      : !selectedHero || !isHeroAvailable(selectedHero)
                        ? "Select A Class"
                        : `Register as ${CONSTANTS.HEROES.find(h => h.id === selectedHero)?.name}`}
                  </Button>
                ) : (
                  <Alert className="bg-red-900/50 border-red-800 !text-[#F7EAD9]">
                    <HugeiconsIcon icon={AlertCircleIcon} size={20} />
                    <AlertDescription className="text-[#F7EAD9] font-jejuhallasan text-lg">
                      ALL CLASSES FOR THIS PARTY ARE TAKEN!
                    </AlertDescription>
                  </Alert>
                )}
              </motion.div>

              {/* Desktop: "All taken" alert if needed */}
              {availableLines.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 1.2 }}
                  className="hidden md:block mt-4"
                >
                  <Alert className="bg-red-900/50 border-red-800 !text-[#F7EAD9]">
                    <HugeiconsIcon icon={AlertCircleIcon} size={20} />
                    <AlertDescription className="text-[#F7EAD9] font-jejuhallasan text-lg">
                      ALL CLASSES FOR THIS PARTY ARE TAKEN!
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </motion.div>

            {/* Team Members */}
            <AnimatePresence>
              {teamMembers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                  className="w-full max-w-2xl parchment-bg parchment-border rounded-lg overflow-hidden mb-8 p-6"
                >
                  <h4 className="text-2xl font-jejuhallasan text-parchment-ink mb-4">
                    Current Team Members
                  </h4>
                  <div className="space-y-3">
                    {teamMembers.map((member, index) => {
                      const hero = CONSTANTS.HEROES.find(
                        (h) => h.id === member.hero_id,
                      );

                      return (
                        <motion.div
                          key={member.line_number}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 1.3 + index * 0.1 }}
                          className="flex items-center"
                        >
                          <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border border-parchment-dark">
                            <img
                              src={hero ? getHeroIcon(hero.id) : "/placeholder.svg"}
                              alt={hero?.name || "Class"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-parchment-ink">
                              {hero?.name}
                            </p>
                            <p className="text-xs text-parchment-ink/50">
                              {member.instagram_handle || "Unknown Class"}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* No Team Members */}
              {teamMembers.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                  className="w-full max-w-2xl parchment-bg parchment-border rounded-lg overflow-hidden mb-8 p-6 text-center"
                >
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.3 }}
                  >
                    <HugeiconsIcon icon={UserGroupIcon} size={48} className="text-parchment-ink/40 mx-auto mb-3" />
                  </motion.div>
                  <h4 className="text-2xl font-jejuhallasan text-parchment-ink mb-2">
                    No Team Members Yet
                  </h4>
                  <p className="text-parchment-ink/60 text-sm">Be the first to join this team!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      )}
    </>
  );
}
