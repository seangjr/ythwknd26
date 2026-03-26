"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon, Copy01Icon, Loading03Icon, Share01Icon } from "@hugeicons/core-free-icons";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface TeamInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: number;
  teamName: string;
  teamColor: string;
}

export function TeamInviteModal({
  isOpen,
  onClose,
  teamId,
  teamName,
  teamColor,
}: TeamInviteModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingInvite, setExistingInvite] = useState<string | null>(null);

  // Check for existing invite when modal opens
  useEffect(() => {
    if (isOpen && teamId) {
      checkExistingInvite();
    }
  }, [isOpen, teamId]);

  // Check if there's an existing invite for this team
  const checkExistingInvite = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/team-invite/check?teamId=${teamId}`);

      if (response.ok) {
        const data = await response.json();
        if (data.inviteUrl) {
          const baseUrl = window.location.origin;
          const fullInviteUrl = `${baseUrl}/invite/${data.inviteCode}`;
          setInviteLink(fullInviteUrl);
          setExistingInvite(fullInviteUrl);
        }
      }
    } catch (error) {
      console.error("Error checking existing invite:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate invite link
  const generateInviteLink = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/team-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teamId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate invite link");
      }

      const data = await response.json();
      const baseUrl = window.location.origin;
      const fullInviteUrl = `${baseUrl}/invite/${data.inviteCode}`;
      setInviteLink(fullInviteUrl);
      setExistingInvite(fullInviteUrl);
    } catch (error) {
      console.error("Error generating invite link:", error);
      setError("Failed to generate invite link. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy invite link to clipboard
  const copyInviteLink = () => {
    if (inviteLink) {
      const message = `Join my team "${teamName}" for YTHWKND! Click the link to register:\n${inviteLink}`;
      navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success("Invite link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Share invite link (for mobile)
  const shareInviteLink = async () => {
    if (inviteLink && navigator.share) {
      try {
        await navigator.share({
          title: `Join ${teamName} in YTHWKND`,
          text: `Join my team "${teamName}" for YTHWKND! Click the link to register:`,
          url: inviteLink,
        });
        toast.success("Invite link shared successfully!");
      } catch (error) {
        console.error("Error sharing:", error);
        toast.error("Failed to share invite link");
      }
    } else {
      copyInviteLink();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {/* <div
            className={`h-2 ${teamColor} rounded-t-lg -mt-6 -mx-6 mb-4`}
          ></div> */}
          <DialogTitle className="text-2xl text-center">
            Invite Friends to {teamName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-center text-parchment-ink/60">
            Generate a link to invite your friends to join your team. They'll be
            able to register for an available line in this universe.
          </p>

          {error && (
            <Alert className="bg-red-900 border-red-800">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isGenerating ? (
            <div className="flex justify-center py-4">
              <HugeiconsIcon icon={Loading03Icon} size={32} className="animate-spin text-parchment-accent" />
            </div>
          ) : inviteLink ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="bg-parchment-darker/20 border-parchment-dark text-parchment-ink flex-1"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={copyInviteLink}
                  className="cursor-pointer bg-transparent border-parchment-dark text-parchment-ink hover:bg-parchment-dark/20"
                >
                  {copied ? (
                    <HugeiconsIcon icon={Tick02Icon} size={16} />
                  ) : (
                    <HugeiconsIcon icon={Copy01Icon} size={16} />
                  )}
                </Button>
              </div>

              <div className="flex flex-col space-y-2">
                <Button
                  onClick={shareInviteLink}
                  variant="parchment" size="xl"
                  disabled={!inviteLink}
                >
                  <HugeiconsIcon icon={Share01Icon} size={16} className="mr-2" />
                  Share Link
                </Button>
                <Button
                  onClick={generateInviteLink}
                  variant="parchment-outline" size="xl" className="cursor-pointer"
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating..." : "Generate New Link"}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={generateInviteLink}
              variant="parchment" size="xl"
              disabled={isGenerating}
            >
              {isGenerating
                ? "Generating..."
                : existingInvite
                  ? "Show Invite Link"
                  : "Generate Invite Link"}
            </Button>
          )}
        </div>

        {/* <DialogFooter>
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full bg-transparent border-gray-700 text-[#F7EAD9] hover:bg-gray-800"
          >
            Close
          </Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
