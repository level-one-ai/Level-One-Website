import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform, useMotionValueEvent } from "motion/react";
import Lenis from "lenis";
import {
  ContainerScroll,
  CardsContainer,
  CardTransformed,
  ReviewStars,
} from "@/components/ui/animated-cards-stack";
import CardCarousel from "@/components/ui/card-carousel";
import BookingOverlay from "@/components/ui/booking-overlay";

const NAV_LINKS = ["Services", "Process", "Founders", "Pricing", "FAQ"];

/* Tinted gradients shared by Services / Process / Founders cards */
const CARD_TINTS = [
  "from-fuchsia-400/30 via-rose-300/10 to-transparent",
  "from-sky-400/30 via-indigo-300/10 to-transparent",
  "from-emerald-300/30 via-teal-300/10 to-transparent",
  "from-amber-300/30 via-orange-300/10 to-transparent",
];

/**
 * useTransform, but with the keyframe range padded to explicitly cover the
 * full 0–1 scroll domain. Without this, Chrome's native scroll-driven
 * animation path synthesizes implicit endpoint keyframes from the element's
 * base value — which made cards fade back out (and faded-out text fade back
 * in) after their intended range. Explicit endpoints pin values in place.
 */
function usePinnedTransform<T extends number | string>(
  progress: import("motion/react").MotionValue<number>,
  input: number[],
  output: T[]
) {
  const ins = [...input];
  const outs = [...output];
  if (ins[0] > 0) {
    ins.unshift(0);
    outs.unshift(outs[0]);
  }
  if (ins[ins.length - 1] < 1) {
    ins.push(1);
    outs.push(outs[outs.length - 1]);
  }
  return useTransform(progress, ins, outs);
}
const HEADLINE = "LEVEL ONE";

const INTRO_TEXT =
  "We build the systems that handle the busywork — so you can focus on the work that grows your business. One partner, every piece in place.";

const FOUNDERS = [
  {
    stat: "7+",
    label: "Years",
    body: "Level One has served the market, guiding ventures and their journeys through every stage of growth.",
  },
  {
    stat: "15 000+",
    label: "Workflows",
    body: "Automated pipelines shipped and maintained across teams working at the edge of their industries.",
  },
  {
    stat: "120+",
    label: "Partners",
    body: "Founders, operators and studios we've embedded with — from first call to launch and beyond.",
  },
];

const SERVICES = [
  {
    tag: "01 — Foundations",
    title: "Websites That Convert",
    body: "Fast, search‑ready websites engineered to turn visitors into enquiries — the foundation every growth system is built on.",
  },
  {
    tag: "02 — Automation",
    title: "Workflow Automation",
    body: "Bookings, follow‑ups, invoicing and admin handled automatically — so nothing slips and no lead waits overnight.",
  },
  {
    tag: "03 — Reputation",
    title: "Reviews & Reputation",
    body: "A steady flow of five‑star reviews requested, tracked and answered on autopilot — the trust signals local customers look for.",
  },
  {
    tag: "04 — Visibility",
    title: "Local Search Growth",
    body: "Own the searches that matter in your area, with local visibility and content that compounds month after month.",
  },
];

const PROCESS = [
  {
    step: "Step 01",
    title: "Funnel map audit",
    body:
      "A free 30-minute session where we audit your funnel, identify bottlenecks, and map out exactly where automation can move the needle.",
  },
  {
    step: "Step 02",
    title: "Proposal",
    body:
      "We deliver a clear scope, timeline, and fixed price. No surprises, no hourly billing. You know exactly what you're getting.",
  },
  {
    step: "Step 03",
    title: "Project",
    body:
      "Our team builds, tests, and deploys your systems. You get weekly updates and a working product, not a deck full of promises.",
  },
  {
    step: "Step 04",
    title: "Ongoing management",
    body:
      "Optional retainer for monitoring, optimization, and iteration. Most clients see compounding returns over time.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Enquiries used to sit in my inbox overnight. Now every lead gets a reply within minutes, and booked jobs are up month on month.",
    name: "Daniel Carter",
    role: "Director, Trades Business",
    stars: 5,
  },
  {
    quote:
      "The new site actually works for us. Visitors stay, read, and book — and we can see exactly where every enquiry came from.",
    name: "Olivia Martin",
    role: "Marketing Lead",
    stars: 5,
  },
  {
    quote:
      "The booking and reminder system quietly killed our no‑shows. The front desk finally has room to breathe.",
    name: "Sarah Thompson",
    role: "Practice Manager",
    stars: 5,
  },
  {
    quote:
      "The reporting gives us insight we never had before. It's like having an extra pair of hands across every shift.",
    name: "Emily Rodriguez",
    role: "General Manager",
    stars: 5,
  },
  {
    quote:
      "I was skeptical at first, but the systems save me hours every week. The automation has been a genuine game‑changer.",
    name: "Michael Chen",
    role: "Owner, Property Services",
    stars: 5,
  },
  {
    quote:
      "Working with the Level One team felt effortless. The systems they built quietly do the heavy lifting every day.",
    name: "Priya Patel",
    role: "Founder, Northlight",
    stars: 5,
  },
  {
    quote:
      "Their attention to craft is rare. Every surface feels considered, and the results showed up in our conversions.",
    name: "James O'Connor",
    role: "Head of Growth",
    stars: 5,
  },
];

const FAQS = [
  {
    q: "What kind of projects do you take on?",
    a: "Level One builds websites, workflow automation, review and reputation systems, and local search growth for UK small businesses — including trades, dental practices, hospitality and property teams. If it wins you time or customers, it's in scope.",
  },
  {
    q: "How long does a typical engagement last?",
    a: "Most fixed‑price projects run four to ten weeks from kickoff to launch. Ongoing management retainers continue for as long as they're moving the needle.",
  },
  {
    q: "Do you offer fixed pricing?",
    a: "Yes. Every project starts with a free growth mapping call, followed by a written proposal with a fixed scope, timeline, and price. No hourly billing, ever.",
  },
  {
    q: "Can you work with our existing team?",
    a: "Absolutely. We plug into your stack, your standups, and your review cadence. Most partners treat us as an embedded senior pod rather than an outside vendor.",
  },
  {
    q: "What happens after launch?",
    a: "You keep everything — code, files, documentation. If you'd like us to stay on for monitoring, iteration, or new surfaces, we offer month‑to‑month retainers.",
  },
  {
    q: "How do we get started?",
    a: "Book a growth mapping call. Thirty minutes, no pitch. If it feels like a fit, we'll follow up within 24 hours with a written proposal.",
  },
];

