import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Menu,
  ChevronLeft,
  MessageSquare,
  Wifi,
  Signal,
  BellOff,
  CheckCircle2,
  MapPin,
  Navigation,
  Plus,
  Minus,
  Users,
  UserPlus,
  Euro,
  CreditCard,
  Bus,
  Circle,
  Settings as SettingsIcon,
  Printer,
  Headphones,
  HelpCircle,
  Info,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: BusOnboard,
  head: () => ({
    meta: [
      { title: "Bus Onboard Computer" },
      { name: "description", content: "Onboard ticketing and stops computer for bus drivers." },
    ],
  }),
});

type Stop = { code: string; name: string; time: string };

const STOPS: Stop[] = [
  { code: "001", name: "Central Station", time: "08.00" },
  { code: "002", name: "Market Square", time: "08.04" },
  { code: "003", name: "Old Town Hall", time: "08.07" },
  { code: "004", name: "River Bridge", time: "08.10" },
  { code: "005", name: "City Park", time: "08.13" },
  { code: "006", name: "University", time: "08.17" },
  { code: "007", name: "Hospital", time: "08.21" },
  { code: "008", name: "North Terminal", time: "08.26" },
  { code: "009", name: "Industrial Zone", time: "08.31" },
  { code: "010", name: "Airport", time: "08.40" },
];

type Fare = { name: string; price: number };

