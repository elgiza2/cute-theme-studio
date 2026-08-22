// =====================================================================
// CENTRALIZED PRICING DATA — single source of truth for plans, services,
// FAQs, and enterprise features. Imported by /pricing and by the support
// chat's auto-built knowledge base so they NEVER drift apart.
// =====================================================================

export type PlanTier = "starter" | "pro" | "elite" | "business";

export const PLAN_MONTHLY_CREDITS: Record<PlanTier, number> = {
  starter: 70,
  pro: 240,
  elite: 500,
  business: 1200,
};

export interface PlanCardConfig {
  tier: PlanTier;
  name: string;
  label?: string;
  bg: string;
  text: string;
  subText: string;
  monthlyPrice: number;
  yearlyPrice: number;
  /** Optional promotional first-month price (e.g. Pro $7 intro). */
  firstMonthPrice?: number;
  monthlyCredits: string;
  yearlyCredits: string;
  features: string[];
  monthlyFeatures?: string[];
  yearlyFeatures?: string[];
  ctaBg: string;
  ctaText: string;
  ctaHover: string;
  bubbleColor: string;
  topBadge?: boolean;
  glow?: string;
  isDark?: boolean;
}

export const PLANS: PlanCardConfig[] = [
  {
    tier: "pro",
    name: "Pro",
    label: "",
    bg: "linear-gradient(165deg, #1e64ff 0%, #2563eb 55%, #1d4fd8 100%)",
    text: "#ffffff",
    subText: "rgba(255, 255, 255, 0.78)",
    monthlyPrice: 25,
    yearlyPrice: 250,
    firstMonthPrice: 7,

    monthlyCredits: `${PLAN_MONTHLY_CREDITS.pro} MC / month`,
    yearlyCredits: "2,880 MC delivered across the year",
    features: [
      "Megsy chat with access to the available models",
      "240 MC every month for images, video, slides, docs and code",
      "Plan usage and generation costs shown before you run",
      "Megsy OS access for multi-step work",
      "Team workspace included",
      "Priority email support",
      "Cancel anytime",
    ],
    monthlyFeatures: [
      "Megsy chat with access to the available models",
      "240 MC every month for images, video, slides, docs and code",
      "Plan usage and generation costs shown before you run",
      "Megsy OS access for multi-step work",
      "Team workspace included",
      "Priority email support",
      "Cancel anytime",
    ],
    yearlyFeatures: [
      "Pay for 10 months and get 12 months of access",
      "2,880 MC delivered across the year",
      "Locked-in price for the annual term",
      "Megsy chat with access to the available models",
      "Images, video, slides, docs and code use the MC balance",
      "Megsy OS access for multi-step work",
      "Team workspace included",
      "Priority email support",
    ],

    ctaBg: "#0b1020",
    ctaText: "#ffffff",
    ctaHover: "#15203f",
    bubbleColor: "rgba(147, 197, 253, 0.45)",
    isDark: true,
  },
  {
    tier: "elite",
    name: "Max",
    bg: "linear-gradient(165deg, #8b5cf6 0%, #7c3aed 55%, #6d28d9 100%)",
    text: "#ffffff",
    subText: "rgba(255, 255, 255, 0.78)",
    monthlyPrice: 59,
    yearlyPrice: 590,

    monthlyCredits: `${PLAN_MONTHLY_CREDITS.elite} MC / month`,
    yearlyCredits: "6,000 MC delivered across the year",
    features: [
      "Everything in Pro",
      "500 MC every month for premium generation",
      "Priority queue for faster generations",
      "Advanced presets, branding and analytics",
      "Megsy OS access for multi-step work",
      "Team workspace included",
      "24/7 priority chat support",
      "Cancel anytime",
    ],
    monthlyFeatures: [
      "Everything in Pro",
      "500 MC every month for premium generation",
      "Priority queue for faster generations",
      "Advanced presets, branding and analytics",
      "Megsy OS access for multi-step work",
      "Team workspace included",
      "24/7 priority chat support",
      "Cancel anytime",
    ],
    yearlyFeatures: [
      "Pay for 10 months and get 12 months of access",
      "6,000 MC delivered across the year",
      "Locked-in price for the annual term",
      "Everything in Pro",
      "500 MC every month for premium generation",
      "Priority queue for faster generations",
      "Advanced presets, branding and analytics",
      "Megsy OS access for multi-step work",
      "Team workspace included",
      "24/7 priority chat support",
    ],

    ctaBg: "#0b0420",
    ctaText: "#ffffff",
    ctaHover: "#1a0a3a",
    bubbleColor: "rgba(216, 180, 254, 0.45)",
    topBadge: true,
    isDark: true,
  },
];