function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, lerp: 0.08, wheelMultiplier: 0.95 });
    // Expose so sections can command smooth snaps and overlays can pause scroll
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    let id: number;
    const raf = (t: number) => {
      lenis.raf(t);
      id = requestAnimationFrame(raf);
    };
    id = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(id);
      (window as unknown as { __lenis?: Lenis }).__lenis = undefined;
      lenis.destroy();
    };
  }, []);
}

function LiquidGlassButton({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative overflow-hidden rounded-full px-5 py-2 text-[12px] md:text-[13px] font-medium tracking-wide bg-white/85 backdrop-blur-lg border border-white/60 shadow-[0_10px_40px_-10px_rgba(255,255,255,0.35),inset_0_1px_0_rgba(255,255,255,0.9)] hover:bg-white/95 transition ${className}`}
    >
      <span
        className="absolute inset-0 pointer-events-none opacity-70"
        style={{
          background:
            "radial-gradient(120px 60px at 30% 20%, rgba(255,255,255,0.9), transparent 60%), radial-gradient(140px 80px at 80% 90%, rgba(200,220,255,0.5), transparent 60%)",
        }}
      />
      <span
        className="relative bg-clip-text text-transparent"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(20,20,30,0.55), rgba(20,20,30,0.15))",
        }}
      >
        {children}
      </span>
    </button>
  );
}

function Nav({ onBook }: { onBook: () => void }) {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto flex items-center justify-end px-6 md:px-12 py-6 md:py-8">
        <div
          onMouseLeave={() => setHovered(null)}
          className="flex items-center gap-1 pl-2 pr-1.5 py-1.5"
        >
          <nav className="hidden sm:flex items-center">
            {NAV_LINKS.map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(l.toLowerCase());
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                onMouseEnter={() => setHovered(l)}
                className="relative px-4 py-2 text-[12px] md:text-[13px] font-medium text-white/75 hover:text-white transition-colors"
              >
                {/* Glass hover bubble that slides between links */}
                {hovered === l && (
                  <motion.span
                    layoutId="nav-bubble"
                    className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_24px_-8px_rgba(0,0,0,0.6)]"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{l}</span>
              </a>
            ))}
          </nav>
          <button
            type="button"
            onClick={onBook}
            className="rounded-full bg-white text-neutral-900 border border-neutral-200 shadow-[0_6px_20px_-6px_rgba(0,0,0,0.35)] px-5 py-2 text-[11px] md:text-[12px] font-semibold uppercase tracking-[0.16em] hover:bg-neutral-50 transition-colors"
          >
            Let's Talk
          </button>
        </div>
      </div>
    </header>
  );
}

/* ---------- HERO ---------- */
function Hero() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  const letters = HEADLINE.split("");
  // Wave-like exit: all letters travel together within a shared band,
  // with a small per-letter phase offset so a ripple sweeps left→right.
  // No letter fully disappears before its neighbours — they leave as one wave.
  const bandStart = 0.55;
  const bandEnd = 0.95;
  const phase = 0.03; // small stagger between letters

  return (
    <section ref={wrapRef} className="relative h-[320vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden [contain:paint]">
        {/* subtle vignette / ambient */}
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_20%,rgba(255,255,255,0.06),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_50%_110%,rgba(120,120,255,0.08),transparent_60%)]" />

        <div className="absolute inset-0 flex items-end">
          <div
            className="w-full text-center select-none leading-[0.9] pb-0"
            style={{
              fontFamily: "'Michroma', var(--font-display)",
              transform: "scaleY(1.22)",
              transformOrigin: "bottom",
            }}
          >
            <span
              className="flex w-full justify-center text-white text-[13vw] md:text-[11vw] font-normal [perspective:1200px]"
              style={{
                letterSpacing: "-0.06em",
                WebkitTextStroke: "1px rgba(255,255,255,0.08)",
                textShadow:
                  "0 1px 0 rgba(255,255,255,0.55), 0 2px 0 rgba(220,220,235,0.42), 0 3px 0 rgba(180,180,205,0.28), 0 6px 10px rgba(0,0,0,0.35), 0 18px 40px rgba(0,0,0,0.55)",
              }}
            >
              {letters.map((ch, i) => (
                <Letter
                  key={i}
                  char={ch}
                  progress={scrollYProgress}
                  from={bandStart + i * phase}
                  to={bandEnd + i * phase * 0.5}
                  // Michroma's L/E/V glyph ink collides at this tracking while
                  // O/N/E sits ~3px apart; these measured per-pair corrections
                  // give every LEVEL pair the same ink gap as the word ONE.
                  tighten={["0.09em", "0.012em", "0.139em", "-0.008em"][i]}
                />
              ))}
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}

function Letter({
  char,
  progress,
  from,
  to,
  tighten,
}: {
  char: string;
  progress: import("motion/react").MotionValue<number>;
  from: number;
  to: number;
  tighten?: string;
}) {
  // Wave: each letter mostly overlaps its neighbours' animation range so
  // none fully vanishes ahead of the others — they ripple out together.
  // Clamp to [0,1]: scroll progress never exceeds 1, and the browser's
  // native Web Animations API rejects keyframe offsets outside that range
  // (an unclamped value here crashes the mount and blanks the page).
  const f = Math.min(from, 0.97);
  const t = Math.min(to, 1);
  const y = usePinnedTransform(progress, [f, t], [0, 1200]);
  const opacity = usePinnedTransform(progress, [f, t - 0.02, t], [1, 1, 0]);
  const rotate = usePinnedTransform(progress, [f, t], [0, 8]);

  if (char === " ") return <span className="inline-block w-[0.28em]" />;
  return (
    <motion.span
      style={{ y, opacity, rotate, display: "inline-block", marginRight: tighten }}
      className="will-change-transform"
    >
      {char}
    </motion.span>
  );
}

/* ---------- INTRO — THE PROMISE (typewriter → fade → headline) ---------- */
function Intro() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });
  const [count, setCount] = useState(0);
  const total = INTRO_TEXT.length;

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    // The promise types itself out, then simply holds while the scroll
    // continues on — no fade.
    const start = 0.08;
    const end = 0.72;
    const p = Math.max(0, Math.min(1, (v - start) / (end - start)));
    setCount(Math.round(p * total));
  });

  const typed = INTRO_TEXT.slice(0, count);
  const caretVisible = count < total;

  return (
    <section ref={wrapRef} className="relative h-[200vh] bg-black">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center px-6 overflow-hidden [contain:paint]">
        <div className="max-w-5xl w-full">
          <div className="text-[11px] tracking-[0.35em] uppercase text-white/40 mb-6 text-center">
            The Promise
          </div>
          <h2 className="text-white text-center text-3xl md:text-5xl lg:text-6xl leading-[1.08] tracking-tight">
            <span style={{ fontFamily: "var(--font-display)" }}>
              {/* Full text for search engines, LLM crawlers and screen readers */}
              <span className="sr-only">{INTRO_TEXT}</span>
              <span aria-hidden="true">
                {typed}
                <span
                  className={`inline-block w-[0.08em] h-[0.9em] align-[-0.1em] ml-1 bg-white ${caretVisible ? "animate-pulse" : "opacity-0"}`}
                />
              </span>
            </span>
          </h2>
        </div>
      </div>
    </section>
  );
}

/* Scroll-pinned split-screen services deck.
   State 0: service 1 fills the background, its copy sits left, and the
   thumbnails for services 2–4 wait in the right-hand track. Each scrubbed
   transition morphs the leading thumbnail into the new fullscreen
   background (FLIP-style shared element), swaps the left copy with a
   staggered entrance, and slides the track left — three times — then the
   pin releases with service 4 fully displayed. */
const SERVICE_WINDOWS: [number, number][] = [
  [0.08, 0.3],
  [0.38, 0.6],
  [0.68, 0.9],
];

function Services({ onBook }: { onBook: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  // Track which service is "current" for pointer-events on the CTA
  const [activeIdx, setActiveIdx] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    let idx = 0;
    SERVICE_WINDOWS.forEach(([, b], k) => {
      if (v >= b - 0.04) idx = k + 1;
    });
    if (idx !== activeIdx) setActiveIdx(idx);
  });

  // Thumbnail slot geometry (viewport units) — the track's first slot is the
  // fixed origin every morph launches from.
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const check = () => setCompact(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  const slot = compact
    ? { left: 8, top: 60, w: 26, h: 28, gap: 4 }
    : { left: 56, top: 31, w: 13, h: 38, gap: 2.5 };
  const stride = slot.w + slot.gap;

  // Carousel translation — slides one stride per completed transition,
  // scrubbed in sync with each morph.
  const trackX = usePinnedTransform(
    scrollYProgress,
    [
      SERVICE_WINDOWS[0][0], SERVICE_WINDOWS[0][1],
      SERVICE_WINDOWS[1][0], SERVICE_WINDOWS[1][1],
      SERVICE_WINDOWS[2][0], SERVICE_WINDOWS[2][1],
    ],
    ["0vw", `-${stride}vw`, `-${stride}vw`, `-${stride * 2}vw`, `-${stride * 2}vw`, `-${stride * 3}vw`]
  );

  return (
    <section id="services" ref={wrapRef} className="relative h-[380vh] bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden [contain:paint]">
        <h2 className="sr-only">Services</h2>

        {/* Base background — service 1 */}
        <div className="absolute inset-0">
          <ServiceBackdrop index={0} />
        </div>

        {/* Morphing shared elements — thumbnail → fullscreen background */}
        {[1, 2, 3].map((i) => (
          <ServiceMorph
            key={SERVICES[i].title}
            index={i}
            window={SERVICE_WINDOWS[i - 1]}
            progress={scrollYProgress}
            slot={slot}
          />
        ))}

        {/* Right column — horizontal track of upcoming thumbnails (above backgrounds) */}
        <motion.div
          style={{ x: trackX, left: `${slot.left}vw`, top: `${slot.top}vh` }}
          className="absolute z-20 flex will-change-transform"
        >
          {[1, 2, 3].map((i) => (
            <ServiceThumb
              key={SERVICES[i].title}
              index={i}
              window={SERVICE_WINDOWS[i - 1]}
              progress={scrollYProgress}
              slot={slot}
            />
          ))}
        </motion.div>

        {/* Left column — typography blocks, stacked and swapped per service */}
        <div className="absolute z-30 inset-y-0 left-0 w-full md:w-[48%] px-6 sm:px-10 md:pl-16 flex items-start md:items-center pt-24 md:pt-0 pointer-events-none">
          <div className="relative w-full max-w-md h-[300px]">
            {SERVICES.map((sv, i) => (
              <ServiceCopy
                key={sv.title}
                index={i}
                progress={scrollYProgress}
                active={activeIdx === i}
                onBook={onBook}
                {...sv}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* Full-bleed tinted backdrop for one service */
function ServiceBackdrop({ index }: { index: number }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0a0a0f]">
      <div className={`absolute inset-0 bg-gradient-to-br ${CARD_TINTS[index % 4]} opacity-90`} />
      <div className="absolute inset-0 bg-[radial-gradient(1000px_600px_at_80%_15%,rgba(255,255,255,0.10),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(800px_500px_at_10%_100%,rgba(0,0,0,0.55),transparent_60%)]" />
      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:3px_3px]" />
      <div
        className="absolute -bottom-[6vh] -right-[2vw] text-white/[0.06] leading-none select-none"
        style={{ fontFamily: "var(--font-display)", fontSize: "38vh" }}
      >
        {String(index + 1).padStart(2, "0")}
      </div>
    </div>
  );
}

/* Shared-element morph: launches from the track's first slot and scales to
   cover the viewport, becoming the new background. Holds once landed. */
function ServiceMorph({
  index,
  window: w,
  progress,
  slot,
}: {
  index: number;
  window: [number, number];
  progress: import("motion/react").MotionValue<number>;
  slot: { left: number; top: number; w: number; h: number };
}) {
  const [a, b] = w;
  const left = usePinnedTransform(progress, [a, b], [`${slot.left}vw`, "0vw"]);
  const top = usePinnedTransform(progress, [a, b], [`${slot.top}vh`, "0vh"]);
  const width = usePinnedTransform(progress, [a, b], [`${slot.w}vw`, "100vw"]);
  const height = usePinnedTransform(progress, [a, b], [`${slot.h}vh`, "100vh"]);
  const borderRadius = usePinnedTransform(progress, [a, b], ["22px", "0px"]);
  // Hidden until its moment (the static thumb shows instead), then persists
  const opacity = usePinnedTransform(progress, [a - 0.005, a], [0, 1]);

  return (
    <motion.div
      style={{ left, top, width, height, borderRadius, opacity, zIndex: 4 + index }}
      className="absolute overflow-hidden will-change-transform"
    >
      <ServiceBackdrop index={index} />
    </motion.div>
  );
}

/* Small thumbnail card in the right-hand track */
function ServiceThumb({
  index,
  window: w,
  progress,
  slot,
}: {
  index: number;
  window: [number, number];
  progress: import("motion/react").MotionValue<number>;
  slot: { left: number; top: number; w: number; h: number; gap: number };
}) {
  // Hands off to the morph layer the instant its transition begins
  const opacity = usePinnedTransform(progress, [w[0] - 0.005, w[0]], [1, 0]);
  return (
    <motion.div
      style={{
        opacity,
        width: `${slot.w}vw`,
        height: `${slot.h}vh`,
        marginRight: `${slot.gap}vw`,
      }}
      className="relative shrink-0 rounded-[22px] overflow-hidden border border-white/20 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]"
    >
      <ServiceBackdrop index={index} />
      <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 bg-gradient-to-t from-black/60 to-transparent">
        <div className="text-[8px] md:text-[9px] tracking-[0.3em] uppercase text-white/60">
          {SERVICES[index].tag}
        </div>
        <div
          className="text-white text-xs md:text-sm leading-tight mt-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {SERVICES[index].title}
        </div>
      </div>
    </motion.div>
  );
}

/* Left typography block for one service — staggered entrance, exits upward */
function ServiceCopy({
  index,
  progress,
  active,
  onBook,
  tag,
  title,
  body,
}: {
  index: number;
  progress: import("motion/react").MotionValue<number>;
  active: boolean;
  onBook: () => void;
  tag: string;
  title: string;
  body: string;
}) {
  const enter = index === 0 ? null : SERVICE_WINDOWS[index - 1];
  const exit = index === 3 ? null : SERVICE_WINDOWS[index];

  const part = (offset: number) => {
    const ins: number[] = [];
    const outs: number[] = [];
    const yIns: number[] = [];
    const yOuts: number[] = [];
    if (enter) {
      const s = enter[0] + 0.05 + offset;
      ins.push(s, s + 0.08);
      outs.push(0, 1);
      yIns.push(s, s + 0.08);
      yOuts.push(26, 0);
    }
    if (exit) {
      const s = exit[0];
      ins.push(s, s + 0.08);
      outs.push(1, 0);
      yIns.push(s, s + 0.08);
      yOuts.push(0, -26);
    }
    return {
      opacity: usePinnedTransform(progress, ins, outs),
      y: usePinnedTransform(progress, yIns, yOuts),
    };
  };
  const t1 = part(0);
  const t2 = part(0.03);
  const t3 = part(0.06);

  return (
    <div className={`absolute inset-0 ${active ? "pointer-events-auto" : "pointer-events-none"}`}>
      <motion.div style={t1}>
        <div className="text-[10px] md:text-[11px] tracking-[0.35em] uppercase text-white/70 mb-3 md:mb-4">
          {tag}
        </div>
        <h3
          className="text-white text-4xl sm:text-5xl md:text-6xl leading-[0.94] tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h3>
      </motion.div>
      <motion.p
        style={t2}
        className="text-white/80 text-sm md:text-[15px] leading-relaxed max-w-[38ch] mt-4 md:mt-5 drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
      >
        {body}
      </motion.p>
      <motion.div style={t3}>
        <button
          type="button"
          onClick={onBook}
          tabIndex={active ? 0 : -1}
          className="mt-6 md:mt-7 inline-flex items-center gap-2 rounded-full bg-white text-black text-[11px] md:text-xs font-semibold tracking-[0.2em] uppercase px-6 py-3 hover:bg-white/90 transition"
        >
          Book a call <span aria-hidden>→</span>
        </button>
      </motion.div>
    </div>
  );
}

/* ---------- OUTRO ---------- */

/* ---------- PROCESS ---------- */
/* Capsule gallery: four pill-shaped cards in a centred row. The selected one
   expands into a large rounded panel (first card open on arrival); the step
   name sits bottom-left and its details bottom-right beneath the row, both
   swapping to match the selected card. Selecting another card closes the
   open one. */
function Process() {
  const [active, setActive] = useState(0);
  const current = PROCESS[active];

  return (
    <section
      id="process"
      className="relative min-h-screen bg-black flex flex-col justify-center py-16 md:py-20 px-4 sm:px-6 md:px-10"
    >
      <div className="text-center mb-8 md:mb-10">
        <div className="text-[11px] tracking-[0.35em] uppercase text-white/50 mb-4">
          From first call to launch
        </div>
        <h2
          className="text-white text-4xl md:text-6xl leading-[0.9] tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          The process.
        </h2>
      </div>

      {/* Capsule row */}
      <div className="flex items-center justify-center gap-2.5 sm:gap-4 md:gap-5 h-[42vh] min-h-[300px] max-h-[480px]">
        {PROCESS.map((p, i) => {
          const isActive = active === i;
          return (
            <motion.div
              key={p.step}
              layout
              onClick={() => setActive(i)}
              transition={{ layout: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }}
              className={`relative h-full overflow-hidden border border-white/15 bg-white/[0.05] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.15)] ${
                isActive
                  ? "w-[58vw] sm:w-[40vw] md:w-[360px] rounded-[1.75rem] md:rounded-[2.5rem] cursor-default"
                  : "w-[13vw] sm:w-[76px] md:w-[104px] rounded-full cursor-pointer hover:bg-white/[0.1]"
              }`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${CARD_TINTS[i % 4]} pointer-events-none transition-opacity duration-500 ${isActive ? "opacity-90" : "opacity-50"}`}
              />
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/12 to-transparent pointer-events-none" />
              <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:3px_3px]" />
              <div className="absolute inset-x-0 bottom-4 md:bottom-5 grid place-items-center">
                <span className="text-[10px] md:text-[11px] tracking-[0.3em] uppercase text-white/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Info row beneath — swaps with the selected card */}
      <div className="max-w-6xl w-full mx-auto mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 items-end min-h-[110px] md:min-h-[130px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`l-${active}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="text-[10px] md:text-[11px] tracking-[0.35em] uppercase text-white/60 mb-2 md:mb-3">
              {current.step}
            </div>
            <h3
              className="text-white text-3xl sm:text-4xl md:text-5xl leading-[0.95] tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {current.title}
            </h3>
          </motion.div>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.p
            key={`r-${active}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
            className="text-white/70 text-xs sm:text-sm md:text-[15px] leading-relaxed sm:text-right sm:justify-self-end max-w-[42ch]"
          >
            {current.body}
          </motion.p>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ---------- FOUNDERS ---------- */
function Founders() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  return (
    <section id="founders" ref={wrapRef} className="relative h-[180vh] bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col px-4 sm:px-6 md:px-10 [contain:paint]">
        <div className="max-w-6xl w-full mx-auto grid grid-cols-12 gap-4 md:gap-8 pt-20 md:pt-32">
          <div className="col-span-12 md:col-span-5">
            <h2
              className="text-white text-3xl sm:text-4xl md:text-6xl leading-[0.9] tracking-tight uppercase"
              style={{ fontFamily: "var(--font-display)" }}
            >
              About<br />the Founders
            </h2>
          </div>
          <div className="col-span-12 md:col-span-7 md:pt-3 text-white/70 text-xs sm:text-sm md:text-[15px] leading-relaxed space-y-2 md:space-y-3 max-w-lg">
            <p>
              Level One is a small, senior team building automation and growth systems for business owners who care about the details.
            </p>
            <p>
              Our mission is to give every operator the leverage of a full studio — designed, engineered and maintained by one partner.
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center">
          <div className="max-w-6xl w-full mx-auto grid grid-cols-3 gap-2.5 sm:gap-4 md:gap-8">
            {FOUNDERS.map((f, i) => (
              <FounderCard key={f.label} index={i} {...f} progress={scrollYProgress} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FounderCard({
  index,
  stat,
  label,
  body,
  progress,
}: {
  index: number;
  stat: string;
  label: string;
  body: string;
  progress: import("motion/react").MotionValue<number>;
}) {
  // Cards fade in one at a time and PIN — they never fade out. The reveal
  // completes early in the pinned range so the full row holds on screen,
  // then the section releases and scrolling continues.
  const stagger = 0.16;
  const base = 0.1 + index * stagger;
  const end = base + 0.14;
  const opacity = usePinnedTransform(progress, [base, end], [0, 1]);
  const y = usePinnedTransform(progress, [base, end], [40, 0]);
  const x = usePinnedTransform(progress, [base, end], [-40, 0]);
  const innerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 50, active: false });
  const onMove = (e: React.MouseEvent) => {
    const el = innerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setTilt({ ry: (px - 0.5) * 14, rx: -(py - 0.5) * 14, mx: px * 100, my: py * 100, active: true });
  };
  const onLeave = () => setTilt({ rx: 0, ry: 0, mx: 50, my: 50, active: false });
  return (
    <motion.div style={{ opacity, y, x }} className="[perspective:1400px]">
      <motion.div
        ref={innerRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        animate={{ rotateX: tilt.rx, rotateY: tilt.ry }}
        transition={{ type: "spring", stiffness: 180, damping: 18, mass: 0.4 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-white/15 bg-white/[0.05] backdrop-blur-lg shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.18)] p-3.5 sm:p-6 md:p-10 min-h-[150px] sm:min-h-[220px] md:min-h-[280px] flex flex-col justify-between"
      >
        {/* Tinted gradient — matches the Services cards */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${CARD_TINTS[index % 4]} opacity-90 pointer-events-none`}
        />
        <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:3px_3px]" />
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            opacity: tilt.active ? 1 : 0,
            background: `radial-gradient(420px 260px at ${tilt.mx}% ${tilt.my}%, rgba(255,255,255,0.20), transparent 60%)`,
          }}
        />
        <div className="relative" style={{ transform: "translateZ(30px)" }}>
          <div
            className="text-white text-2xl sm:text-4xl md:text-7xl leading-none tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {stat}
          </div>
          <div
            className="text-white/80 text-xs sm:text-lg md:text-3xl uppercase tracking-tight mt-1"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {label}
          </div>
        </div>
        <p className="relative text-white/70 text-[9px] sm:text-xs md:text-sm mt-3 md:mt-6 leading-relaxed" style={{ transform: "translateZ(30px)" }}>
          {body}
        </p>
      </motion.div>
    </motion.div>
  );
}

