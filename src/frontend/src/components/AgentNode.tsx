import { Plane, TrendingUp, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { AgentType } from "../types";

interface Props {
  agentType: AgentType;
  position: { x: number; y: number };
  isActive: boolean;
  isPulsing: boolean;
  onClick: () => void;
}

const AGENT_CONFIG = {
  travel: {
    label: "Travel Agent",
    subtitle: "Flights · Hotels · Weather",
    icon: Plane,
    color: "oklch(0.68 0.18 110)",
    colorDim: "oklch(0.68 0.18 110 / 0.25)",
    colorBg: "oklch(0.68 0.18 110 / 0.08)",
    glowClass: "glow-travel",
    bg: "radial-gradient(135deg at 30% 20%, oklch(0.22 0.10 110 / 0.9), oklch(0.10 0.02 110 / 0.95))",
    bgActive:
      "radial-gradient(135deg at 30% 20%, oklch(0.26 0.12 110 / 0.95), oklch(0.12 0.04 110))",
    tools: ["Booking.com API", "Amadeus Flights", "OpenWeather"],
  },
  trading: {
    label: "Trading Agent",
    subtitle: "Markets · Orders · Portfolio",
    icon: TrendingUp,
    color: "oklch(0.72 0.21 65)",
    colorDim: "oklch(0.72 0.21 65 / 0.25)",
    colorBg: "oklch(0.72 0.21 65 / 0.08)",
    glowClass: "glow-trading",
    bg: "radial-gradient(135deg at 30% 20%, oklch(0.22 0.10 65 / 0.9), oklch(0.10 0.02 65 / 0.95))",
    bgActive:
      "radial-gradient(135deg at 30% 20%, oklch(0.26 0.12 65 / 0.95), oklch(0.12 0.04 65))",
    tools: ["Binance REST", "CoinGecko API", "Portfolio Sync"],
  },
  general: {
    label: "General Agent",
    subtitle: "Knowledge · Search · Code",
    icon: User,
    color: "oklch(0.55 0.23 20)",
    colorDim: "oklch(0.55 0.23 20 / 0.25)",
    colorBg: "oklch(0.55 0.23 20 / 0.08)",
    glowClass: "glow-general",
    bg: "radial-gradient(135deg at 30% 20%, oklch(0.20 0.12 20 / 0.9), oklch(0.10 0.03 20 / 0.95))",
    bgActive:
      "radial-gradient(135deg at 30% 20%, oklch(0.24 0.14 20 / 0.95), oklch(0.12 0.05 20))",
    tools: ["DuckDuckGo", "Knowledge Base", "Code Interpreter"],
  },
};

export function AgentNode({
  agentType,
  position,
  isActive,
  isPulsing,
  onClick,
}: Props) {
  const config = AGENT_CONFIG[agentType];
  const Icon = config.icon;
  const highlighted = isActive || isPulsing;

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: highlighted ? 20 : 10,
      }}
      data-ocid={`node-agent-${agentType}`}
    >
      {/* Outer glow halo when active */}
      <AnimatePresence>
        {highlighted && (
          <motion.div
            key="halo"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.35 }}
            className={`absolute pointer-events-none rounded-2xl ${config.glowClass}`}
            style={{ inset: "-6px", borderRadius: "14px" }}
          />
        )}
      </AnimatePresence>

      {/* Pulse ring */}
      <AnimatePresence>
        {isPulsing && (
          <motion.div
            key="pulse"
            animate={{ scale: [1, 1.18, 1], opacity: [0.55, 0, 0.55] }}
            transition={{
              duration: 1.4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeOut",
            }}
            className="absolute pointer-events-none rounded-2xl"
            style={{
              inset: "-10px",
              borderRadius: "16px",
              border: `1.5px solid ${config.color}`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Card button */}
      <motion.button
        type="button"
        onClick={onClick}
        animate={highlighted ? { scale: 1.04, y: -2 } : { scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: highlighted ? 1.06 : 1.04, y: -3 }}
        className="relative flex flex-col items-center gap-2 px-3 pt-3 pb-2.5 rounded-xl border cursor-pointer transition-smooth text-left"
        style={{
          width: "106px",
          minHeight: "96px",
          background: highlighted ? config.bgActive : config.bg,
          borderColor: highlighted ? config.color : config.colorDim,
          boxShadow: highlighted ? `inset 0 1px 0 ${config.colorBg}` : "none",
        }}
        aria-label={`${config.label} — click to view query history`}
      >
        {/* Icon badge */}
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: config.colorBg,
            border: `1px solid ${highlighted ? config.color : config.colorDim}`,
          }}
        >
          <Icon
            className="w-3.5 h-3.5"
            style={{
              color: highlighted
                ? config.color
                : `${config.color.replace(")", " / 0.6)")}`,
            }}
          />
        </div>

        {/* Label */}
        <div className="flex flex-col items-center gap-0.5 w-full">
          <span
            className="text-[10px] font-display font-bold leading-tight text-center tracking-wide"
            style={{
              color: highlighted ? config.color : "oklch(0.82 0.03 280)",
            }}
          >
            {config.label}
          </span>
          <span className="text-[8px] text-muted-foreground font-mono leading-tight text-center">
            {config.subtitle}
          </span>
        </div>

        {/* Tool pills */}
        <div className="flex flex-wrap gap-0.5 justify-center w-full mt-0.5">
          {config.tools.map((tool) => (
            <span
              key={tool}
              className="text-[7px] font-mono px-1 py-0.5 rounded"
              style={{
                color: highlighted ? config.color : "oklch(0.55 0.03 280)",
                background: highlighted
                  ? config.colorBg
                  : "oklch(0.14 0.01 280 / 0.6)",
                border: `1px solid ${highlighted ? config.colorDim : "oklch(0.22 0.01 280)"}`,
              }}
            >
              {tool}
            </span>
          ))}
        </div>

        {/* Active indicator dot */}
        <AnimatePresence>
          {highlighted && (
            <motion.div
              key="dot"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
              style={{ background: config.color }}
            />
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}