export const ENTERPRISE_FEATURES: string[] = [
  "Custom MC Allocation",
  "Priority Megsy AI compute lane",
  "Dedicated Infrastructure",
  "SLA Guarantees",
  "Custom API Access & Integrations",
  "Enterprise Security (SOC2-ready, GDPR & Advanced Encryption)",
  "Data Privacy & Compliance",
  "Early access to new Megsy capabilities",
  "Advanced Analytics & Reporting",
  "Dedicated Account Manager",
  "24/7 Priority Support",
  "Priority Onboarding & Training",
  "Monthly Business Reviews",
  "Volume Discounts",
  "Custom Contract, Invoicing & Billing",
];

export const SERVICES_GUIDE: { name: string; desc: string }[] = [
  {
    name: "Unlimited Chat",
    desc: "Talk to Megsy AI — our own model, with no daily caps. Free plan uses Megsy Lite.",
  },
  {
    name: "Image Generation",
    desc: "Generate images with the MC balance shown for the selected model. The picker displays the model cost before generation.",
  },
  {
    name: "Slides & Presentations",
    desc: "Create complete slide decks from a prompt and export them as editable presentations. Each run uses the plan's MC balance.",
  },
  {
    name: "Docs & Deep Research",
    desc: "Create long-form documents and multi-source research reports with citations. Usage is shown before the run.",
  },
  {
    name: "Code Builder",
    desc: "Build full apps and websites in natural language, with a clean Coder workspace and one-click deploy where enabled.",
  },
  {
    name: "Video Generation",
    desc: "Generate videos on every paid plan. Each video uses MC from your monthly balance — never charged extra outside your plan.",
  },
  {
    name: "Megsy OS",
    desc: "Your autonomous 24/7 agent. Runs tasks, monitors projects, and executes multi-step work in the background. Unlimited on all paid plans.",
  },
  {
    name: "Megsy Credits (MC)",
    desc: "Credits cover video generation and any usage outside your plan windows. Credits reset at the start of each billing cycle and don't roll over.",
  },
  {
    name: "Team Workspace",
    desc: "Shared projects, files, and chats for your team. Pro+ includes seats; Business is unlimited.",
  },
  {
    name: "Priority Queue",
    desc: "Elite & Business get 3× faster generation speeds and skip the standard queue.",
  },
];

export const FAQS: { q: string; a: string }[] = [
  {
    q: "Can I change or cancel my plan anytime?",
    a: "Yes. From your Billing settings you can upgrade, downgrade, or cancel anytime. Upgrades are prorated and take effect immediately; downgrades and cancellations take effect at the end of the current billing cycle, and you keep full access until then.",
  },
  {
    q: "What's the difference between the 'unlimited window' and Megsy Credits (MC)?",
    a: "Your subscription includes a monthly MC balance. Image, video, slides, docs, research and code runs consume the displayed balance according to the selected service or model; chat access is available according to your plan entitlement.",
  },
  {
    q: "What happens when I run out of MC?",
    a: "You can continue using services that your entitlement allows, while generation features draw from MC. You can top up MC from Billing or wait for the next renewal; the monthly balance refreshes at the start of each billing cycle.",
  },
  {
    q: "Do unused credits roll over?",
    a: "No. The subscription rows currently provision the standard monthly MC allowance across the billing term: Pro provides 240 MC per month and Max provides 500 MC per month. Annual checkout provisions the corresponding 12-month total.",
  },
  {
    q: "Do prices include tax?",
    a: "Prices are shown excluding tax. VAT/GST is calculated and added at checkout based on your billing country, and the final amount is shown before you confirm payment.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes — new paid subscriptions (Pro and above) include a 7-day no-questions-asked refund window, provided no more than 10% of your included credits have been consumed. Credit packs are non-refundable once any credit from the pack has been spent. Failed generations are auto-refunded within minutes. Email support@megsyai.com (subject: \"Refund Request\") and we respond within 5 business days.",
  },
  {
    q: "Is my payment secure? Which payment methods do you accept?",
    a: "All payments are processed by Dodo Payments, a PCI-DSS Level 1 merchant of record. Your card details never touch our servers. We accept Visa, Mastercard, American Express, JCB, UnionPay, Apple Pay, Google Pay, Amazon Pay and WeChat Pay, with 3-D Secure 2 on eligible transactions. Your bank statement will show \"DODO * MEGSY AI\".",
  },
  {
    q: "Do you offer team or enterprise plans?",
    a: "Yes. The Business plan includes unlimited team seats, SSO/SAML, dedicated infrastructure, a 99.9% SLA and a success manager. For custom MC allocation, custom contracts, volume discounts or API/integration needs, contact our enterprise team via the Enterprise page or support@megsyai.com.",
  },
];