function Outro({ onBook }: { onBook: () => void }) {
  return (
    <section id="about" className="relative min-h-screen bg-black flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-[11px] tracking-[0.35em] uppercase text-white/50 mb-6">Level One</div>
        <h1
          className="text-white text-4xl sm:text-6xl md:text-8xl leading-[0.9] tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Take your business to the next level.
        </h1>
        <p className="text-white/60 mt-6 max-w-md mx-auto">
          Requests answered within 24 hours. No forms. No funnels.
        </p>
        <div className="mt-8 flex items-center justify-center">
          <LiquidGlassButton
            onClick={onBook}
            className="uppercase tracking-[0.22em] px-7 py-3 text-[13px]"
          >
            Let's Talk
          </LiquidGlassButton>
        </div>
      </div>
    </section>
  );
}

/* ---------- FOOTER ---------- */
function Footer() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start center", "end end"],
  });
  const footerLetters = "LEVEL ONE".split("");
  const revealStart = 0.05;
  const revealEnd = 0.75;
  const span = revealEnd - revealStart;
  const per = span / footerLetters.length;

  return (
    <footer ref={wrapRef} className="relative bg-black text-white overflow-hidden min-h-screen flex flex-col">
      <div className="absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:26px_26px] opacity-20 pointer-events-none" />
      <div className="relative max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-10 pt-24 md:pt-28 pb-6 md:pb-8 flex-1 flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6">
          <div className="md:col-span-2">
            <FooterBrandCard />
          </div>
          <div className="md:col-span-3">
            <FooterLinksCard />
          </div>
        </div>

        <div
          className="mt-6 md:mt-8 text-white leading-[0.82] tracking-[-0.03em] text-[15vw] md:text-[12vw] font-black uppercase"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <span className="inline-flex">
            {footerLetters.map((ch, i) => (
              <FooterLetter
                key={i}
                char={ch}
                progress={scrollYProgress}
                from={revealStart + i * per}
                to={revealStart + i * per + per * 0.9}
              />
            ))}
          </span>
        </div>

        <div className="mt-4 md:mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-4 items-center justify-between text-[11px] text-white/40 tracking-wide">
          <FooterYear />
          <div className="flex gap-6">
            <a href="#" className="hover:text-white/70">Privacy Policy</a>
            <a href="#" className="hover:text-white/70">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLetter({
  char,
  progress,
  from,
  to,
}: {
  char: string;
  progress: import("motion/react").MotionValue<number>;
  from: number;
  to: number;
}) {
  // Fade IN one by one, no drop. Stays in place afterwards.
  const opacity = usePinnedTransform(progress, [from, to], [0, 1]);
  const blur = usePinnedTransform(progress, [from, to], ["12px", "0px"]);
  const filter = useTransform(blur, (b) => `blur(${b})`);
  if (char === " ") return <span className="inline-block w-[0.28em]" />;
  return (
    <motion.span
      style={{ opacity, filter, display: "inline-block" }}
      className="will-change-transform"
    >
      {char}
    </motion.span>
  );
}

function useCursorTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 50, active: false });
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setTilt({ ry: (px - 0.5) * 10, rx: -(py - 0.5) * 10, mx: px * 100, my: py * 100, active: true });
  };
  const onLeave = () => setTilt({ rx: 0, ry: 0, mx: 50, my: 50, active: false });
  return { ref, tilt, onMove, onLeave };
}

