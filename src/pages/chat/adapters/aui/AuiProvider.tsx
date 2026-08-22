import type { ReactNode } from "react";
import type { Message } from "../../chatConstants";
import type { AttachedFile } from "../../hooks/useAttachments";

interface AuiProviderProps {
  /** Kept for API compatibility with ChatPage and SharedChatPage. */
  messages: Message[];
  isRunning: boolean;
  onNew?: (text: string) => void | Promise<void>;
  onEdit?: (parentIndex: number, newText: string) => void | Promise<void>;
  onReload?: (parentIndex: number) => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
  onFeedback?: (index: number, liked: boolean | null) => void;
  attachedFiles?: AttachedFile[];
  children: ReactNode;
}

/**
 * The current Megsy chat surface owns its message rendering, composer, tools,
 * and attachment state directly. The old assistant-ui bridge was not consumed
 * by those components and created an unstable tap external-store subscription
 * on every landing render. Keep this boundary intentionally transparent so
 * callsites remain compatible without mounting an unused runtime.
 */
export function AuiProvider({ children }: AuiProviderProps) {
  return <>{children}</>;
}
