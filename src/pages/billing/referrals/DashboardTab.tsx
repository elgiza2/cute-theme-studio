import { useEffect, useMemo, useState } from "react";
import { Check, Copy, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { EmptyState, fmtDate, useReferrals } from "../ReferralsPage";

const SIGNUP_POINTS = 100;
const SUBSCRIPTION_POINTS = 400;

const REWARDS = [
  {
    id: "monthly",
    name: "Monthly membership",
    description: "One full month of Megsy AI",
    points: 3500,
    stock: 100,
    accent: "#d9f3e5",
    accentText: "#10251d",
    image: "/referrals/aura-monthly.png",
  },
  {
    id: "annual",
    name: "Annual membership",
    description: "A full year of creative tools",
    points: 12000,
    stock: 100,
    accent: "#f4ddc7",
    accentText: "#2b1d12",
    image: "/referrals/aura-annual.png",
  },
] as const;

type Reward = (typeof REWARDS)[number];

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);

const statLabel = "text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45";
const card = "rounded-[24px] border border-white/[0.09] bg-[#121619]";

export default function DashboardTab() {
  const { userId, refs, signups, link, code, justCopied, copyLink, shareLink } = useReferrals();
  const db = supabase as any;
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [claimed, setClaimed] = useState<string[]>([]);
  const [redeemedCounts, setRedeemedCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const loadRewards = async () => {
      const [{ data: catalog }, { data: redemptions }] = await Promise.all([
        db.from("referral_reward_catalog").select("id, stock_redeemed").eq("active", true),
        db.from("referral_reward_redemptions").select("reward_id").eq("user_id", userId),
      ]);
      if (cancelled) return;
      setRedeemedCounts(
        Object.fromEntries(
          (catalog ?? []).map((item: { id: string; stock_redeemed: number }) => [item.id, item.stock_redeemed]),
        ),
      );
      setClaimed((redemptions ?? []).map((item: { reward_id: string }) => item.reward_id));
    };
    void loadRewards();
    return () => {
      cancelled = true;
    };
  }, [db, userId]);

  const activeReferrals = refs.filter((ref) => ref.status === "active" || ref.status === "approved").length;
  const points = signups * SIGNUP_POINTS + activeReferrals * SUBSCRIPTION_POINTS;
  const nextReward = REWARDS.find((reward) => reward.points > points) ?? REWARDS[1];
  const progress = Math.min(100, Math.round((points / nextReward.points) * 100));
  const totalRewardSlots = REWARDS.reduce(
    (total, reward) => total + Math.max(0, reward.stock - (redeemedCounts[reward.id] ?? 0)),
    0,
  );

  const activity = useMemo(
    () =>
      refs
        .map((ref, index) => ({
          id: `ref-${ref.id}`,
          title: `New invite ${String(index + 1).padStart(2, "0")}`,
          date: ref.created_at,
          meta: ref.status === "pending" ? "Awaiting confirmation" : "Points credited",
          points: ref.status === "pending" ? 0 : SIGNUP_POINTS,
        }))
        .slice(0, 4),
    [refs],
  );

  const redeem = async () => {
    if (!selectedReward) return;
    if (points < selectedReward.points) {
      toast.error(`You need ${formatNumber(selectedReward.points - points)} more points`);
      return;
    }
    if (claimed.includes(selectedReward.id)) {
      toast.info("You already requested this membership");
      return;
    }
    const { data, error } = await db.rpc("redeem_referral_reward", { p_reward_id: selectedReward.id });
    const result = data as { success?: boolean; error?: string } | null;
    if (error || !result?.success) {
      toast.error(result?.error || error?.message || "We could not submit your request right now");
      return;
    }
    setClaimed((current) => [...current, selectedReward.id]);
    setRedeemedCounts((current) => ({ ...current, [selectedReward.id]: (current[selectedReward.id] ?? 0) + 1 }));
    setSelectedReward(null);
    toast.success("Your membership request was submitted");
  };

  return (
    <main
      dir="ltr"
      className="mx-auto w-full max-w-[1180px] px-4 pb-20 pt-5 text-foreground sm:px-6 lg:px-10 lg:pt-8"
    >
      <header className="relative overflow-hidden rounded-[28px] border border-white/[0.1] bg-[#101416] p-5 sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -left-28 -top-32 h-80 w-80 rounded-full bg-[#cfe9dc]/[0.08] blur-[90px]" />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_360px] lg:gap-12">
          <div className="max-w-[600px]">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d9f3e5]" />
              <p className={statLabel}>Earn with Megsy</p>
            </div>
            <h1 className="mt-5 max-w-[580px] text-[36px] font-semibold leading-[1.02] tracking-[-0.06em] text-white sm:text-[52px]">
              Turn trusted invites into membership.
            </h1>
            <p className="mt-5 max-w-[510px] text-[14px] leading-7 text-white/60">
              Share your personal link, collect points when friends join, and redeem them for a monthly or annual Megsy AI membership.
            </p>
            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={() => void shareLink()}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#d9f3e5] px-5 text-[13px] font-bold text-[#10251d] shadow-[0_12px_30px_-18px_rgba(217,243,229,0.9)] transition hover:bg-white active:scale-[0.98]"
              >
                Share invite link
                <ArrowUpRight className="ml-2 h-4 w-4" strokeWidth={2.5} />
              </button>
              <div className="inline-flex h-11 items-center justify-center rounded-xl border border-white/[0.16] bg-white/[0.05] px-4 text-[12px] font-medium text-white/75">
                <span className="mr-2 text-white/45">Your code</span>
                <span className="font-mono text-white">{code || "Creating..."}</span>
              </div>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[360px] overflow-hidden rounded-[24px] border border-white/[0.12] bg-[#191d20] shadow-[0_28px_70px_-38px_rgba(0,0,0,0.95)]">
            <img
              src="/referrals/aura-hero.png"
              alt=""
              className="block aspect-square w-full object-cover"
              loading="eager"
              decoding="async"
            />
            <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/[0.14] bg-[#0e1214]/85 px-4 py-3 backdrop-blur-xl">
              <p className={statLabel}>Current balance</p>
              <p className="mt-1 text-[27px] font-semibold tracking-[-0.05em] text-white">
                {formatNumber(points)} <span className="text-[11px] font-medium tracking-normal text-white/45">points</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="mt-3 grid gap-3 lg:grid-cols-[1.08fr_0.92fr] lg:gap-4">
        <div className={cn(card, "p-5 sm:p-7")}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={statLabel}>Progress</p>
              <h2 className="mt-2 text-[20px] font-semibold tracking-[-0.03em] text-white">Next reward: {nextReward.name}</h2>
            </div>
            <span className="rounded-full bg-white/[0.07] px-2.5 py-1 text-[11px] font-semibold text-white/70">{progress}%</span>
          </div>
          <Progress value={progress} className="mt-6 h-2 bg-white/[0.08] [&>div]:bg-[#d9f3e5]" />
          <p className="mt-3 text-[11px] text-white/45">{formatNumber(Math.max(0, nextReward.points - points))} points remaining</p>
          <div className="mt-7 grid grid-cols-3 divide-x divide-white/[0.09] text-center">
            <div>
              <p className="text-[25px] font-semibold tracking-[-0.04em] text-white">{signups}</p>
              <p className="mt-1 text-[10px] text-white/45">Invites</p>
            </div>
            <div>
              <p className="text-[25px] font-semibold tracking-[-0.04em] text-white">{activeReferrals}</p>
              <p className="mt-1 text-[10px] text-white/45">Subscribers</p>
            </div>
            <div>
              <p className="text-[25px] font-semibold tracking-[-0.04em] text-white">{totalRewardSlots}</p>
              <p className="mt-1 text-[10px] text-white/45">Reward slots</p>
            </div>
          </div>
        </div>

        <div className={cn(card, "p-5 sm:p-7")}>
          <p className={statLabel}>Invite link</p>
          <h2 className="mt-2 text-[20px] font-semibold tracking-[-0.03em] text-white">Ready to share.</h2>
          <div className="mt-5 flex min-h-11 items-center overflow-hidden rounded-xl border border-white/[0.12] bg-[#0c1012] px-3 text-left font-mono text-[11px] text-white/75" dir="ltr">
            <span className="truncate">{link || "Creating your link..."}</span>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => void copyLink()}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-[#d9f3e5] text-[12px] font-bold text-[#10251d] transition hover:bg-white active:scale-[0.98]"
            >
              {justCopied ? <Check className="mr-1.5 h-3.5 w-3.5" strokeWidth={2.8} /> : <Copy className="mr-1.5 h-3.5 w-3.5" strokeWidth={2.2} />}
              {justCopied ? "Copied" : "Copy link"}
            </button>
            <button
              type="button"
              onClick={() => void shareLink()}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-white/[0.18] bg-white/[0.06] text-[12px] font-semibold text-white transition hover:bg-white/[0.11] active:scale-[0.98]"
            >
              Share
            </button>
          </div>
          <p className="mt-3 text-[10px] text-white/45">
            Referral code: <span className="font-mono text-white/80">{code || "—"}</span>
          </p>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className={statLabel}>Membership rewards</p>
            <h2 className="mt-2 text-[25px] font-semibold tracking-[-0.04em] text-white">Redeem your points.</h2>
          </div>
          <span className="text-right text-[11px] text-white/45">100 available per reward</span>
        </div>
        <div className="grid gap-3 lg:grid-cols-2 lg:gap-4">
          {REWARDS.map((reward) => {
            const enough = points >= reward.points;
            const alreadyClaimed = claimed.includes(reward.id);
            const remaining = Math.max(0, reward.stock - (redeemedCounts[reward.id] ?? 0));
            return (
              <article key={reward.id} className={cn(card, "relative min-h-[265px] overflow-hidden p-5 sm:p-7")}>
                <img src={reward.image} alt="" className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 object-cover opacity-45 mix-blend-screen" loading="lazy" decoding="async" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#121619] via-[#121619]/95 to-transparent" />
                <div className="relative flex h-full min-h-[215px] flex-col justify-between">
                  <div>
                    <p className={statLabel}>Membership reward</p>
                    <h3 className="mt-4 text-[22px] font-semibold tracking-[-0.04em] text-white">{reward.name}</h3>
                    <p className="mt-1.5 text-[12px] text-white/55">{reward.description}</p>
                  </div>
                  <div className="mt-8 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[26px] font-semibold tracking-[-0.05em] text-white">
                        {formatNumber(reward.points)} <span className="text-[10px] font-medium tracking-normal text-white/45">points</span>
                      </p>
                      <p className="mt-1 text-[10px] text-white/45">{remaining} of {reward.stock} remaining</p>
                    </div>
                    <button
                      type="button"
                      disabled={!enough || alreadyClaimed || remaining === 0}
                      onClick={() => setSelectedReward(reward)}
                      className="h-10 rounded-xl px-4 text-[12px] font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:border-white/[0.1] disabled:bg-white/[0.07] disabled:text-white/40"
                      style={enough && !alreadyClaimed && remaining > 0 ? { backgroundColor: reward.accent, color: reward.accentText } : undefined}
                    >
                      {alreadyClaimed ? "Requested" : remaining === 0 ? "Unavailable" : enough ? "Redeem" : "Not enough"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-10 grid gap-3 lg:grid-cols-[0.82fr_1.18fr] lg:gap-4">
        <div className={cn(card, "p-5 sm:p-7")}>
          <p className={statLabel}>How it works</p>
          <h2 className="mt-2 text-[20px] font-semibold tracking-[-0.03em] text-white">Simple, transparent rewards.</h2>
          <div className="mt-6 space-y-5">
            {[
              { title: "Share your link", body: "Send your personal invite to someone who will enjoy Megsy AI." },
              { title: "They join", body: "You earn points when their signup is confirmed." },
              { title: "Redeem", body: "Use your points for a monthly or annual membership." },
            ].map((step, index) => (
              <div key={step.title} className="flex gap-3.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/[0.14] bg-white/[0.05] font-mono text-[10px] text-white/70">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <p className="text-[13px] font-semibold text-white/90">{step.title}</p>
                  <p className="mt-1 text-[11px] leading-5 text-white/50">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={cn(card, "p-5 sm:p-7")}>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className={statLabel}>Activity</p>
              <h2 className="mt-2 text-[20px] font-semibold tracking-[-0.03em] text-white">Recent activity.</h2>
            </div>
            <span className="text-[11px] text-white/45">Live from your account</span>
          </div>
          {activity.length === 0 ? (
            <EmptyState title="No activity yet" hint="Share your link to get your first invite." />
          ) : (
            <div className="mt-5 divide-y divide-white/[0.08]">
              {activity.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 py-3.5 first:pt-0">
                  <div>
                    <p className="text-[12px] text-white/85">{item.title}</p>
                    <p className="mt-1 text-[10px] text-white/45">{item.meta} · {fmtDate(item.date)}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-[#d9f3e5]">{item.points ? `+${formatNumber(item.points)}` : "Pending"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedReward ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm" onClick={() => setSelectedReward(null)}>
          <div className="w-full max-w-md overflow-hidden rounded-[26px] border border-white/[0.14] bg-[#171b1e] shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="relative h-32 overflow-hidden bg-[#111517]">
              <img src={selectedReward.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-75" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171b1e] to-transparent" />
            </div>
            <div className="p-6">
              <p className={statLabel}>Confirm redemption</p>
              <h2 className="mt-3 text-[23px] font-semibold tracking-[-0.04em] text-white">{selectedReward.name}</h2>
              <p className="mt-3 text-[12px] leading-6 text-white/60">This will submit a request for membership activation using {formatNumber(selectedReward.points)} points.</p>
              <div className="mt-6 flex gap-2">
                <button type="button" onClick={() => setSelectedReward(null)} className="h-11 flex-1 rounded-xl border border-white/[0.16] bg-white/[0.05] text-[12px] font-semibold text-white/75 transition hover:bg-white/[0.1]">Cancel</button>
                <button type="button" onClick={() => void redeem()} className="h-11 flex-1 rounded-xl bg-[#d9f3e5] text-[12px] font-bold text-[#10251d] transition hover:bg-white">Confirm request</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
