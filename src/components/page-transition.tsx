"use client";

import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface PageTransitionContextType {
  navigateTo: (href: string) => void;
}

const PageTransitionContext = createContext<PageTransitionContextType>({
  navigateTo: () => {},
});

export const usePageTransition = () => useContext(PageTransitionContext);

const DURATION = 0.3;

export function PageTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<"visible" | "exiting" | "entering">(
    "visible",
  );
  const prevPathname = useRef(pathname);

  // When pathname changes (navigation completed), reset scroll and start enter animation
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      setPhase("entering");
      window.scrollTo(0, 0);
      requestAnimationFrame(() => {
        setPhase("visible");
      });
    }
  }, [pathname]);

  const navigateTo = useCallback(
    (href: string) => {
      if (phase === "exiting") return;
      setPhase("exiting");
      setTimeout(() => {
        router.push(href);
      }, DURATION * 1000);
    },
    [router, phase],
  );

  const opacity = phase === "visible" ? 1 : 0;

  return (
    <PageTransitionContext.Provider value={{ navigateTo }}>
      <motion.div
        animate={{ opacity }}
        initial={{ opacity: 1 }}
        transition={{ duration: DURATION, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </PageTransitionContext.Provider>
  );
}
