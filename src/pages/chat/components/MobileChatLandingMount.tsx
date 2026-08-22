import MobileChatLanding from "@/components/chat/mobile/MobileChatLanding";
import { type AgentDef } from "@/lib/agentRegistry";
import { type ChatMode } from "../chatConstants";
import StarterCards, { type StarterServiceId } from "./StarterCards";

interface MobileChatLandingMountProps {
  input: string;
  setInput: (v: string) => void;
  isLoading: boolean;
  activeResearchJobId: string | null;
  chatMode: ChatMode;
  selectedAgent: AgentDef | null;
  handleModeChange: (m: ChatMode) => void;
  onOpenService?: (service: StarterServiceId) => void;
}

export function MobileChatLandingMount({
  input,
  setInput,
  isLoading,
  activeResearchJobId,
  chatMode,
  selectedAgent,
  handleModeChange,
  onOpenService,
}: MobileChatLandingMountProps) {
  const modeByService: Partial<Record<StarterServiceId, ChatMode>> = {
    research: "deep-research",
    image: "images",
    video: "video",
    slides: "slides",
    code: "code",
    learning: "learning",
    audio: "music",
  };

  return (
    <MobileChatLanding
      input={input}
      isLoading={isLoading || !!activeResearchJobId}
      starterCardsSlot={
        chatMode === "normal" && !selectedAgent ? (
          <StarterCards
            className="mb-3"
            onPick={setInput}
            onChooseService={(service) => {
              const mode = modeByService[service];
              if (mode) {
                handleModeChange(mode);
                return;
              }
              onOpenService?.(service);
            }}
          />
        ) : null
      }
    />
  );
}
