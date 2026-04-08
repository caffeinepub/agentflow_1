# Design Brief

## Purpose
Interactive AI agent orchestration interface—visualizing query flows from input through specialized agents (Travel, Trading, General) to results. Spatial UI: diagram is the interface, no form-based chrome.

## Tone
Precision + energy. Industrial-clean dark base with strategic glow accents. Purposeful motion, never frivolous. Each agent type has unique color signature. System feels alive without chaos.

## Palette

| Token | OKLCH | Hue | Usage |
|-------|-------|-----|-------|
| Travel Agent | `0.68 0.18 110` | Saturated green | Exploratory, location-based queries |
| Trading Agent | `0.72 0.21 65` | Warm amber | Action-oriented, market data |
| General Agent | `0.55 0.23 20` | Deep crimson | Grounded, cerebral queries |
| Orchestrator | `0.75 0.15 280` | Cool purple | Central hub, unifying |
| Memory Store | `0.50 0.08 180` | Subtle teal | Archival, persistent context |
| Background | `0.08 0.01 280` | Deep space | Full-screen canvas |
| Foreground | `0.92 0.02 280` | Near-white | Text, labels, highlights |

## Typography
- **Display/Labels**: Bricolage Grotesque (geometric, tech-forward, distinctive node labels)
- **Body**: General Sans (refined, readable descriptions and agent details)
- **Mono**: Geist Mono (technical labels, query IDs, code-like elements)

## Structural Zones
- **Canvas**: Full-screen dark background, orchestrator center, agents radial, tools subordinate, memory bottom
- **Query History Panel**: Right side (side panel), past queries routed to selected agent
- **Status Bar**: Top-right minimal indicators (real-time flow)

## Elevation & Depth
- **Card Layer**: `0.12 0.01 280` (nodes slightly raised)
- **Shadows**: `shadow-node` for inactive, `shadow-node-lg` for active/hovered
- **Glow Effects**: Color-coded halos via custom utilities—`glow-travel`, `glow-trading`, `glow-general`, `glow-orchestrator`, `glow-memory`

## Component Patterns
- **Nodes**: Circles (orchestrator, memory) and rounded squares (agents, tools)
- **Connections**: Animated lines with stroke dashes, flowing animation
- **Active States**: Glow intensity increases, brightness shifts up, connected nodes light up
- **Interaction**: Click to focus, hover for detail tooltip

## Motion
- **Flow Pulse** (`flow-pulse`): 2s ease-in-out, opacity shift for query activity
- **Node Glow** (`node-glow`): 1.5s loop, breathing glow when active
- **Connection Flow** (`connection-flow`): 2s linear, animated dash offset along connection paths

## Spacing & Rhythm
- **Radius**: `0.375rem` (tight, clean geometric feel)
- **Gaps**: Radial spacing from orchestrator outward; 12–16px gaps between diagram layers
- **Density**: High visual density in diagram; negative space around edges

## Constraints
- Dark mode only—no light theme toggle
- Full-screen canvas-based rendering (React + Motion library)
- No scrolling in diagram area; responsive canvas resizing
- Minimal text labels to preserve clarity

## Signature Detail
Nodes emit animated halos synchronized with query flow. When a query routes through an agent, that agent node pulses and its connected tool nodes light up sequentially. Connection paths glow with the agent's color. This creates a "neural activation" feel—abstract but intuitive.
