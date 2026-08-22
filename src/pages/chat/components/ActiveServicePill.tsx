import { memo } from "react";
import {
  X,
  Code2,
  Image as ImageIcon,
  Video,
  Music,
  Microscope,
  Presentation,
  FileText,
  GraduationCap,
  Monitor,
} from "lucide-react";
import type { AgentDef } from "@/lib/agentRegistry";

type ChipId =
  | "code"
  | "images"
  | "video"
  | "music"
  | "deep-research"
  | "slides"
  | "slides-images"
  | "docs"
  | "learning"
  | "operator";

type ChipConfig = { label: string; color: string; Icon: React.ElementType };

const MODES: Partial<Record<ChipId, ChipConfig>> = {
  code: { label: "Coder", color: "var(--mode-code)", Icon: Code2 },
  images: { label: "Images", color: "hsl(var(--brand-mint))", Icon: ImageIcon },
  video: { label: "Videos", color: "var(--mode-video)", Icon: Video },
  music: { label: "Music", color: "hsl(var(--brand-blush))", Icon: Music },
  "deep-research": { label: "Deep Research", color: "hsl(var(--brand-blush))", Icon: Microscope },
  slides: { label: "Slides", color: "var(--mode-slides)", Icon: Presentation },
  "slides-images": { label: "Slides", color: "var(--mode-slides)", Icon: Presentation },
  docs: { label: "Docs", color: "var(--mode-docs)", Icon: FileText },
  learning: { label: "Learning", color: "var(--mode-learning)", Icon: GraduationCap },
  operator: { label: "Megsy Agent", color: "#8de1c1", Icon: Monitor },
};

interface ActiveServicePillProps {
  chatMode: string;
  selectedAgent: AgentDef | null;
  onClear: () => void;
}

function ActiveServicePillImpl({ chatMode, selectedAgent, onClear }: ActiveServicePillProps) {
  const modeConfig = MODES[chatMode as ChipId];
  const config: ChipConfig | null =
    selectedAgent?.id === "docs"
      ? MODES.docs ?? null
      : modeConfig ??
        (selectedAgent
          ? {
              label: selectedAgent.id === "computer" ? "Megsy Agent" : selectedAgent.label,
              color: selectedAgent.color,
              Icon: selectedAgent.icon,
            }
          : null);

  if (!config) return null;
  const { label, color, Icon } = config;

  return (
    <div
      data-service-indicator="true"
      className="inline-flex h-7 items-center gap-1.5 rounded-full border border-white/[0.14] bg-white/[0.06] px-2.5 text-[11px] font-semibold text-white/80"
    >
      <Icon size={12} strokeWidth={2.4} style={{ color }} />
      <span className="leading-none">{label}</span>
      <button
        type="button"
        onClick={onClear}
        aria-label={`Clear ${label}`}
        className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-white/45 transition-colors hover:bg-white/[0.12] hover:text-white"
      >
        <X size={10} strokeWidth={2.6} />
      </button>
    </div>
  );
}

export const ActiveServicePill = memo(ActiveServicePillImpl);
export default ActiveServicePill;
