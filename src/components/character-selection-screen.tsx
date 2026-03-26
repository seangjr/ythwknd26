"use client";

import { Button } from "@/components/ui/button";
import { CONSTANTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft02Icon, Facebook01Icon, GlobeIcon, InstagramIcon } from "@hugeicons/core-free-icons";
import { useEffect, useState } from "react";
import Navbar from "./navbar";
import { motion, AnimatePresence } from "framer-motion";

interface CharacterSelectionScreenProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: number;
  preselectedHero?: string;
  onConfirm: (heroId: string) => void;
  lineNumber: number;
}

interface TeamMember {
  instagram_handle?: string;
  hero_id: string;
  line_number: number;
}

const getHeroIcon = (heroId: string) => {
  const heroObj = CONSTANTS.HEROES.find(h => h.id === heroId);
  return heroObj?.icon || "/placeholder.svg";
};

export function CharacterSelectionScreen({
  isOpen,
  onClose,
  teamId,
  preselectedHero,
  onConfirm,
  lineNumber,
}: CharacterSelectionScreenProps) {
  const [selectedHero, setSelectedHero] = useState<string>(
    preselectedHero || "",
  );
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Get team details
  const team =
    CONSTANTS.TEAMS.find((t) => t.id === teamId) || CONSTANTS.TEAMS[0];

  // Fetch team members
  useEffect(() => {
    async function fetchTeamMembers() {
      if (!teamId) return;

      try {
        const res = await fetch(`/api/team-members?teamId=${teamId}`);
        if (!res.ok) throw new Error("Failed to fetch team members");
        const json = await res.json();
        const members: TeamMember[] = (json.members || []).map(
          (m: { instagram_handle?: string; hero_id: string; line_number: number }) => ({
            instagram_handle: m.instagram_handle,
            hero_id: m.hero_id,
            line_number: m.line_number,
          }),
        );
        setTeamMembers(members);
      } catch (error) {
        console.error("Error fetching team members:", error);
      } finally {
        setLoading(false);
      }
    }

    if (isOpen) {
      fetchTeamMembers();
    }
  }, [teamId, isOpen]);

  // Get hero details
  const getHeroDetails = (heroId: string) => {
    return CONSTANTS.HEROES.find((h) => h.id === heroId);
  };

  // Check if a hero is taken
  const isHeroTaken = (heroId: string) => {
    return teamMembers.some((member) => member.hero_id === heroId);
  };

  // Get hero status text
  const getHeroStatus = (heroId: string) => {
    if (heroId === selectedHero) return "YOUR SELECTION";

    const member = teamMembers.find((m) => m.hero_id === heroId);
    if (member)
      return member.instagram_handle ? `${member.instagram_handle}` : "TAKEN";

    return "CLASS AVAILABLE";
  };

  // Get hero status color
  const getHeroStatusColor = (heroId: string) => {
    if (heroId === selectedHero) return "text-amber-500";

    const member = teamMembers.find((m) => m.hero_id === heroId);
    if (member) return "text-parchment-ink/50";

    return "text-green-500";
  };

  // Update local state when preselectedHero changes
  useEffect(() => {
    if (preselectedHero) {
      setSelectedHero(preselectedHero);
    }
  }, [preselectedHero]);

  // Handle hero selection
  const handleHeroSelect = (heroId: string) => {
    if (isHeroTaken(heroId) && heroId !== selectedHero) return;
    setSelectedHero(heroId);
  };

  // Handle confirm button click
  const handleConfirm = () => {
    if (!selectedHero) return;
    onConfirm(selectedHero);
  };

  // Get selected hero details
  const selectedHeroDetails = getHeroDetails(selectedHero);

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 parchment-bg flex flex-col overflow-auto"
      data-lenis-prevent
    >
      {/* Header */}
      <Navbar variant="parchment" />

      {/* Back button */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="p-4"
      >
        <button
          onClick={onClose}
          className="flex cursor-pointer items-center text-parchment-ink/60 hover:text-parchment-ink transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft02Icon} size={16} className="mr-2" />
          <span>BACK</span>
        </button>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 px-4 pb-4 flex flex-col items-center text-parchment-ink">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 flex flex-col gap-4"
        >
          <h3 className="text-parchment-ink/60 uppercase text-sm">
            CLASS SELECTION
          </h3>
          <h2 className="text-6xl font-jetsytrial">CONFIRM CLASS</h2>
        </motion.div>

        <AnimatePresence mode="wait">
          {selectedHeroDetails && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md bg-parchment-darker/15 rounded-lg p-6 mb-6 border border-parchment-dark"
            >
              <div className="flex flex-col items-center">
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-parchment-dark"
                >
                  <img
                    src={getHeroIcon(selectedHero)}
                    alt={selectedHeroDetails.name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                <motion.h3 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="text-4xl font-jetsytrial mb-6"
                >
                  {selectedHeroDetails.name}
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="text-sm w-full mb-6 uppercase text-center"
                >
                  {selectedHeroDetails.description}
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="w-full"
                >
                  <h4 className="text-xl font-jejuhallasan mb-2">CURRENT PARTY</h4>
                  <p className="text-sm mb-4 uppercase">
                    {team.code} {team.name}
                  </p>

                  <div className="space-y-3">
                    {loading
                      ? Array.from({ length: 5 }).map((_, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                            className="flex items-center p-2 rounded-lg"
                          >
                            <div className="w-6 mr-3">
                              <div className="h-4 w-4 rounded bg-parchment-dark/30 animate-pulse" />
                            </div>
                            <div className="w-10 h-10 rounded-full mr-3 bg-parchment-dark/30 animate-pulse" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 w-24 rounded bg-parchment-dark/30 animate-pulse" />
                              <div className="h-3 w-32 rounded bg-parchment-dark/20 animate-pulse" />
                            </div>
                          </motion.div>
                        ))
                      : CONSTANTS.HEROES.map((hero, index) => {
                          const isSelected = hero.id === selectedHero;
                          const isTaken = isHeroTaken(hero.id);
                          const statusText = getHeroStatus(hero.id);
                          const statusColor = getHeroStatusColor(hero.id);

                          return (
                            <motion.div
                              key={hero.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                              whileHover={!isTaken || isSelected ? { scale: 1.02 } : {}}
                              className={cn(
                                "cursor-pointer flex items-center p-2 rounded-lg transition-all",
                                isSelected ? "bg-parchment-darker/20" : "hover:bg-parchment-darker/20",
                                isTaken && !isSelected && "opacity-70 cursor-not-allowed",
                              )}
                              onClick={() => handleHeroSelect(hero.id)}
                            >
                              <div className="w-6 mr-3 text-parchment-ink/50">
                                {index + 1}
                              </div>
                              <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                                <img
                                  src={getHeroIcon(hero.id)}
                                  alt={hero.name}
                                  className={cn(
                                    "w-full h-full object-cover",
                                    isTaken && !isSelected && "grayscale",
                                  )}
                                />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium uppercase">{hero.name}</p>
                                <p className={cn("text-sm", statusColor)}>
                                  {statusText}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={handleConfirm}
            disabled={!selectedHero}
            variant="parchment" size="2xl" className="w-full cursor-pointer max-w-md"
          >
            Confirm Class
          </Button>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="p-4 text-center text-parchment-ink/40"
      >
        <div className="flex justify-center space-x-4 mb-2">
          <motion.a 
            whileHover={{ scale: 1.1 }}
            href="#" 
            className="text-parchment-ink/40 hover:text-parchment-ink"
          >
            <HugeiconsIcon icon={GlobeIcon} size={20} />
          </motion.a>
          <motion.a 
            whileHover={{ scale: 1.1 }}
            href="#" 
            className="text-parchment-ink/40 hover:text-parchment-ink"
          >
            <HugeiconsIcon icon={InstagramIcon} size={20} />
          </motion.a>
          <motion.a 
            whileHover={{ scale: 1.1 }}
            href="#" 
            className="text-parchment-ink/40 hover:text-parchment-ink"
          >
            <HugeiconsIcon icon={Facebook01Icon} size={20} />
          </motion.a>
        </div>
        <p className="text-sm">{CONSTANTS.SITE_DESCRIPTION}</p>
      </motion.footer>
    </motion.div>
  );
}
