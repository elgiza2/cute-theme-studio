import type { ReactNode } from "react";

interface MobileChatLandingProps {
  input: string;
  isLoading?: boolean;
  activePills?: unknown[];
  starterCardsSlot?: ReactNode;
}

/**
 * The mobile landing canvas deliberately has one responsibility: show the
 * shared service starters before a conversation begins. The composer owns the
 * input, active service chip, model controls, and integrations entry point.
 */
export default function MobileChatLanding({
  input,
  isLoading = false,
  activePills = [],
  starterCardsSlot,
}: MobileChatLandingProps) {
  const hasActiveMode = activePills.length > 0;
  const isReactive = input.trim().length > 0 || isLoading || hasActiveMode;

  return (
    <div
      className="md:hidden relative h-full w-full overflow-hidden text-foreground"
      style={{ background: "var(--chat-reference-bg, hsl(var(--background)))" }}
    >
      <div
        className="absolute inset-0 overflow-y-auto overflow-x-hidden overscroll-contain touch-pan-y px-5 pt-[max(env(safe-area-inset-top),16px)]"
        style={{ color: "#F5F5F7" }}
      >
        {!isReactive && starterCardsSlot ? (
          <div className="flex min-h-full items-end pb-[calc(7.5rem+env(safe-area-inset-bottom))]">
            {starterCardsSlot}
          </div>
        ) : null}
      </div>
    </div>
  );
}
