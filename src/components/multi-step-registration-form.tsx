"use client";

import { TeamMembersSubscription } from "@/components/team-members-subscription";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CONSTANTS } from "@/lib/constants";
import { getRelativeTimeString } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon as AlertCircle,
  ArrowLeft02Icon as ArrowLeft,
  Facebook01Icon as Facebook,
  GlobeIcon as Globe,
  InstagramIcon as Instagram,
  Link01Icon as LinkIcon,
} from "@hugeicons/core-free-icons";
import { usePageTransition } from "./page-transition";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Navbar from "./navbar";
import { toast } from "sonner";
import { Footer } from "./footer";
import { motion, AnimatePresence } from "framer-motion";

const stepVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -60 : 60, opacity: 0 }),
};
import Image from "next/image";
import Link from "next/link";

const getHeroIcon = (heroId: string) => {
  const heroObj = CONSTANTS.HEROES.find(h => h.id === heroId);
  return heroObj?.icon || "/placeholder.svg";
};

// Form schema
const formSchema = z
  .object({
    // Personal Details
    email: z.string().email({ message: "Please enter a valid email address" }),
    fullName: z.string().min(2, { message: "Full name is required" }),
    age: z
      .string()
      .refine((val) => ["13", "14", "15", "16", "17"].includes(val), {
        message: "Please select a valid age between 13-17",
      }),
    gender: z.enum(["Male", "Female"], {
      required_error: "Please select your gender",
    }),
    nricPassport: z
      .string()
      .min(5, { message: "NRIC/Passport number is required" }),
    contactNumber: z
      .string()
      .min(8, { message: "Valid contact number is required" }),
    instagramHandle: z
      .string()
      .optional()
      .refine((val) => !val || val.startsWith("@"), {
        message: "Instagram handle must start with '@'",
      }),
    schoolName: z.string().min(2, { message: "School name is required" }),
    ymMember: z.enum(["Yes", "No"], {
      required_error: "Please select if you are a YM member",
    }),

    // CG Details
    cgLeader: z.string().optional(),

    // More Details (Religious Affiliation)
    isChristian: z
      .enum(["attending_other", "not_attending", "no", "attending_ym"], {
        required_error: "Please select your religious affiliation",
      })
      .optional(),
    eventSource: z
      .enum(["ym_services", "friend", "social_media", "school", "other"], {
        required_error: "Please select how you heard about this event",
      })
      .optional(),
    otherEventSource: z.string().optional(),
    invitedByFriend: z.string().optional(),

    // Emergency Contact
    emergencyContactName: z
      .string()
      .min(2, { message: "Emergency contact name is required" }),
    emergencyContactRelationship: z
      .string()
      .min(1, { message: "Please select or specify the relationship" }),
    emergencyContactPhone: z
      .string()
      .min(8, { message: "Valid phone number is required" }),
    emergencyContactEmail: z
      .string()
      .email({ message: "Valid email is required" }),
    // nickname: z.string().min(1, { message: "Nickname is required" }),
    otherRelationship: z.string().optional(),
  })
  .refine(
    (data) => {
      // If user is a YM member, CG leader is required
      if (data.ymMember === "Yes") {
        return !!data.cgLeader;
      }
      // If not a YM member, CG leader is not required
      return true;
    },
    {
      message: "CG Leader is required for YM members",
      path: ["cgLeader"],
    },
  )
  .refine(
    (data) => {
      // If event source is "other", otherEventSource is required
      if (data.eventSource === "other") {
        return !!data.otherEventSource;
      }
      return true;
    },
    {
      message: "Please specify how you heard about this event",
      path: ["otherEventSource"],
    },
  );
// .refine(
//   (data) => {
//     // If user is a Christian attending another church, church details are required
//     if (data.isChristian === "attending_other") {
//       return !!data.churchName && !!data.pastorName && !!data.churchRole;
//     }
//     return true;
//   },
//   {
//     message: "Church details are required",
//     path: ["churchName"],
//   },
// );

type FormValues = z.infer<typeof formSchema>;

// Hero status types
type HeroStatus = "available" | "selected" | "taken";

// Hero with status information
type Hero = (typeof CONSTANTS.HEROES)[0];
interface HeroWithStatus extends Hero {
  status: HeroStatus;
  takenBy?: string;
  lineNumber?: number;
}

interface MultiStepRegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
  lineNumber: number;
  teamId: number;
  inviteCode?: string;
  selectedHero: string;
  onSubmit: (data: FormValues) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
  onBackToCharacterSelection: () => void; // New prop
}

