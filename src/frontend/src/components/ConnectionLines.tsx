import { useEffect, useRef } from "react";
import type { NodeId } from "../types";

interface Props {
  activeNodes: Set<NodeId>;
  pulsingNodes: Set<NodeId>;
}

// Node positions as percentages matching FlowDiagram layout
const NODE_POS: Record<string, { x: number; y: number }> = {
  orchestrator: { x: 50, y: 42 },
  memory: { x: 50, y: 78 },
  travel: { x: 24, y: 14 },
  trading: { x: 68, y: 14 },
  general: { x: 24, y: 62 },
  "flight-api": { x: 14, y: 36 },
  "hotel-db": { x: 24, y: 42 },
  "weather-svc": { x: 34, y: 38 },
  "market-feed": { x: 60, y: 36 },
  "order-exec": { x: 70, y: 42 },
  "portfolio-sync": { x: 80, y: 37 },
  "knowledge-base-1": { x: 10, y: 60 },
  "knowledge-base-2": { x: 14, y: 72 },
  "web-search": { x: 24, y: 78 },
  "code-interpreter": { x: 34, y: 73 },
};

// Connections with cluster metadata
const CONNECTIONS: { from: string; to: string; cluster: string }[] = [
  { from: "orchestrator", to: "travel", cluster: "travel" },
  { from: "orchestrator", to: "trading", cluster: "trading" },
  { from: "orchestrator", to: "general", cluster: "general" },
  { from: "orchestrator", to: "memory", cluster: "memory" },
  { from: "travel", to: "flight-api", cluster: "travel" },
  { from: "travel", to: "hotel-db", cluster: "travel" },
  { from: "travel", to: "weather-svc", cluster: "travel" },
  { from: "trading", to: "market-feed", cluster: "trading" },
  { from: "trading", to: "order-exec", cluster: "trading" },
  { from: "trading", to: "portfolio-sync", cluster: "trading" },
  { from: "general", to: "knowledge-base-1", cluster: "general" },
  { from: "general", to: "knowledge-base-2", cluster: "general" },
  { from: "general", to: "web-search", cluster: "general" },
  { from: "general", to: "code-interpreter", cluster: "general" },
];

const CLUSTER_COLORS: Record<
  string,
  { base: string; active: string; particle: string }
> = {
  travel: {
    base: "oklch(0.68 0.18 110 / 0.18)",
    active: "oklch(0.68 0.18 110 / 0.8)",
    particle: "oklch(0.85 0.18 110)",
  },
  trading: {
    base: "oklch(0.72 0.21 65 / 0.18)",
    active: "oklch(0.72 0.21 65 / 0.8)",
    particle: "oklch(0.88 0.21 65)",
  },
  general: {
    base: "oklch(0.55 0.23 20 / 0.18)",
    active: "oklch(0.55 0.23 20 / 0.75)",
    particle: "oklch(0.70 0.23 20)",
  },
  memory: {
    base: "oklch(0.50 0.08 180 / 0.18)",
    active: "oklch(0.50 0.08 180 / 0.75)",
    particle: "oklch(0.72 0.08 180)",
  },
  orchestrator: {
    base: "oklch(0.75 0.15 280 / 0.18)",
    active: "oklch(0.75 0.15 280 / 0.8)",
    particle: "oklch(0.88 0.15 280)",
  },
};

function isConnectionActive(
  from: string,
  to: string,
  active: Set<NodeId>,
  pulsing: Set<NodeId>,
): boolean {
  return (
    (active.has(from as NodeId) || pulsing.has(from as NodeId)) &&
    (active.has(to as NodeId) || pulsing.has(to as NodeId))
  );
}

function isNodeLit(
  nodeId: string,
  active: Set<NodeId>,
  pulsing: Set<NodeId>,
): boolean {
  return active.has(nodeId as NodeId) || pulsing.has(nodeId as NodeId);
}

// Animated particle dot along a line path
interface ParticleProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  delay: number;
  duration: number;
}

function FlowParticle({
  x1,
  y1,
  x2,
  y2,
  color,
  delay,
  duration,
}: ParticleProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const animRef = useRef<SVGAnimateMotionElement>(null);

  useEffect(() => {
    if (animRef.current) {
      animRef.current.beginElement();
    }
  }, []);

  return (
    <circle
      ref={circleRef}
      r="3"
      fill={color}
      opacity="0.9"
      style={{ filter: `drop-shadow(0 0 3px ${color})` }}
    >
      <animateMotion
        ref={animRef}
        dur={`${duration}s`}
        repeatCount="indefinite"
        begin={`${delay}s`}
        path={`M ${x1} ${y1} L ${x2} ${y2}`}
      />
      <animate
        attributeName="opacity"
        values="0;0.9;0.9;0"
        dur={`${duration}s`}
        repeatCount="indefinite"
        begin={`${delay}s`}
      />
    </circle>
  );
}

export function ConnectionLines({ activeNodes, pulsingNodes }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="glow-line" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter
          id="particle-glow"
          x="-100%"
          y="-100%"
          width="300%"
          height="300%"
        >
          <feGaussianBlur stdDeviation="0.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <title>Agent connection lines</title>

      {/* Base inactive lines */}
      {CONNECTIONS.map(({ from, to, cluster }) => {
        const fromPos = NODE_POS[from];
        const toPos = NODE_POS[to];
        if (!fromPos || !toPos) return null;

        const colors = CLUSTER_COLORS[cluster] ?? CLUSTER_COLORS.orchestrator;
        const connectionActive = isConnectionActive(
          from,
          to,
          activeNodes,
          pulsingNodes,
        );
        const fromLit = isNodeLit(from, activeNodes, pulsingNodes);
        const toLit = isNodeLit(to, activeNodes, pulsingNodes);

        const stroke = connectionActive
          ? colors.active
          : fromLit || toLit
            ? colors.base.replace("0.18", "0.35")
            : colors.base;

        const strokeWidth = connectionActive ? 0.35 : 0.18;

        return (
          <line
            key={`line-${from}-${to}`}
            x1={fromPos.x}
            y1={fromPos.y}
            x2={toPos.x}
            y2={toPos.y}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={connectionActive ? "none" : "1.5 2.5"}
            filter={connectionActive ? "url(#glow-line)" : undefined}
            style={{ transition: "stroke 0.5s ease, stroke-width 0.5s ease" }}
          />
        );
      })}

      {/* Animated flowing particles on active connections */}
      {CONNECTIONS.flatMap(({ from, to, cluster }) => {
        const fromPos = NODE_POS[from];
        const toPos = NODE_POS[to];
        if (!fromPos || !toPos) return [];

        const connectionActive = isConnectionActive(
          from,
          to,
          activeNodes,
          pulsingNodes,
        );
        if (!connectionActive) return [];

        const colors = CLUSTER_COLORS[cluster] ?? CLUSTER_COLORS.orchestrator;
        const dx = toPos.x - fromPos.x;
        const dy = toPos.y - fromPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const duration = 0.8 + dist * 0.04;
        const numParticles = dist > 30 ? 3 : 2;

        const offsets = numParticles === 3 ? [0, 1, 2] : [0, 1];
        return offsets.map((pIdx) => (
          <FlowParticle
            key={`particle-${from}-${to}-p${pIdx}`}
            x1={fromPos.x}
            y1={fromPos.y}
            x2={toPos.x}
            y2={toPos.y}
            color={colors.particle}
            delay={(pIdx * duration) / numParticles}
            duration={duration}
          />
        ));
      })}
    </svg>
  );
}
