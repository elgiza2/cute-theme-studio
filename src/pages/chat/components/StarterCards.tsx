import { useState } from "react";
import { X } from "lucide-react";

export type StarterServiceId =
  | "research"
  | "image"
  | "video"
  | "slides"
  | "code"
  | "learning"
  | "audio"
  | "skill"
  | "mcp"
  | "integrations";

export interface StarterCardsProps {
  /** Fills the composer with the card prompt. */
  onPick: (prompt: string) => void;
  /** Optionally activates the real service or opens its management page. */
  onChooseService?: (service: StarterServiceId) => void;
  className?: string;
}

const CARD_IMAGES: Record<StarterServiceId, string> = {
  research: "/service-chips/svc-research-new.jpg",
  image: "/service-chips/svc-image-new.jpg",
  video: "/service-chips/svc-video-new.jpg",
  slides: "/service-chips/svc-slides-new.jpg",
  code: "/service-chips/svc-code-new.jpg",
  learning: "/service-chips/svc-learning-new.jpg",
  audio: "/service-chips/svc-audio-new.jpg",
  skill: "/service-chips/svc-skill-new.jpg",
  mcp: "/service-chips/svc-mcp-new.jpg",
  integrations: "/service-chips/svc-integrations-new.jpg",
};

/** Real service suggestions shown before the first message. */
const CARDS: Array<{
  id: StarterServiceId;
  title: string;
  desc: string;
  prompt: string;
}> = [
  {
    id: "research",
    title: "Deep research",
    desc: "A structured report with trusted sources.",
    prompt: "Do deep, structured research with sources about: ",
  },
  {
    id: "slides",
    title: "Create slides",
    desc: "A complete presentation with one clean template.",
    prompt: "Create a complete presentation about: ",
  },
  {
    id: "code",
    title: "Build with code",
    desc: "A real project with a focused live preview.",
    prompt: "Write code for a project: ",
  },
  {
    id: "image",
    title: "Generate images",
    desc: "Create visuals from a simple written idea.",
    prompt: "Generate an image of: ",
  },
  {
    id: "video",
    title: "Generate video",
    desc: "Turn a concept into a short moving scene.",
    prompt: "Generate a short video about: ",
  },
  {
    id: "learning",
    title: "Learn something",
    desc: "A guided explanation that adapts as you ask.",
    prompt: "Teach me about: ",
  },
  {
    id: "audio",
    title: "Create audio",
    desc: "Produce a voice, sound or music direction.",
    prompt: "Create audio for: ",
  },
  {
    id: "skill",
    title: "Add a skill",
    desc: "Turn a repeatable workflow into a reusable skill.",
    prompt: "Create a reusable skill for: ",
  },
  {
    id: "mcp",
    title: "Connect MCP",
    desc: "Add a tool server and test its capabilities.",
    prompt: "Help me connect an MCP server for: ",
  },
  {
    id: "integrations",
    title: "Connect integrations",
    desc: "Link the apps you want Megsy to use.",
    prompt: "Help me connect an integration for: ",
  },
];

export function StarterCards({ onPick, onChooseService, className = "" }: StarterCardsProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between px-2 pb-2">
        <span className="text-[13px] font-medium text-foreground/70">Start with a service</span>
        <button
          type="button"
          aria-label="Hide suggestions"
          onClick={() => setDismissed(true)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-foreground/10 bg-foreground/[0.04] text-foreground/50 transition-colors hover:bg-foreground/[0.08] hover:text-foreground/80"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex gap-2.5 overflow-x-auto px-2 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x">
        {CARDS.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => {
              onChooseService?.(card.id);
              onPick(card.prompt);
            }}
            className="group snap-start shrink-0 w-[84%] max-w-[330px] flex items-center gap-3 rounded-[18px] border border-white/[0.08] bg-[color:var(--chat-claude-composer,#262627)] px-3.5 py-3 text-start shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-white/[0.08] active:scale-[0.99]"
          >
            <span className="relative h-[58px] w-[58px] shrink-0 overflow-hidden rounded-[15px] bg-black/20 ring-1 ring-white/[0.1]">
              <img
                src={CARD_IMAGES[card.id]}
                alt=""
                loading="lazy"
                decoding="async"
                width={512}
                height={512}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10" />
            </span>
            <span className="min-w-0 flex flex-col gap-1">
              <span className="truncate text-[15px] font-bold leading-tight text-foreground">{card.title}</span>
              <span className="line-clamp-2 text-[12.5px] leading-snug text-foreground/55">{card.desc}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default StarterCards;