export function MultiStepRegistrationForm({
  isOpen,
  onClose,
  lineNumber,
  teamId,
  inviteCode,
  selectedHero,
  onSubmit,
  isSubmitting,
  error,
  onBackToCharacterSelection,
}: MultiStepRegistrationFormProps) {
  const { navigateTo } = usePageTransition();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteLinkLoading, setInviteLinkLoading] = useState(false);
  const [inviteLinkError, setInviteLinkError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [otherRelationship, setOtherRelationship] = useState(false);
  const [otherEventSourceSelected, setOtherEventSourceSelected] =
    useState(false);
  const [registrationUnavailable, setRegistrationUnavailable] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [teamMembersLoading, setTeamMembersLoading] = useState(false);
  const [heroesRefreshing, setHeroesRefreshing] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      fullName: "",
      age: "",
      gender: undefined,
      nricPassport: "",
      contactNumber: "",
      instagramHandle: "",
      schoolName: "",
      ymMember: undefined,
      cgLeader: "",
      isChristian: undefined,
      eventSource: undefined,
      otherEventSource: "",
      invitedByFriend: "",
      // churchName: "",
      // pastorName: "",
      // churchRole: "",
      emergencyContactName: "",
      emergencyContactRelationship: "",
      emergencyContactPhone: "",
      emergencyContactEmail: "",
      // nickname: fullName.,
      otherRelationship: "",
    },
  });

  const watchYmMember = form.watch("ymMember");
  const watchGender = form.watch("gender");
  const watchRelationship = form.watch("emergencyContactRelationship");
  const watchIsChristian = form.watch("isChristian");
  const watchEventSource = form.watch("eventSource");

  // Fetch team members when component mounts
  useEffect(() => {
    if (isOpen && teamId) {
      fetchTeamMembers();
    }
  }, [isOpen, teamId]);

  // Handle YM Member changes
  useEffect(() => {
    if (watchYmMember === "No") {
      form.setValue("cgLeader", "N/A");
    } else if (watchYmMember === "Yes") {
      // Only reset if the current value is N/A
      if (form.getValues("cgLeader") === "N/A") {
        form.setValue("cgLeader", "");
      }
    }
  }, [watchYmMember, form]);

  useEffect(() => {
    // Force re-render of the RadioGroup when on step 2
    if (step === 2) {
      const currentValue = form.getValues("cgLeader");
      // This will trigger a re-render of the RadioGroup
      form.setValue("cgLeader", currentValue, { shouldValidate: false });
    }
  }, [step, form]);

  // Handle event source changes
  useEffect(() => {
    setOtherEventSourceSelected(watchEventSource === "other");
  }, [watchEventSource]);

  // Get hero details
  const getHeroDetails = () => {
    return CONSTANTS.HEROES.find((h) => h.id === selectedHero);
  };

  const heroDetails = getHeroDetails();
  const team = CONSTANTS.TEAMS.find((t) => t.id === teamId);

  // Generate team invite link
  const generateTeamInviteLink = async () => {
    setInviteLinkLoading(true);
    setInviteLinkError(null);

    try {
      const response = await fetch("/api/team-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamId: teamId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate invite link");
      }

      const data = await response.json();
      const baseUrl = window.location.origin;
      const fullInviteUrl = `${baseUrl}/invite/${data.inviteCode}`;
      setInviteLink(fullInviteUrl);
    } catch (error) {
      console.error("Error generating team invite link:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate invite link";
      setInviteLinkError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setInviteLinkLoading(false);
    }
  };

  // Fetch team members
  const fetchTeamMembers = async () => {
    setTeamMembersLoading(true);
    try {
      const response = await fetch(`/api/team-members?teamId=${teamId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch team members");
      }

      const data = await response.json();
      setTeamMembers(data.members || []);
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast.error(error instanceof Error ? error.message : "Failed to fetch team members");
    } finally {
      setTeamMembersLoading(false);
    }
  };

  // Refresh heroes data
  const refreshHeroesData = async () => {
    setHeroesRefreshing(true);
    try {
      await fetchTeamMembers();
    } finally {
      setHeroesRefreshing(false);
    }
  };

  // Process heroes with status information
  const heroesWithStatus = useMemo((): HeroWithStatus[] => {
    if (teamMembersLoading) return [];

    return CONSTANTS.HEROES.map((hero) => {
      // Find if this hero is taken by any team member
      const takenBy = teamMembers.find((member) => member.hero_id === hero.id);

      let status: HeroStatus = "available";

      if (takenBy) {
        // If this is the current user's hero
        if (takenBy.line_number === lineNumber) {
          status = "selected";
        } else {
          status = "taken";
        }
      }

      return {
        ...hero,
        status,
        takenBy: takenBy?.nickname,
        lineNumber: takenBy?.line_number,
      };
    });
  }, [teamMembers, teamMembersLoading, lineNumber]);

  // Sort heroes by status: selected first, then available, then taken
  const sortedHeroes = useMemo(() => {
    return [...heroesWithStatus].sort((a, b) => {
      // Custom sort order: selected, available, taken
      const statusOrder = { selected: 0, available: 1, taken: 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  }, [heroesWithStatus]);

  // Get available heroes count
  const availableHeroesCount = useMemo(() => {
    return heroesWithStatus.filter((hero) => hero.status === "available")
      .length;
  }, [heroesWithStatus]);

  // Handle form submission
  const handleFormSubmit = async (data: FormValues) => {
    // For YM members, set default values for fields they skip
    if (data.ymMember === "Yes") {
      // YM members are already known to be Christians attending YM
      //@ts-ignore
      data.isChristian = "attending_ym";
      data.eventSource = "ym_services";
    }

    // Check if registration should be blocked
    if (data.ymMember === "No" && data.isChristian === "attending_other") {
      setRegistrationUnavailable(true);
      return;
    }

    try {
      await onSubmit(data);
      // Only proceed with success flow if onSubmit succeeds
      setRegistrationComplete(true);
      generateTeamInviteLink();
      fetchTeamMembers();
    } catch (error) {
      setStep(1);
      setRegistrationComplete(false); // Ensure we don't show success page
      console.error("Form submission error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit registration. Please try again.");
    }
  };

  // Handle next step
  const handleNext = async () => {
    setDirection(1);
    let isValid = false;

    if (step === 1) {
      isValid = await form.trigger([
        "email",
        "fullName",
        "age",
        "gender",
        "nricPassport",
        "contactNumber",
        "instagramHandle",
        "schoolName",
        "ymMember",
        // "nickname",
      ]);

      if (isValid) {
        // If user is a YM member, go to CG Details
        // If not a YM member, go to More Details
        setStep(watchYmMember === "Yes" ? 2 : 3);
      }
    } else if (step === 2) {
      isValid = await form.trigger(["cgLeader"]);

      if (isValid) {
        // If user is a YM member, skip directly to Emergency Contact (step 5)
        setStep(5);
      }
    } else if (step === 3 && watchYmMember === "No") {
      isValid = await form.trigger([
        "isChristian",
        "eventSource",
        "otherEventSource",
        "invitedByFriend",
      ]);

      // If the user is a Christian attending another church, show church details step
      if (isValid && watchIsChristian === "attending_other") {
        setRegistrationUnavailable(true);
        return;
      }

      if (isValid) {
        setStep(5); // Go to Emergency Contact
      }
    } else if (step === 4) {
      if (isValid) {
        setStep(5); // Go to Emergency Contact
      }
    }
  };

  // Handle back
  const handleBack = () => {
    setDirection(-1);
    if (registrationComplete) {
      // Refresh team members data before closing
      fetchTeamMembers();
      onClose();
      return;
    }

    if (step > 1) {
      // If we're on step 5 (Emergency Contact) and user is a YM member
      if (step === 5 && watchYmMember === "Yes") {
        setStep(2); // Go back to CG Details, skipping More Details
      }
      // If we're on step 5 (Emergency Contact) and user is not a YM member and is a Christian attending another church
      else if (
        step === 5 &&
        watchYmMember === "No" &&
        watchIsChristian === "attending_other"
      ) {
        setRegistrationUnavailable(true);
      }
      // If we're on step 5 (Emergency Contact) and user is not a YM member
      else if (step === 5 && watchYmMember === "No") {
        setStep(3); // Go back to More Details
      }
      // If we're on step 3 (More Details) and user is not a YM member
      else if (step === 3 && watchYmMember === "No") {
        setStep(1); // Go back to Personal Details
      } else {
        setStep(step - 1);
      }
    } else {
      onClose();
    }
  };

  // Handle relationship change
  const handleRelationshipChange = (value: string) => {
    if (value === "Other") {
      setOtherRelationship(true);
      form.setValue("emergencyContactRelationship", "");
    } else {
      setOtherRelationship(false);
      form.setValue("emergencyContactRelationship", value);
    }
  };

  // Copy invite link
  const copyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Invite link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Regenerate invite link
  const handleRegenerateInviteLink = () => {
    generateTeamInviteLink();
  };

  // Return to main page
  const handleReturnToMain = () => {
    navigateTo("/");
    onClose();
  };

  const takenByHeroId = new Map(
    teamMembers.map((member) => [member.hero_id, member]),
  );

  if (!isOpen) return null;

  // Registration Unavailable Screen
  if (registrationUnavailable) {
    return (
      <div className="fixed inset-0 z-50 parchment-bg flex flex-col overflow-auto text-parchment-ink" data-lenis-prevent>
        {/* Header */}
        <Navbar variant="parchment" />

        {/* Back button */}
        <div className="p-4">
          <button
            onClick={handleBack}
            className="cursor-pointer flex items-center text-parchment-ink/60 hover:text-parchment-ink transition-colors"
          >
            <HugeiconsIcon icon={ArrowLeft} size={16} className="mr-2" />
            <span>BACK</span>
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 px-4 pb-4 flex flex-col items-center max-w-md mx-auto w-full">
          <div className="text-center mb-6 flex flex-col gap-4">
            <h3 className="text-parchment-ink/60 uppercase text-sm">
              REGISTRATION UNAVAILABLE
            </h3>
            <h2 className="text-6xl font-jetsytrial">We&apos;re Sorry</h2>

            <p className="text-parchment-ink mb-2">
              THANK YOU FOR YOUR INTEREST IN JOINING OUR EVENT.
            </p>

            <p className="text-parchment-ink mb-2">
              WE REGRET TO INFORM YOU THAT WE&apos;RE UNABLE TO PROCEED WITH
              YOUR SUBMISSION BECAUSE THIS IS AN EVANGELISTIC CAMP AND
              WE&apos;RE ENCOURAGING OUR YMFGAKL MEMBERS TO REACH OUT TO THEIR
              FRIENDS WHO ARE NOT YET CHRISTIANS OR ARE NOT ATTENDING ANY CHURCH
              TO HAVE THE CHANCE TO ENCOUNTER CHRIST.
            </p>

            <p className="text-parchment-ink mb-2">
              PLEASE REACH OUT TO YOUR FRIEND FROM YMFGAKL IF THERE&apos;S ANY
              CONFIRMATION REQUIRED OR CONTACT US THROUGH OUR SOCIAL MEDIA.
            </p>

            <p className="text-parchment-ink mb-2">
              THANK YOU FOR YOUR UNDERSTANDING.
            </p>

            <Button
              onClick={handleReturnToMain}
              variant="parchment" size="xl" className="w-full"
            >
              RETURN TO MAIN PAGE
            </Button>
          </div>
        </div>

        {/* Footer */}
        <Footer variant="parchment" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 parchment-bg flex flex-col overflow-auto py-6 text-parchment-ink" data-lenis-prevent>
      {/* Header */}
      <Navbar variant="parchment" />

      {/* Back / Home button */}
      <div className="p-4">
        {registrationComplete ? (
          <a
            href="https://ymfgakl.com/ythwknd"
            className="cursor-pointer flex items-center text-parchment-ink/60 hover:text-parchment-ink transition-colors"
          >
            <span>HOME</span>
          </a>
        ) : (
          <button
            onClick={handleBack}
            className="cursor-pointer flex items-center text-parchment-ink/60 hover:text-parchment-ink transition-colors"
          >
            <HugeiconsIcon icon={ArrowLeft} size={16} className="mr-2" />
            <span>BACK</span>
          </button>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 px-4 pb-4 flex flex-col items-center max-w-md mx-auto w-full">
        {!registrationComplete ? (
          <>
            <div className="text-center mb-6 flex flex-col gap-4">
              <h3 className="text-parchment-ink/60 uppercase text-sm">
                REGISTRATION FORM
              </h3>
              <AnimatePresence mode="wait" custom={direction}>
                {step === 1 && (
                  <motion.h2 key="step-1-title" custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="text-6xl font-jetsytrial">PERSONAL DETAILS</motion.h2>
                )}
                {step === 2 && (
                  <motion.h2 key="step-2-title" custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="text-6xl font-jetsytrial">CG DETAILS</motion.h2>
                )}
                {step === 3 && (
                  <motion.h2 key="step-3-title" custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="text-6xl font-jetsytrial">MORE DETAILS</motion.h2>
                )}
                {step === 4 && (
                  <motion.h2 key="step-4-title" custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="text-6xl font-jetsytrial">CHURCH DETAILS</motion.h2>
                )}
                {step === 5 && (
                  <motion.h2 key="step-5-title" custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="text-6xl font-jetsytrial">EMERGENCY CONTACT</motion.h2>
                )}
              </AnimatePresence>
            </div>

            {/* {error && (
              <Alert className="bg-red-900 border-red-800 mb-4 w-full">
                <HugeiconsIcon icon={AlertCircle} size={16} />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )} */}

            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="w-full space-y-6"
            >
              <AnimatePresence mode="wait" custom={direction}>
              {/* Step 1: Personal Details */}
              {step === 1 && (
                <motion.div key="step-1" custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6 w-full">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-2xl uppercase font-jejuhallasan"
                    >
                      Email<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Your answer"
                      {...form.register("email")}
                    />
                    {form.formState.errors.email && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="fullName"
                      className="text-2xl uppercase font-jejuhallasan"
                    >
                      Full Name (as per IC/Passport)
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Your answer"
                      {...form.register("fullName")}
                    />
                    {form.formState.errors.fullName && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>

                  {/* Age */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="age"
                      className="text-2xl uppercase font-jejuhallasan"
                    >
                      Age (as of 2026)<span className="text-red-500">*</span>
                    </Label>
                    <p className="text-sm text-parchment-ink/50">
                      This camp is only open for ages 13 to 17. If you're above
                      18, do stay tuned for our campus camp!
                    </p>
                    <select
                      id="age"
                      {...form.register("age")}
                      className="w-full bg-transparent border-b border-parchment-dark rounded-none px-0 h-10 focus-visible:ring-0 focus-visible:border-parchment-darker text-parchment-ink"
                    >
                      <option
                        value=""
                        disabled
                        selected
                        className="bg-parchment-darker/10"
                      >
                        Choose answer
                      </option>
                      <option value="13" className="bg-parchment-darker/10">
                        13
                      </option>
                      <option value="14" className="bg-parchment-darker/10">
                        14
                      </option>
                      <option value="15" className="bg-parchment-darker/10">
                        15
                      </option>
                      <option value="16" className="bg-parchment-darker/10">
                        16
                      </option>
                      <option value="17" className="bg-parchment-darker/10">
                        17
                      </option>
                    </select>{" "}
                    {form.formState.errors.age && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.age.message}
                      </p>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <Label className="text-2xl uppercase font-jejuhallasan">
                      Gender<span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup
                      value={watchGender}
                      onValueChange={(value) =>
                        form.setValue("gender", value as "Male" | "Female")
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="Male"
                          id="gender-male"
                          className="border-white"
                        />
                        <Label htmlFor="gender-male" className="text-parchment-ink">
                          Male
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="Female"
                          id="gender-female"
                          className="border-white"
                        />
                        <Label htmlFor="gender-female" className="text-parchment-ink">
                          Female
                        </Label>
                      </div>
                    </RadioGroup>
                    {form.formState.errors.gender && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.gender.message}
                      </p>
                    )}
                  </div>

                  {/* NRIC/Passport */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="nricPassport"
                      className="text-2xl uppercase font-jejuhallasan"
                    >
                      NRIC/Passport Number
                      <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-sm text-parchment-ink/50">e.g. 123456-78-9000</p>
                    <Input
                      id="nricPassport"
                      type="text"
                      placeholder="Your answer"
                      {...form.register("nricPassport")}
                    />
                    {form.formState.errors.nricPassport && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.nricPassport.message}
                      </p>
                    )}
                  </div>

                  {/* Contact Number */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="contactNumber"
                      className="text-2xl uppercase font-jejuhallasan"
                    >
                      Contact Number<span className="text-red-500">*</span>
                    </Label>
                    <p className="text-sm text-parchment-ink/50">e.g. 60123456789</p>
                    <Input
                      id="contactNumber"
                      type="text"
                      placeholder="Your answer"
                      {...form.register("contactNumber")}
                    />
                    {form.formState.errors.contactNumber && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.contactNumber.message}
                      </p>
                    )}
                  </div>

                  {/* Instagram Handle */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="instagramHandle"
                      className="text-2xl uppercase font-jejuhallasan"
                    >
                      Instagram Handle
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="instagramHandle"
                      type="text"
                      placeholder="Your answer"
                      {...form.register("instagramHandle")}
                    />
                    {form.formState.errors.instagramHandle && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.instagramHandle.message}
                      </p>
                    )}
                  </div>

                  {/* School Name */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="schoolName"
                      className="text-2xl uppercase font-jejuhallasan"
                    >
                      School Name<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="schoolName"
                      type="text"
                      placeholder="Your answer"
                      {...form.register("schoolName")}
                    />
                    {form.formState.errors.schoolName && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.schoolName.message}
                      </p>
                    )}
                  </div>

                  {/* YM Member */}
                  <div className="space-y-2">
                    <Label className="text-2xl uppercase font-jejuhallasan">
                      Are you a YM Member?
                      <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup
                      value={watchYmMember}
                      onValueChange={(value) =>
                        form.setValue("ymMember", value as "Yes" | "No")
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="Yes"
                          id="ym-yes"
                          className="border-white !accent-white"
                        />
                        <Label htmlFor="ym-yes" className="text-parchment-ink">
                          Yes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="No"
                          id="ym-no"
                          className="border-white !accent-white"
                        />
                        <Label htmlFor="ym-no" className="text-parchment-ink">
                          No
                        </Label>
                      </div>
                    </RadioGroup>
                    {form.formState.errors.ymMember && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.ymMember.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={handleNext}
                    variant="parchment" size="xl" className="cursor-pointer w-full"
                  >
                    NEXT
                  </Button>
                </motion.div>
              )}

              {/* Step 2: CG Details */}
              {step === 2 && (
                <motion.div key="step-2" custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6 w-full">
                  {/* CG Leader */}
                  <div className="space-y-2">
                    <Label className="text-2xl uppercase font-jejuhallasan">
                      Select your CG Leader
                      <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-sm text-parchment-ink pb-2">
                      If you're not sure who your CG leader is, kindly select
                      "Not sure"
                    </p>

                    <RadioGroup
                      value={form.getValues("cgLeader")}
                      onValueChange={(value) => {
                        form.setValue("cgLeader", value, {
                          shouldValidate: true,
                        });
                        console.log("CG Leader selected:", value); // Add logging to debug
                      }}
                      disabled={watchYmMember === "No"}
                    >
                      {watchYmMember === "No" ? (
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="N/A"
                            id="cg-na"
                            className="border-parchment-dark"
                            checked
                          />
                          <Label htmlFor="cg-na" className="text-parchment-ink">
                            N/A
                          </Label>
                        </div>
                      ) : (
                        <>
                          {CONSTANTS.CG_LEADERS.map((leader) => (
                            <div
                              key={leader}
                              className="flex items-center space-x-2"
                              onClick={() => {
                                if (watchYmMember === "Yes") {
                                  form.setValue("cgLeader", leader, {
                                    shouldValidate: true,
                                  });
                                }
                              }}
                            >
                              {" "}
                              <RadioGroupItem
                                value={leader}
                                id={`cg-${leader.replace(/\s+/g, "-").toLowerCase()}`}
                                className="border-parchment-dark"
                              />
                              <Label
                                htmlFor={`cg-${leader.replace(/\s+/g, "-").toLowerCase()}`}
                                className="text-parchment-ink cursor-pointer"
                              >
                                {" "}
                                {leader}
                              </Label>
                            </div>
                          ))}
                          <div
                            className="flex items-center space-x-2"
                            onClick={() => {
                              if (watchYmMember === "Yes") {
                                form.setValue("cgLeader", "Not Sure", {
                                  shouldValidate: true,
                                });
                              }
                            }}
                          >
                            <RadioGroupItem
                              value="Not Sure"
                              id="cg-not-sure"
                              className="border-parchment-dark"
                            />
                            <Label
                              htmlFor="cg-not-sure"
                              className="text-parchment-ink cursor-pointer"
                            >
                              Not sure
                            </Label>
                          </div>
                        </>
                      )}
                    </RadioGroup>
                    {form.formState.errors.cgLeader && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.cgLeader.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={handleNext}
                    variant="parchment" size="xl" className="cursor-pointer w-full"
                  >
                    NEXT
                  </Button>
                </motion.div>
              )}

              {/* Step 3: More Details */}
              {step === 3 && (
                <motion.div key="step-3" custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6 w-full">
                  {/* Religious Affiliation */}
                  <div className="space-y-2">
                    <Label className="text-2xl uppercase font-jejuhallasan">
                      Are you a Christian?
                      <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup
                      value={watchIsChristian}
                      onValueChange={(value) =>
                        form.setValue(
                          "isChristian",
                          value as "attending_other" | "not_attending" | "no",
                        )
                      }
                      className="space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="attending_other"
                          id="christian-attending"
                          className="border-parchment-dark"
                        />
                        <Label
                          htmlFor="christian-attending"
                          className="text-parchment-ink"
                        >
                          Yes, I'm actively attending another church
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="not_attending"
                          id="christian-not-attending"
                          className="border-parchment-dark"
                        />
                        <Label
                          htmlFor="christian-not-attending"
                          className="text-parchment-ink"
                        >
                          Yes, but I'm not attending any church
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="no"
                          id="not-christian"
                          className="border-parchment-dark"
                        />
                        <Label
                          htmlFor="not-christian"
                          className="text-parchment-ink"
                        >
                          No
                        </Label>
                      </div>
                    </RadioGroup>
                    {form.formState.errors.isChristian && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.isChristian.message}
                      </p>
                    )}
                  </div>

                  {/* Event Source */}
                  <div className="space-y-2">
                    <Label className="text-2xl uppercase font-jejuhallasan">
                      Where did you hear about this event?
                      <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup
                      value={watchEventSource}
                      onValueChange={(value) =>
                        form.setValue(
                          "eventSource",
                          value as
                            | "ym_services"
                            | "friend"
                            | "social_media"
                            | "school"
                            | "other",
                        )
                      }
                      className="space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="ym_services"
                          id="source-ym"
                          className="border-parchment-dark"
                        />
                        <Label htmlFor="source-ym" className="text-parchment-ink">
                          YM Sunday Services
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="friend"
                          id="source-friend"
                          className="border-parchment-dark"
                        />
                        <Label
                          htmlFor="source-friend"
                          className="text-parchment-ink"
                        >
                          A friend who attends YMFGAKL
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="social_media"
                          id="source-social"
                          className="border-parchment-dark"
                        />
                        <Label
                          htmlFor="source-social"
                          className="text-parchment-ink"
                        >
                          Social media (e.g. Instagram, Facebook)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="school"
                          id="source-school"
                          className="border-parchment-dark"
                        />
                        <Label
                          htmlFor="source-school"
                          className="text-parchment-ink"
                        >
                          Announcements at school event/chapel/CF
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="other"
                          id="source-other"
                          className="border-parchment-dark"
                        />
                        <Label
                          htmlFor="source-other"
                          className="text-parchment-ink"
                        >
                          Other:
                        </Label>
                      </div>
                    </RadioGroup>
                    {otherEventSourceSelected && (
                      <Input
                        id="otherEventSource"
                        type="text"
                        placeholder="Your answer"
                        {...form.register("otherEventSource")}
                        className="bg-transparent border-b border-parchment-dark rounded-none px-0 h-10 focus-visible:ring-0 focus-visible:border-parchment-darker text-parchment-ink mt-2"
                      />
                    )}
                    {form.formState.errors.eventSource && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.eventSource.message}
                      </p>
                    )}
                    {form.formState.errors.otherEventSource && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.otherEventSource.message}
                      </p>
                    )}
                  </div>

                  {/* Friend who invited */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="invitedByFriend"
                      className="text-2xl uppercase font-jejuhallasan"
                    >
                      Name of the friend who invited you
                      <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-sm text-parchment-ink/50">
                      If not applicable, put "N/A"
                    </p>
                    <Input
                      id="invitedByFriend"
                      type="text"
                      placeholder="Your answer"
                      {...form.register("invitedByFriend")}
                    />
                    {form.formState.errors.invitedByFriend && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.invitedByFriend.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={handleNext}
                    variant="parchment" size="xl" className="w-full"
                  >
                    NEXT
                  </Button>
                </motion.div>
              )}

              {/* Step 4: Church Details (for Christians attending other churches) */}
              {step === 4 && (
                <motion.div key="step-4" custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6 w-full">
                  <Button
                    type="button"
                    onClick={handleNext}
                    variant="parchment" size="xl" className="w-full"
                  >
                    NEXT
                  </Button>
                </motion.div>
              )}

              {/* Step 5: Emergency Contact */}
              {step === 5 && (
                <motion.div key="step-5" custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6 w-full">
                  {/* Emergency Contact Name */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="emergencyContactName"
                      className="text-2xl uppercase font-jejuhallasan"
                    >
                      Emergency Contact's Name
                      <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-sm text-parchment-ink/50">
                      In the event of any emergencies (touch wood), this is who
                      we will be contacting.
                    </p>
                    <Input
                      id="emergencyContactName"
                      type="text"
                      placeholder="Your answer"
                      {...form.register("emergencyContactName")}
                    />
                    {form.formState.errors.emergencyContactName && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.emergencyContactName.message}
                      </p>
                    )}
                  </div>

                  {/* Emergency Contact Relationship */}
                  <div className="space-y-2">
                    <Label className="text-2xl uppercase font-jejuhallasan">
                      Relationship with Emergency Contact
                      <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup
                      value={watchRelationship}
                      onValueChange={handleRelationshipChange}
                      className="space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="Father"
                          id="rel-father"
                          className="border-parchment-dark"
                        />
                        <Label htmlFor="rel-father" className="text-parchment-ink">
                          Father
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="Mother"
                          id="rel-mother"
                          className="border-parchment-dark"
                        />
                        <Label htmlFor="rel-mother" className="text-parchment-ink">
                          Mother
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="Legal Guardian"
                          id="rel-guardian"
                          className="border-parchment-dark"
                        />
                        <Label htmlFor="rel-guardian" className="text-parchment-ink">
                          Legal Guardian
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="Other"
                          id="rel-other"
                          className="border-parchment-dark"
                        />
                        <Label htmlFor="rel-other" className="text-parchment-ink">
                          Other:
                        </Label>
                      </div>
                    </RadioGroup>

                    {otherRelationship && (
                      <Input
                        id="otherRelationship"
                        type="text"
                        placeholder="Your answer"
                        {...form.register("otherRelationship")}
                        onChange={(e) =>
                          form.setValue(
                            "emergencyContactRelationship",
                            e.target.value,
                          )
                        }
                      />
                    )}

                    {form.formState.errors.emergencyContactRelationship && (
                      <p className="text-red-500 text-sm">
                        {
                          form.formState.errors.emergencyContactRelationship
                            .message
                        }
                      </p>
                    )}
                  </div>

                  {/* Emergency Contact Number */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="emergencyContactPhone"
                      className="text-2xl uppercase font-jejuhallasan"
                    >
                      Emergency Contact Number
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="emergencyContactPhone"
                      type="text"
                      placeholder="Your answer"
                      {...form.register("emergencyContactPhone")}
                    />
                    {form.formState.errors.emergencyContactPhone && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.emergencyContactPhone.message}
                      </p>
                    )}
                  </div>

                  {/* Emergency Contact Email */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="emergencyContactEmail"
                      className="text-2xl uppercase font-jejuhallasan"
                    >
                      Emergency Contact Email
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="emergencyContactEmail"
                      type="email"
                      placeholder="Your answer"
                      {...form.register("emergencyContactEmail")}
                    />
                    {form.formState.errors.emergencyContactEmail && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.emergencyContactEmail.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    variant="parchment" size="xl" className="cursor-pointer w-full"
                  >
                    {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
                  </Button>
                </motion.div>
              )}
              </AnimatePresence>
            </form>
          </>
        ) : (
          // Registration Complete Screen
          <div className="w-full space-y-8">
            <div className="text-center">
              <h3 className="text-parchment-ink/60 uppercase text-sm pb-4">
                REGISTRATION COMPLETE
              </h3>
              <h2 
                className="text-6xl font-jetsytrial text-parchment-ink mb-6"
              >
                See You At Camp
              </h2>
              <p 
                className="text-parchment-ink mb-6"
              >
                PLEASE KEEP AN EYE ON YOUR INBOX — WE&apos;LL BE SENDING YOU THE
                PAYMENT DETAILS AND THE PARENTAL CONSENT FORM TO SECURE YOUR
                SPOT IN CAMP.
              </p>
              <p 
                className="text-parchment-ink mb-8"
              >
                IN THE MEANTIME, STAY CONNECTED WITH US THROUGH OUR SOCIALS FOR
                THE LATEST UPDATES!
              </p>

              {watchYmMember === "Yes" && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button asChild variant="parchment" size="2xl" className="w-full mb-8 cursor-pointer text-center whitespace-normal">
                  <a 
                    href="https://forms.gle/CqWSGJLUURyjaxbNA" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Payment &amp; Parental Consent Form
                  </a>
                </Button>
              </motion.div>
              )}
            </div>

            {/* Hero and Team Info */}
            <div 
              className="bg-parchment-darker/15 border border-parchment-dark rounded-lg p-6 mb-6"
            >
              <h3 
                className="text-2xl font-jejuhallasan text-parchment-ink mb-4"
              >
                Your Hero
              </h3>
              <div 
                className="flex items-center mb-6"
              >
                <div 
                  className="relative w-12 h-12 rounded-full overflow-hidden mr-3"
                >
                  <Image
                    src={getHeroIcon(selectedHero)}
                    alt={heroDetails?.name || "Hero"}
                    fill
                    className="object-contain"
                    sizes="48px"
                    priority={false}
                    loading="lazy"
                  />
                </div>
                <span className="text-parchment-ink font-medium">
                  {heroDetails?.name}
                </span>
              </div>

              <h3 
                className="text-2xl font-jejuhallasan text-parchment-ink mb-4"
              >
                Current Team
              </h3>
              <p 
                className="text-parchment-ink/70 mb-4"
              >
                {team?.code} {team?.name}
              </p>

              {teamMembersLoading ? (
                <div 
                  className="flex justify-center py-4"
                >
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                  <span className="ml-2 text-parchment-ink/70">
                    Loading team members...
                  </span>
                </div>
              ) : teamMembers.length > 0 ? (
                <div 
                  className="space-y-3"
                >
                  {CONSTANTS.HEROES.map((hero, index) => {
                    const member = takenByHeroId.get(hero.id);
                    const isTaken = Boolean(member);
                    const isCurrentUser = member?.line_number === lineNumber;

                    return (
                      <div
                        key={hero.id}
                        className={`flex items-center p-2 ${
                          isTaken ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <div 
                          className="relative w-10 h-10 rounded-full overflow-hidden mr-3"
                        >
                          <Image
                            src={getHeroIcon(hero.id)}
                            alt={hero.name}
                            fill
                            className={`object-contain ${isTaken ? "grayscale" : ""}`}
                            sizes="40px"
                            priority={false}
                            loading="lazy"
                          />
                        </div>

                        <div className="flex-1">
                          <p className="font-medium text-parchment-ink">
                            {hero.name}
                            {isCurrentUser && (
                              <span className="ml-2 text-amber-500 text-xs">
                                (You)
                              </span>
                            )}
                          </p>

                          <p
                            className={cn(
                              "text-xs uppercase",
                              isTaken ? "text-parchment-ink/50" : "text-green-700",
                            )}
                          >
                            {isTaken
                              ? isCurrentUser 
                                ? "Your Selection"
                                : (member?.instagram_handle ?? "Taken")
                              : "Available"}
                          </p>

                          {isTaken && (
                            <p className="text-xs text-parchment-ink/40">
                              Joined {getRelativeTimeString(member!.created_at)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div 
                  className="text-center py-4 text-parchment-ink/50"
                >
                  <p>No team members found. Be the first to join!</p>
                </div>
              )}

              <div 
                className="mt-4 flex w-full"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full"
                >
                  <Button
                    onClick={fetchTeamMembers}
                    variant="parchment" size="2xl"
                    className="w-full self-center cursor-pointer"
                  >
                    Refresh Team Members
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Team Invite Link */}
            <div 
              className="bg-parchment-darker/15 border border-parchment-dark rounded-lg p-6 flex flex-col"
            >
              <h3 
                className="text-2xl font-jejuhallasan text-parchment-ink mb-4"
              >
                Team Invite Link
              </h3>
              <p 
                className="text-parchment-ink mb-4"
              >
                Share your team invite link to your friends so they can join
                your group. Five participants per team.
              </p>

              <div 
                className="relative mb-4"
              >
                {inviteLinkLoading ? (
                  <div 
                    className="flex items-center justify-center py-4"
                  >
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                    <span className="ml-2 text-parchment-ink/70">
                      Generating invite link...
                    </span>
                  </div>
                ) : inviteLinkError ? (
                  <div
                  >
                    <Alert className="bg-red-900 border-red-800 mb-4">
                      <HugeiconsIcon icon={AlertCircle} size={16} />
                      <AlertDescription>{inviteLinkError}</AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <Input value={inviteLink || ""} readOnly />
                )}
              </div>

              {inviteLinkError ? (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex justify-center w-full"
                >
                  <Button
                    onClick={handleRegenerateInviteLink}
                    variant="parchment" size="2xl" className="w-fit"
                  >
                    Try Again
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex justify-center w-full"
                >
                  <Button
                    onClick={copyInviteLink}
                    disabled={!inviteLink || inviteLinkLoading}
                    variant="parchment" size="2xl" className="w-fit"
                  >
                    {copied ? "Copied!" : "Copy Link"}
                  </Button>
                </motion.div>
              )}
            </div>
            {registrationComplete && (
              <TeamMembersSubscription
                teamId={teamId}
                onNewMember={fetchTeamMembers}
              />
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer variant="parchment" />
    </div>
  );
}