const FARES: Fare[] = [
  { name: "Adult", price: 1.2 },
  { name: "Student", price: 0.6 },
  { name: "Senior", price: 0.5 },
  { name: "Child (6-15)", price: 0.4 },
  { name: "Disabled", price: 0.0 },
  { name: "Disabled + Companion", price: 0.0 },
  { name: "Luggage small", price: 0.3 },
  { name: "Luggage large", price: 0.6 },
  { name: "Bicycle", price: 1.0 },
  { name: "Stroller", price: 0.0 },
  { name: "Dog", price: 0.5 },
  { name: "Staff", price: 0.0 },
];

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function BusOnboard() {
  const now = useClock();
  const [currentStopIdx, setCurrentStopIdx] = useState(0);
  const [destStopIdx, setDestStopIdx] = useState(5);
  const [fareIdx, setFareIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [passengers, setPassengers] = useState(0);
  const [newPassengers, setNewPassengers] = useState(0);
  const [total, setTotal] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const price = FARES[fareIdx].price * qty;

  // Departure countdown: minutes:seconds until current stop's scheduled time
  const departureLabel = useMemo(() => {
    const [h, m] = STOPS[currentStopIdx].time.split(".").map(Number);
    const sched = new Date(now);
    sched.setHours(h, m, 0, 0);
    const diffMs = sched.getTime() - now.getTime();
    const sign = diffMs < 0 ? "-" : "+";
    const abs = Math.abs(Math.floor(diffMs / 1000));
    const mm = String(Math.floor(abs / 60)).padStart(2, "0");
    const ss = String(abs % 60).padStart(2, "0");
    return `${sign}${mm}:${ss}`;
  }, [now, currentStopIdx]);

  const timeStr = now.toLocaleTimeString("en-GB", { hour12: false });
  const day = now.getDate();
  const month = now.toLocaleString("en-GB", { month: "short" });

  const handleSell = () => {
    setTotal((t) => +(t + price).toFixed(2));
    setPassengers((p) => p + qty);
    setNewPassengers((p) => p + qty);
    setQty(1);
  };

  const handleClearTotal = () => {
    setTotal(0);
    setPassengers(0);
    setNewPassengers(0);
  };

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground select-none">
      {/* Status bar */}
      <header className="flex items-center gap-3 bg-status px-4 py-2 text-status-foreground">
        <button
          onClick={() => setSettingsOpen((o) => !o)}
          className="rounded p-1 hover:bg-white/10"
          aria-label={settingsOpen ? "Back" : "Menu"}
        >
          {settingsOpen ? (
            <ChevronLeft className="h-7 w-7" />
          ) : (
            <Menu className="h-7 w-7" />
          )}
        </button>
        <div className="flex-1" />
        <div className="flex items-center gap-4 text-white/95">
          <MessageSquare className="h-6 w-6" />
          <Navigation className="h-6 w-6" />
          <Wifi className="h-6 w-6" />
          <Signal className="h-6 w-6" />
          <BellOff className="h-6 w-6 opacity-70" />
          <CheckCircle2 className="h-7 w-7 text-white" />
        </div>
        <div className="ml-4 flex items-baseline gap-2 tabular-nums">
          <span className="text-3xl font-light tracking-tight" suppressHydrationWarning>{timeStr}</span>
          <div className="flex flex-col items-center leading-none">
            <span className="text-lg font-semibold" suppressHydrationWarning>{day}</span>
            <span className="text-xs uppercase" suppressHydrationWarning>{month}</span>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Stops list */}
        <section className="relative flex min-w-0 flex-[1.4] flex-col overflow-y-auto bg-panel">
          {STOPS.map((s, i) => {
            const isCurrent = i === currentStopIdx;
            const isDest = i === destStopIdx;
            const isFirst = i === 0;
            const isLast = i === STOPS.length - 1;
            return (
              <button
                key={s.code}
                onClick={() => setCurrentStopIdx(i)}
                className={`relative flex items-center gap-4 border-b border-border px-5 py-4 text-left transition-colors ${
                  isCurrent
                    ? "bg-status text-status-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {/* Dotted connector segments — break around the number, end at last stop */}
                {!isFirst && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute z-20 border-l-2 border-dotted border-muted-foreground/70"
                    style={{
                      left: "calc(1.25rem + 1.5rem)",
                      top: 0,
                      height: "calc(50% - 1.1rem)",
                    }}
                  />
                )}
                {!isLast && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute z-20 border-l-2 border-dotted border-muted-foreground/70"
                    style={{
                      left: "calc(1.25rem + 1.5rem)",
                      top: "calc(50% + 1.1rem)",
                      bottom: 0,
                    }}
                  />
                )}
                <div className="relative z-30 flex w-12 shrink-0 items-center justify-center">
                  {isCurrent ? (
                    <MapPin className="h-7 w-7" />
                  ) : (
                    <span className="font-mono text-lg text-muted-foreground">{s.code}</span>
                  )}
                </div>
                <span
                  className={`flex-1 truncate text-xl ${
                    isDest && !isCurrent ? "font-semibold text-success" : ""
                  }`}
                >
                  {s.name}
                </span>
                <span
                  className={`tabular-nums text-xl ${
                    isDest && !isCurrent ? "font-semibold text-success" : ""
                  }`}
                >
                  {s.time}
                </span>
              </button>
            );
          })}
        </section>



        {/* Fares list */}
        <section className="flex min-w-0 flex-1 flex-col overflow-y-auto border-x border-border bg-panel">
          {FARES.map((f, i) => {
            const active = i === fareIdx;
            return (
              <button
                key={f.name}
                onClick={() => setFareIdx(i)}
                className={`border-b border-border px-5 py-4 text-left text-lg transition-colors ${
                  active
                    ? "border-2 border-success font-semibold text-success"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {f.name}
              </button>
            );
          })}
        </section>

        {/* Right control panel */}
        <aside className="flex w-[340px] shrink-0 flex-col bg-panel">
          {/* Departure */}
          <div className="flex items-center justify-between bg-warning px-5 py-3 text-warning-foreground">
            <div>
              <div className="text-sm font-medium">Departure</div>
              <div className="text-4xl font-light tabular-nums">{departureLabel}</div>
            </div>
            <button
              onClick={() => setCurrentStopIdx((i) => Math.min(STOPS.length - 1, i + 1))}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background"
              aria-label="Next stop"
            >
              <Bus className="h-8 w-8" />
            </button>
          </div>

          {/* Passengers */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-info">Passengers</div>
              <div className="flex items-center gap-2 text-info">
                <Users className="h-5 w-5" />
                <span className="text-xl tabular-nums">{passengers}</span>
              </div>
              <div className="flex items-center gap-2 text-destructive">
                <UserPlus className="h-5 w-5" />
                <span className="text-xl tabular-nums">{newPassengers}</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => setQty((q) => q + 1)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-info text-info-foreground shadow-md active:scale-95"
                aria-label="Increase"
              >
                <Plus className="h-6 w-6" />
              </button>
              <span className="text-3xl font-light tabular-nums">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-info text-info-foreground shadow-md active:scale-95"
                aria-label="Decrease"
              >
                <Minus className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Price */}
          <div className="border-b border-border px-5 py-3">
            <div className="text-sm font-medium text-info">Price</div>
            <div className="text-right text-4xl font-light tabular-nums">
              {price.toFixed(2)} €
            </div>
          </div>

          {/* Total */}
          <div className="border-b border-border px-5 py-3">
            <div className="text-sm font-medium text-info">Total</div>
            <div className="text-right text-4xl font-light tabular-nums text-info">
              {total.toFixed(2)} €
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto flex items-center justify-around p-5">
            <button
              onClick={handleSell}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-warning text-warning-foreground shadow-lg active:scale-95"
              aria-label="Sell ticket"
            >
              <CreditCard className="h-8 w-8" />
            </button>
            <button
              onClick={handleClearTotal}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-success text-success-foreground shadow-lg active:scale-95"
              aria-label="Clear total"
            >
              <Euro className="h-8 w-8" />
            </button>
          </div>
        </aside>
      </div>

      {settingsOpen && (
        <SettingsMenu onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  );
}

type SettingsCategory = {
  key: string;
  label: string;
  icon: typeof Circle;
  items: { title: string; desc: string; action: string }[];
};

const SETTINGS_CATEGORIES: SettingsCategory[] = [
  {
    key: "vseobecne",
    label: "Všeobecné",
    icon: Circle,
    items: [
      {
        title: "Odchýlkový spoj",
        desc: "Zobrazí okno pre výber odchýlkovej linky, spoja a zastávok",
        action: "Vykonať",
      },
      {
        title: "Stiahnutie parametrov pre EMV terminál",
        desc: "Pošle EMV termináli transakciu Volanie parametrov na Terminal Management",
        action: "Vykonať",
      },
      {
        title: "Volanie na Terminal Management Banky",
        desc: "Aktivuje volanie na Terminal Management Banky",
        action: "Vykonať",
      },
    ],
  },
  {
    key: "odpocty",
    label: "Odpočty",
    icon: Euro,
    items: [
      { title: "Predbežný odpočet", desc: "Vytlačí predbežný odpočet", action: "Vytlačiť" },
      {
        title: "Uzatvor DŽV",
        desc: "Zobrazí okno pre uzatvorenie denného záznamu vozidla",
        action: "Vykonať",
      },
      {
        title: "Opakovanie tlače koncového lístka",
        desc: "Vytlačí kópiu predošlého koncového lístka",
        action: "Vykonať",
      },
    ],
  },
  { key: "nastavenia", label: "Nastavenia", icon: SettingsIcon, items: [] },
  { key: "zariadenia", label: "Zariadenia", icon: Printer, items: [] },
  { key: "dispecing", label: "Dispečing", icon: Headphones, items: [] },
  { key: "pomoc", label: "Pomoc", icon: HelpCircle, items: [] },
  { key: "systemove", label: "Systémové info.", icon: Info, items: [] },
];

function SettingsMenu({ onClose }: { onClose: () => void }) {
  const [activeKey, setActiveKey] = useState("vseobecne");
  const active = SETTINGS_CATEGORIES.find((c) => c.key === activeKey)!;

  return (
    <div className="absolute inset-x-0 bottom-0 top-16 z-50 flex bg-white">
      {/* Sidebar */}
      <nav className="flex w-72 shrink-0 flex-col overflow-y-auto border-r border-border bg-white">
        {SETTINGS_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = cat.key === activeKey;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveKey(cat.key)}
              className={`flex items-center gap-4 border-b border-border px-5 py-5 text-left text-xl transition-colors ${
                isActive
                  ? "bg-success text-success-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Icon
                className={`h-9 w-9 ${
                  isActive ? "text-success-foreground" : "text-muted-foreground"
                }`}
                strokeWidth={isActive ? 2 : 2}
              />
              <span className={isActive ? "font-medium" : ""}>{cat.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Content */}
      <div className="relative flex-1 overflow-y-auto bg-white">
        <div className="divide-y divide-border">
          {active.items.map((item) => (
            <div
              key={item.title}
              className="flex items-center justify-between gap-6 px-8 py-6"
            >
              <div className="min-w-0 flex-1">
                <div className="text-lg font-semibold text-foreground">{item.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{item.desc}</div>
              </div>
              <button className="shrink-0 rounded border border-border bg-muted px-8 py-2 text-base text-foreground shadow-sm hover:bg-accent">
                {item.action}
              </button>
            </div>
          ))}
          {active.items.length === 0 && (
            <div className="px-8 py-10 text-muted-foreground">Žiadne položky.</div>
          )}
        </div>
      </div>
    </div>
  );
}
