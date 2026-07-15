"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  type HTMLMotionProps,
  type MotionValue,
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "motion/react";

import { cn } from "@/lib/utils";

const cardVariants = cva("absolute will-change-transform transform-gpu", {
  variants: {
    variant: {
      dark: "flex size-full flex-col items-center justify-center gap-6 rounded-3xl border border-white/10 bg-[#0a0a0f]/95 p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]",
      light:
        "flex size-full flex-col items-center justify-center gap-6 rounded-3xl border border-white/15 bg-[#101018]/95 p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.18)]",
    },
  },
  defaultVariants: { variant: "light" },
});

interface CardStickyProps
  extends HTMLMotionProps<"div">,
    VariantProps<typeof cardVariants> {
  arrayLength: number;
  index: number;
  incrementY?: number;
  incrementZ?: number;
  incrementRotation?: number;
}

interface ContainerScrollContextValue {
  scrollYProgress: MotionValue<number>;
}

const ContainerScrollContext = React.createContext<
  ContainerScrollContextValue | undefined
>(undefined);

function useContainerScrollContext() {
  const ctx = React.useContext(ContainerScrollContext);
  if (!ctx) throw new Error("CardTransformed must be used within ContainerScroll");
  return ctx;
}

export const ContainerScroll: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  style,
  className,
  ...props
}) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  });

  return (
    <ContainerScrollContext.Provider value={{ scrollYProgress }}>
      <div
        ref={scrollRef}
        className={cn("relative w-full", className)}
        style={{ perspective: "1000px", ...style }}
        {...props}
      >
        {children}
      </div>
    </ContainerScrollContext.Provider>
  );
};

export const CardsContainer: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  style,
  ...props
}) => {
  return (
    <div
      className={cn("relative", className)}
      style={{ perspective: "1000px", ...style }}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTransformed = React.forwardRef<HTMLDivElement, CardStickyProps>(
  (
    {
      arrayLength,
      index,
      incrementY = 10,
      incrementZ = 10,
      incrementRotation,
      className,
      variant,
      style,
      ...props
    },
    ref,
  ) => {
    const rotationSeed = incrementRotation ?? -index + 90;
    const { scrollYProgress } = useContainerScrollContext();

    const start = index / (arrayLength + 1);
    const end = (index + 1) / (arrayLength + 1);
    const rotateRange = [start - 1.5, end / 1.5];

    const y = useTransform(scrollYProgress, [start, end], ["0%", "-180%"]);
    const rotate = useTransform(scrollYProgress, rotateRange, [rotationSeed, 0]);
    const transform = useMotionTemplate`translateZ(${index * incrementZ}px) translateY(${y}) rotate(${rotate}deg)`;

    return (
      <motion.div
        ref={ref}
        style={{
          top: index * incrementY,
          transform,
          backfaceVisibility: "hidden",
          zIndex: (arrayLength - index) * incrementZ,
          ...style,
        }}
        className={cn(cardVariants({ variant, className }))}
        {...props}
      />
    );
  },
);
CardTransformed.displayName = "CardTransformed";

interface ReviewProps extends React.HTMLAttributes<HTMLDivElement> {
  rating: number;
  maxRating?: number;
}

export const ReviewStars = React.forwardRef<HTMLDivElement, ReviewProps>(
  ({ rating, maxRating = 5, className, ...props }, ref) => {
    const filled = Math.floor(rating);
    const frac = rating - filled;
    const empty = maxRating - filled - (frac > 0 ? 1 : 0);
    return (
      <div ref={ref} className={cn("flex items-center gap-1", className)} {...props}>
        {Array.from({ length: filled }).map((_, i) => (
          <svg key={`f${i}`} className="size-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
          </svg>
        ))}
        {frac > 0 && (
          <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
            <defs>
              <linearGradient id={`half-${rating}`}>
                <stop offset={`${frac * 100}%`} stopColor="currentColor" />
                <stop offset={`${frac * 100}%`} stopColor="rgba(255,255,255,0.2)" />
              </linearGradient>
            </defs>
            <path fill={`url(#half-${rating})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
          </svg>
        )}
        {Array.from({ length: empty }).map((_, i) => (
          <svg key={`e${i}`} className="size-4 text-white/20" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
          </svg>
        ))}
      </div>
    );
  },
);
ReviewStars.displayName = "ReviewStars";