function FooterBrandCard() {
  const { ref, tilt, onMove, onLeave } = useCursorTilt();
  return (
    <div className="[perspective:1400px]">
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        animate={{ rotateX: tilt.rx, rotateY: tilt.ry }}
        transition={{ type: "spring", stiffness: 180, damping: 18, mass: 0.4 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative min-h-[240px] md:min-h-[260px] rounded-3xl overflow-hidden border border-white/15 bg-white/[0.06] backdrop-blur-lg shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.18)] p-5 sm:p-6 md:p-7 flex flex-col justify-between"
      >
        {/* Colourful gradient wash */}
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/30 via-indigo-500/20 to-sky-400/25 pointer-events-none" />
        <div className="absolute -inset-20 bg-[radial-gradient(500px_320px_at_30%_60%,rgba(120,80,255,0.35),transparent_60%),radial-gradient(400px_260px_at_80%_30%,rgba(80,180,255,0.35),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:3px_3px]" />
        {/* White cursor highlight */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            opacity: tilt.active ? 1 : 0,
            background: `radial-gradient(420px 260px at ${tilt.mx}% ${tilt.my}%, rgba(255,255,255,0.22), transparent 60%)`,
          }}
        />

        <div className="relative flex items-center gap-3" style={{ transform: "translateZ(30px)" }}>
          <div className="h-9 w-9 rounded-full grid place-items-center bg-white/10 border border-white/25 backdrop-blur-xl">
            <div className="h-3.5 w-3.5 rounded-full bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.7)]" />
          </div>
          <div className="text-white font-medium tracking-tight text-lg">Level One</div>
        </div>

        <div className="relative mt-6 md:mt-8" style={{ transform: "translateZ(30px)" }}>
          <div
            className="text-white text-xl sm:text-2xl md:text-[26px] leading-tight tracking-tight max-w-xs"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Smarter workflow<br />automation,<br />done for you.
          </div>
          <div className="mt-4 sm:mt-5 flex items-center justify-between gap-4">
            <div className="text-[11px] tracking-[0.3em] uppercase text-white/60">Stay in touch</div>
            <div className="flex items-center gap-2">
              {["in", "X", "IG", "GH"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="h-8 w-8 grid place-items-center rounded-lg bg-white/10 border border-white/20 backdrop-blur-xl text-white/80 text-[11px] hover:bg-white/20 transition"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function FooterLinksCard() {
  const { ref, tilt, onMove, onLeave } = useCursorTilt();
  return (
    <div className="[perspective:1400px]">
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        animate={{ rotateX: tilt.rx, rotateY: tilt.ry }}
        transition={{ type: "spring", stiffness: 180, damping: 18, mass: 0.4 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative min-h-[240px] md:min-h-[260px] rounded-3xl overflow-hidden border border-white/15 bg-white/[0.05] backdrop-blur-lg shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.18)] p-5 sm:p-6 md:p-7 flex flex-col justify-between"
      >
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:3px_3px]" />
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            opacity: tilt.active ? 1 : 0,
            background: `radial-gradient(420px 260px at ${tilt.mx}% ${tilt.my}%, rgba(255,255,255,0.18), transparent 60%)`,
          }}
        />

        <div className="relative grid grid-cols-2 gap-6 sm:gap-12" style={{ transform: "translateZ(30px)" }}>
          <div>
            <div
              className="text-white/70 text-base mb-3 italic"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Navigation
            </div>
            <ul className="space-y-2">
              {["Services", "Process", "Founders", "Pricing"].map((i) => (
                <li key={i}>
                  <a href={`#${i.toLowerCase()}`} className="text-white/85 hover:text-white transition-colors text-sm font-medium">{i}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div
              className="text-white/70 text-base mb-3 italic"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Company
            </div>
            <ul className="space-y-2">
              {["Blog", "About", "Terms", "Privacy"].map((i) => (
                <li key={i}>
                  <a href="#" className="text-white/85 hover:text-white transition-colors text-sm font-medium">{i}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative mt-5" style={{ transform: "translateZ(30px)" }}>
          <div className="text-white/60 text-xs sm:text-sm">Your market moves fast. Stay ahead with Level One.</div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-3 flex items-center gap-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl p-1.5"
          >
            <input
              type="email"
              placeholder="Enter email address"
              className="flex-1 min-w-0 bg-transparent px-3 sm:px-4 py-1.5 text-sm text-white placeholder:text-white/50 outline-none"
            />
            <button className="shrink-0 rounded-full bg-white text-black text-xs sm:text-sm font-medium px-4 py-1.5 hover:bg-white/90 transition">
              Subscribe
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

/* ---------- PRICING ---------- */
const PRICING_TIERS = [
  {
    tag: "Free",
    title: "Growth mapping call",
    body: "A 30‑minute audit of your funnel where we find the bottlenecks and show you exactly where automation moves the needle.",
  },
  {
    tag: "From $5k",
    title: "Fixed‑price projects",
    body: "Most engagements range from $10k to $50k. One clear scope, timeline, and price — agreed before any work begins.",
  },
  {
    tag: "Monthly",
    title: "Ongoing management",
    body: "An optional retainer to monitor, optimize, and extend your systems over time.",
  },
];

function Pricing() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  // Soft snap stops: when scrolling pauses inside the section, glide to the
  // nearest phase hold so no message can be skimmed past accidentally.
  // Targets sit at the centre of each phase's hold window; the text/card
  // pairings are unchanged — this only steadies where the scroll settles.
  const snapTargets = useRef([0.13, 0.57, 0.75, 0.95]);
  const snapping = useRef(false);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const el = wrapRef.current;
    if (!el || v <= 0.004 || v >= 0.996) return;
    clearTimeout((snapping as unknown as { t?: number }).t);
    (snapping as unknown as { t?: number }).t = window.setTimeout(() => {
      const current = scrollYProgress.get();
      if (current <= 0.004 || current >= 0.996) return;
      const nearest = snapTargets.current.reduce((a, b) =>
        Math.abs(b - current) < Math.abs(a - current) ? b : a
      );
      if (Math.abs(nearest - current) < 0.008) return; // already resting on a stop
      const total = el.offsetHeight - window.innerHeight;
      const targetY = el.offsetTop + nearest * total;
      const lenis = (window as unknown as { __lenis?: { scrollTo: (y: number, o?: object) => void } }).__lenis;
      if (lenis) {
        lenis.scrollTo(targetY, {
          duration: 0.9,
          easing: (t: number) => 1 - Math.pow(1 - t, 3),
        });
      } else {
        window.scrollTo({ top: targetY, behavior: "smooth" });
      }
    }, 240);
  });

  return (
    <section id="pricing" ref={wrapRef} className="relative h-[320vh] bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col [contain:paint]">
        <div className="text-center pt-16 md:pt-20 pb-3 md:pb-4 px-6 relative z-20 pointer-events-none">
          <div className="text-[11px] tracking-[0.35em] uppercase text-white/50 mb-4">How we price</div>
          <h2
            className="text-white text-4xl md:text-6xl leading-[0.9] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Simple, fixed‑price.
          </h2>
        </div>

        <div className="flex-1 min-h-0 relative w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10">
          {/* RIGHT — 3D bank card carousel, scrubbed by this section's scroll */}
          <div className="absolute inset-y-0 right-0 w-[86%] md:w-[52%] z-0">
            <CardCarousel progress={scrollYProgress} />
          </div>

          {/* LEFT — one message at a time, centred vertically. Each block
              slides up and off the screen as the next slides in from below.
              No frosted boxes — plain text, matching the opening block. */}
          <div className="relative z-10 h-full w-full md:w-[58%] overflow-hidden">
            {/* Opening block: holds centre, then moves off vertically */}
            <PricingPhase progress={scrollYProgress} exit={[0.26, 0.4]}>
              <div>
                <h3
                  className="text-white text-3xl sm:text-4xl md:text-5xl tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  One‑time payment
                </h3>
                <p className="text-white/70 text-sm sm:text-base md:text-lg mt-3 leading-relaxed max-w-xl">
                  No hourly billing. No scope creep. Every engagement is scoped, priced,
                  and delivered on a single timeline you agree to before we start.
                </p>

                <div className="mt-4 md:mt-5 grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-2 md:gap-y-2.5 text-xs sm:text-sm md:text-[15px] text-white/80 max-w-xl">
                  {["Support 24/7", "Analytics", "Integrations", "Updates", "Reports", "Mobile"].map((f) => (
                    <div key={f} className="flex items-center gap-2.5">
                      <span className="inline-flex size-4 md:size-5 items-center justify-center rounded-full border border-white/30 text-white/80 text-[10px] md:text-[11px]">✓</span>
                      {f}
                    </div>
                  ))}
                </div>

                <a
                  href="#about"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="mt-5 md:mt-6 inline-flex items-center justify-center rounded-full bg-white text-black text-xs font-semibold tracking-[0.2em] uppercase px-6 py-2.5 hover:bg-white/90 transition"
                >
                  Book a call
                </a>
              </div>
            </PricingPhase>

            {/* Tier texts — enter from below one at a time; the last one stays */}
            {PRICING_TIERS.map((t, j) => (
              <PricingPhase
                key={t.tag}
                progress={scrollYProgress}
                enter={[0.42 + j * 0.18, 0.54 + j * 0.18]}
                exit={j < 2 ? [0.6 + j * 0.18, 0.72 + j * 0.18] : undefined}
              >
                <div>
                  <div className="text-[10px] md:text-[11px] tracking-[0.35em] uppercase text-white/50 mb-3">
                    {t.tag}
                  </div>
                  <h3
                    className="text-white text-3xl sm:text-4xl md:text-5xl tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {t.title}
                  </h3>
                  <p className="text-white/70 text-sm sm:text-base md:text-lg mt-3 leading-relaxed max-w-xl">
                    {t.body}
                  </p>
                </div>
              </PricingPhase>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* One vertically-centred pricing message that slides through the frame */
function PricingPhase({
  progress,
  enter,
  exit,
  children,
}: {
  progress: import("motion/react").MotionValue<number>;
  enter?: [number, number];
  exit?: [number, number];
  children: React.ReactNode;
}) {
  const ins: number[] = [];
  const outs: string[] = [];
  if (enter) {
    ins.push(0, enter[0], Math.min(enter[1], 1));
    outs.push("115vh", "115vh", "0vh");
  } else {
    ins.push(0);
    outs.push("0vh");
  }
  if (exit) {
    ins.push(Math.min(exit[0], 1), Math.min(exit[1], 1));
    outs.push("0vh", "-115vh");
  }
  if (ins[ins.length - 1] < 1) {
    ins.push(1);
    outs.push(outs[outs.length - 1]);
  }
  const y = useTransform(progress, ins, outs);
  return (
    <motion.div
      style={{ y }}
      className="absolute inset-0 flex flex-col justify-center will-change-transform"
    >
      {children}
    </motion.div>
  );
}


/* ---------- FOOTER YEAR (client-only to avoid SSR/CSR mismatch) ---------- */
function FooterYear() {
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => setYear(new Date().getFullYear()), []);
  return <div>© {year ?? ""} Level One. All rights reserved.</div>;
}

/* ---------- TESTIMONIALS (animated stacked cards) ---------- */
function Testimonials() {
  return (
    <section id="testimonials" className="relative bg-black">
      <div className="pt-24 md:pt-32 px-6 text-center">
        <div className="text-[11px] tracking-[0.35em] uppercase text-white/50 mb-4">
          Kind words
        </div>
        <h2
          className="text-white text-4xl md:text-6xl leading-[0.9] tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Clients on the record.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm text-white/60">
          Scroll to shuffle through what founders and operators say after we ship.
        </p>
      </div>
      <ContainerScroll className="container mx-auto h-[300vh]">
        <div className="sticky top-0 h-screen w-full py-12 flex items-center justify-center">
          <CardsContainer className="relative h-[440px] w-[340px] sm:h-[460px] sm:w-[380px]">
            {TESTIMONIALS.map((t, i) => (
              <CardTransformed
                key={i}
                arrayLength={TESTIMONIALS.length}
                index={i + 2}
                variant="light"
                className="text-white"
              >
                <div className="flex flex-col items-center gap-4 text-center px-2">
                  <ReviewStars rating={t.stars} className="text-amber-300" />
                  <blockquote className="text-white/85 text-base md:text-lg leading-relaxed">
                    "{t.quote}"
                  </blockquote>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full grid place-items-center text-xs font-semibold text-white/95 border border-white/25 bg-gradient-to-br from-fuchsia-500/40 via-indigo-500/30 to-sky-400/30">
                    {t.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="text-left">
                    <div className="text-white text-sm font-medium">{t.name}</div>
                    <div className="text-white/55 text-xs">{t.role}</div>
                  </div>
                </div>
              </CardTransformed>
            ))}
          </CardsContainer>
        </div>
      </ContainerScroll>
    </section>
  );
}

/* ---------- FAQ ---------- */
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Soft stop: when scrolling pauses with this section mostly in view,
  // glide it into frame so all six cards sit on one screen.
  useEffect(() => {
    let t: number;
    const onScroll = () => {
      clearTimeout(t);
      t = window.setTimeout(() => {
        const el = sectionRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (Math.abs(r.top) < window.innerHeight * 0.45 && Math.abs(r.top) > 6) {
          const y = window.scrollY + r.top;
          const lenis = (window as unknown as { __lenis?: { scrollTo: (y: number, o?: object) => void } }).__lenis;
          if (lenis) lenis.scrollTo(y, { duration: 0.9, easing: (p: number) => 1 - Math.pow(1 - p, 3) });
          else window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 240);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section
      id="faq"
      ref={sectionRef}
      className="relative min-h-screen bg-black flex items-center py-12 md:py-16 px-4 sm:px-6 md:px-10"
    >
      <div className="max-w-3xl mx-auto w-full">
        <div className="text-center mb-6 md:mb-8">
          <div className="text-[11px] tracking-[0.35em] uppercase text-white/50 mb-3">Answers</div>
          <h2
            className="text-white text-3xl sm:text-4xl md:text-5xl leading-[0.9] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Frequently asked.
          </h2>
        </div>
        <div className="flex flex-col gap-2 md:gap-2.5">
          {FAQS.map((f, i) => (
            <FAQItem
              key={f.q}
              index={i}
              question={f.q}
              answer={f.a}
              open={open === i}
              onToggle={() => setOpen(open === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({
  index,
  question,
  answer,
  open,
  onToggle,
}: {
  index: number;
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-white/[0.05] backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)]">
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/8 to-transparent pointer-events-none" />
      <button
        type="button"
        onClick={onToggle}
        className="relative w-full flex items-center gap-3 px-4 md:px-6 py-3 md:py-3.5 text-left"
      >
        <div className="text-[10px] tracking-[0.3em] uppercase text-white/50 w-7 shrink-0">
          {String(index + 1).padStart(2, "0")}
        </div>
        <div className="flex-1 text-white text-sm md:text-[15px] font-medium tracking-tight">
          {question}
        </div>
        <div
          className="h-7 w-7 shrink-0 rounded-full grid place-items-center border border-white/25 bg-white/10 text-white transition-transform duration-300"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
          aria-hidden
        >
          +
        </div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden"
      >
        <div className="px-4 md:px-6 pb-4 pl-[2.5rem] md:pl-[3.25rem] text-white/70 text-xs md:text-sm leading-relaxed">
          {answer}
        </div>
      </motion.div>
    </div>
  );
}

/* ---------- PAGE ---------- */
export default function LandingPage() {
  useLenis();
  const [bookingOpen, setBookingOpen] = useState(false);
  return (
    <main className="relative bg-black text-white antialiased" style={{ fontFamily: "var(--font-sans)" }}>
      <Nav onBook={() => setBookingOpen(true)} />
      <Hero />
      <Intro />
      <Services onBook={() => setBookingOpen(true)} />
      <Process />
      <Founders />
      <Pricing />
      <Testimonials />
      <FAQ />
      <Outro onBook={() => setBookingOpen(true)} />
      <Footer />
      <BookingOverlay open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </main>
  );
}

// silence unused import warning for MotionValueEvent helper if tree-shaken
export const __noop = useMotionValueEvent;