import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

/* Booking flow: "Let's Talk" → black details page → Continue → glass calendar.
   Clicking a day slides the time panel in on the right (9:00 AM – 5:00 PM). */

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function buildTimeSlots() {
  const slots: string[] = [];
  for (let h = 9; h <= 17; h++) {
    for (const m of [0, 30]) {
      if (h === 17 && m > 0) continue; // range ends at 5:00 PM
      const hour12 = h > 12 ? h - 12 : h;
      const ampm = h >= 12 ? "PM" : "AM";
      slots.push(`${hour12}:${m === 0 ? "00" : "30"} ${ampm}`);
    }
  }
  return slots;
}
const TIME_SLOTS = buildTimeSlots();

/* Calendar grid: weeks (Mon-first) for the given month */
function monthMatrix(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // Always render six full weeks (42 cells) so the calendar's height never
  // jumps when navigating between 4/5/6-row months.
  while (cells.length < 42) cells.push(null);
  return cells;
}

const inputClass =
  "w-full bg-transparent border-0 border-b border-white/20 rounded-none px-0 py-2.5 text-[15px] text-white placeholder:text-white/25 outline-none focus:border-white/80 transition-colors";

export default function BookingOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"form" | "calendar">("form");
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", website: "" });

  const today = useMemo(() => {
    const t = new Date();
    return { y: t.getFullYear(), m: t.getMonth(), d: t.getDate() };
  }, []);
  const [view, setView] = useState({ y: today.y, m: today.m });
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Website is optional — everything else must be filled before Continue appears
  const ready =
    form.name.trim() !== "" &&
    form.email.includes("@") &&
    form.phone.trim() !== "" &&
    form.company.trim() !== "";

  // Pause the page behind the overlay (Lenis + native scroll)
  useEffect(() => {
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    if (open) {
      lenis?.stop();
      document.documentElement.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.documentElement.style.overflow = "";
    }
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  // Escape closes; reset flow when reopened
  useEffect(() => {
    if (!open) return;
    setStep("form");
    setSelectedDay(null);
    setSelectedTime(null);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const cells = monthMatrix(view.y, view.m);
  const isPast = (d: number) =>
    view.y < today.y ||
    (view.y === today.y && view.m < today.m) ||
    (view.y === today.y && view.m === today.m && d < today.d);
  const isToday = (d: number) => view.y === today.y && view.m === today.m && d === today.d;
  const atCurrentMonth = view.y === today.y && view.m === today.m;

  const prevMonth = () => {
    setSelectedDay(null);
    setSelectedTime(null);
    setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }));
  };
  const nextMonth = () => {
    setSelectedDay(null);
    setSelectedTime(null);
    setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }));
  };

  const field = (key: keyof typeof form, label: string, type = "text", optional = false) => (
    <div>
      <label className="block text-[10px] tracking-[0.3em] uppercase text-white/45 mb-2">
        {label}
        {optional && <span className="text-white/30 normal-case tracking-normal"> (optional)</span>}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className={inputClass}
        placeholder={label}
      />
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[100] bg-black text-white overflow-y-auto"
        >
          {/* subtle ambient, consistent with the site */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_50%_0%,rgba(255,255,255,0.05),transparent_60%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_400px_at_80%_100%,rgba(120,120,255,0.07),transparent_60%)]" />

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-5 right-5 md:top-8 md:right-8 z-10 h-10 w-10 rounded-full grid place-items-center border border-white/20 bg-white/[0.06] backdrop-blur-xl text-white/80 hover:text-white hover:bg-white/[0.12] transition"
          >
            ✕
          </button>

          <div className="relative min-h-full flex items-center justify-center px-4 sm:px-6 py-16">
            <AnimatePresence mode="wait">
              {step === "form" ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full max-w-lg"
                >
                  <div className="text-[11px] tracking-[0.35em] uppercase text-white/45 mb-3 text-center">
                    Let's talk
                  </div>
                  <h2
                    className="text-white text-3xl md:text-4xl tracking-tight text-center"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    A few details first.
                  </h2>

                  <p className="text-white/55 text-sm text-center mt-3 max-w-sm mx-auto">
                    Tell us who we're talking to. It takes twenty seconds.
                  </p>

                  <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7">
                    {field("name", "Name")}
                    {field("email", "Email", "email")}
                    {field("phone", "Phone", "tel")}
                    {field("company", "Company Name")}
                    <div className="sm:col-span-2">{field("website", "Website", "url", true)}</div>
                  </div>

                  {/* Continue appears only once the required fields are entered */}
                  <AnimatePresence>
                    {ready && (
                      <motion.button
                        key="continue"
                        type="button"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 14 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        onClick={() => setStep("calendar")}
                        className="mt-7 w-full rounded-full bg-white text-black text-xs font-semibold tracking-[0.2em] uppercase px-6 py-3.5 hover:bg-white/90 transition"
                      >
                        Continue
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="calendar"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full max-w-4xl"
                >
                  <div className="text-[11px] tracking-[0.35em] uppercase text-white/45 mb-3 text-center">
                    Book your growth mapping call
                  </div>
                  <h2
                    className="text-white text-3xl md:text-4xl tracking-tight text-center mb-8"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Pick a day{selectedDay ? ", then a time." : "."}
                  </h2>

                  <div className="flex flex-col md:flex-row items-stretch justify-center gap-4">
                    {/* Glass month calendar */}
                    <motion.div
                      layout
                      transition={{ layout: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }}
                      className="relative rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-2xl shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)] p-5 md:p-7 w-full md:w-[520px]"
                    >
                      <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-3xl" />
                      <div className="relative flex items-center justify-between mb-4">
                        <button
                          type="button"
                          onClick={prevMonth}
                          disabled={atCurrentMonth}
                          aria-label="Previous month"
                          className="h-8 w-8 rounded-full grid place-items-center border border-white/20 bg-white/[0.06] text-white/70 hover:text-white hover:bg-white/[0.12] transition disabled:opacity-30 disabled:pointer-events-none"
                        >
                          ‹
                        </button>
                        <div
                          className="text-white text-lg md:text-xl tracking-tight"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {MONTHS[view.m]} {view.y}
                        </div>
                        <button
                          type="button"
                          onClick={nextMonth}
                          aria-label="Next month"
                          className="h-8 w-8 rounded-full grid place-items-center border border-white/20 bg-white/[0.06] text-white/70 hover:text-white hover:bg-white/[0.12] transition"
                        >
                          ›
                        </button>
                      </div>

                      <div className="relative grid grid-cols-7 gap-1 text-center text-[10px] tracking-[0.2em] uppercase text-white/40 mb-2">
                        {WEEKDAYS.map((d) => (
                          <div key={d} className="py-1">{d}</div>
                        ))}
                      </div>
                      <div className="relative grid grid-cols-7 gap-1">
                        {cells.map((d, i) =>
                          d === null ? (
                            <div key={i} className="aspect-square" />
                          ) : (
                            <button
                              key={i}
                              type="button"
                              disabled={isPast(d)}
                              onClick={() => {
                                setSelectedDay(d);
                                setSelectedTime(null);
                              }}
                              className={`aspect-square rounded-xl text-sm md:text-[15px] transition grid place-items-center
                                ${isPast(d)
                                  ? "text-white/20 pointer-events-none"
                                  : selectedDay === d
                                    ? "bg-white text-black font-semibold shadow-[0_8px_24px_-8px_rgba(255,255,255,0.5)]"
                                    : "text-white/80 hover:bg-white/[0.12] hover:text-white"}
                                ${isToday(d) && selectedDay !== d ? "ring-1 ring-white/35" : ""}`}
                            >
                              {d}
                            </button>
                          )
                        )}
                      </div>
                    </motion.div>

                    {/* Time panel — appears only after a day is chosen */}
                    <AnimatePresence>
                      {selectedDay !== null && (
                        <motion.div
                          key="times"
                          layout
                          initial={{ opacity: 0, x: -22, scale: 0.98 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: -14, scale: 0.99 }}
                          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], layout: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }}
                          className="relative rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-2xl shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)] p-5 md:p-6 w-full md:w-[240px] flex flex-col"
                        >
                          <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-3xl" />
                          <div className="relative text-white/60 text-[10px] tracking-[0.3em] uppercase mb-1">
                            {MONTHS[view.m].slice(0, 3)} {selectedDay}, {view.y}
                          </div>
                          <div
                            className="relative text-white text-lg tracking-tight mb-4"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            Pick a time
                          </div>
                          <div className="relative flex-1 overflow-y-auto max-h-[320px] md:max-h-[400px] pr-1 flex flex-col gap-2 [scrollbar-width:thin]">
                            {TIME_SLOTS.map((t, i) => (
                              <motion.button
                                key={t}
                                type="button"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 + i * 0.02, duration: 0.25 }}
                                onClick={() => setSelectedTime(t)}
                                className={`shrink-0 rounded-full px-4 py-2 text-xs tracking-wide border transition text-left
                                  ${selectedTime === t
                                    ? "bg-white text-black border-white font-semibold"
                                    : "text-white/80 border-white/20 bg-white/[0.04] hover:bg-white/[0.12] hover:text-white"}`}
                              >
                                {t}
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
