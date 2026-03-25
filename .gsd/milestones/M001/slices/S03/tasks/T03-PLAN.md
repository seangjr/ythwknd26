---
estimated_steps: 28
estimated_files: 6
skills_used: []
---

# T03: Create motion wrapper components and shared animation variants

Create reusable 'use client' motion wrapper components and a shared animation variants file. These are needed by T04 (RSC conversion) and T05 (animation polish).

**Motion wrapper components to create in `src/components/motion/`:**

1. `motion-div.tsx` — Thin wrapper around `motion.div`. Accepts all `motion.div` props and passes them through. Must have `"use client"` directive.
```tsx
"use client";
import { motion, type HTMLMotionProps } from "motion/react";
import { forwardRef } from "react";
export const MotionDiv = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>((props, ref) => (
  <motion.div ref={ref} {...props} />
));
MotionDiv.displayName = "MotionDiv";
```

2. `motion-section.tsx` — Same pattern for `motion.section`. Accepts all `motion.section` props.

3. `fade-in.tsx` — Opinionated wrapper for the common fade+slide-up pattern. Props: `direction` (up/down/left/right, default up), `delay` (number, default 0), `duration` (number, default 0.6), `className`, `children`. Uses `whileInView` with `viewport={{ once: true }}` by default, with an `animateOnMount` boolean prop to switch to `initial/animate` instead.

4. `stagger-container.tsx` — Parent container for staggered children animations. Props: `staggerDelay` (number, default 0.1), `delayChildren` (number, default 0), `className`, `children`. Uses `motion.div` with `variants` for stagger orchestration.

5. `index.ts` — Barrel export for all motion components.

**Shared animation variants file `src/lib/animations.ts`:**

Define reusable variant objects:
- `fadeInUp` — `{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }`
- `fadeInDown` — `{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }`
- `fadeInLeft` — `{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }`
- `fadeInRight` — `{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }`
- `scaleIn` — `{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }`
- `staggerContainer` — `{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0 } } }` (with configurable stagger/delay factory function)
- `springTransition` — `{ type: "spring", stiffness: 400, damping: 17 }` (for hover/tap)
- `gentleSpring` — `{ type: "spring", stiffness: 200, damping: 20 }` (for entrances)
- `hoverScale` — `{ whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, transition: springTransition }`

Export as named exports. These are plain objects/functions, no `"use client"` needed (they're just data).

## Inputs

- `src/lib/constants.ts`

## Expected Output

- `src/components/motion/motion-div.tsx`
- `src/components/motion/motion-section.tsx`
- `src/components/motion/fade-in.tsx`
- `src/components/motion/stagger-container.tsx`
- `src/components/motion/index.ts`
- `src/lib/animations.ts`

## Verification

bun run build exits 0 && test -f src/components/motion/motion-div.tsx && test -f src/components/motion/motion-section.tsx && test -f src/components/motion/fade-in.tsx && test -f src/components/motion/stagger-container.tsx && test -f src/components/motion/index.ts && test -f src/lib/animations.ts && grep -q 'use client' src/components/motion/motion-div.tsx && grep -q 'fadeInUp' src/lib/animations.ts && grep -q 'springTransition' src/lib/animations.ts
