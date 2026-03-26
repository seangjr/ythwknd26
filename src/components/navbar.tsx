import Image from "next/image";
import { TransitionLink } from "./transition-link";

interface NavbarProps {
  variant?: "dark" | "parchment";
}

export default function Navbar({ variant = "dark" }: NavbarProps) {
  const src = variant === "parchment" ? "/assets/masthead.svg" : "/assets/masthead.svg";

  return (
    <nav className="flex flex-col items-center justify-center py-4 md:py-8">
      <TransitionLink href="/">
        <Image
          src={src}
          alt="Logo for YTHWKND 2026"
          className="w-[200] md:w-[250]"
          width={250}
          height={100}
        />
      </TransitionLink>
    </nav>
  );
}
