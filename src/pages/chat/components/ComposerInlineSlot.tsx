import type { ChatMode } from "../chatConstants";
import type { AgentDef } from "@/lib/agentRegistry";

interface ComposerInlineSlotProps {
  isMobileViewport: boolean;
  chatMode: ChatMode;
  setChatMode?: (m: ChatMode) => void;
  tierMenuOpen: boolean;
  setTierMenuOpen: (v: boolean) => void;
  selectedModel: any;
  setSelectedModel: (m: any) => void;
  megsyTier: any;
  setMegsyTier: (t: any) => void;
  userPlan: string | null | undefined;
  mediaModel: any;
  setMediaModel: (m: any) => void;
  chatUserId: string | null;
  selectedAgent: AgentDef | null;
  slidesTemplate: any;
  setSlidesPickerOpen: (v: boolean) => void;
  researchDepth: any;
  setResearchDepth: (v: any) => void;
  researchDepthOpen: boolean;
  setResearchDepthOpen: (v: boolean) => void;
  setVideoDurationSec?: (n: any) => void;
}

/**
 * Kept as a compatibility slot for the assistant-ui composer.
 * Service identity and controls are rendered by the shared header slots now,
 * so this slot must stay empty to prevent duplicate pills.
 */
export function ComposerInlineSlot(_props: ComposerInlineSlotProps) {
  return null;
}

export default ComposerInlineSlot;
