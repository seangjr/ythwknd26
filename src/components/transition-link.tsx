"use client";

import Link from "next/link";
import { usePageTransition } from "./page-transition";

type TransitionLinkProps = Omit<
  React.ComponentProps<typeof Link>,
  "onClick"
>;

export function TransitionLink({ href, children, ...props }: TransitionLinkProps) {
  const { navigateTo } = usePageTransition();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigateTo(typeof href === "string" ? href : href.pathname ?? "/");
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
