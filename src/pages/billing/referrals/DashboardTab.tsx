import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState, fmtDate, useReferrals } from "../ReferralsPage";

const POINTS_PER_SIGNUP = 100;
const POINTS_PER_SUBSCRIPTION = 400;

const REWARDS = [
  {
    id: "monthly",
    name: "Monthly subscription",
    description: "One full month of Megsy AI, on us",
    points: 3500,
    stock: 100,
    accent: "#CFE0FF",
    image: "/referrals/aura-orbit.png",
    featured: false,
  },
  {
    id: "annual",
    name: "Annual subscription",
    description: "The best value — a full year of creativity",
    points: 12000,
    stock: 100,
    accent: "#F2D6BE",
    image: "/referrals/aura-spark.png",
    featured: true,
  },
] as const;

const formatNumber = (value: number) => new Intl.NumberFormat("ar-EG").format(value);

export default function DashboardTab() {
  const navigate = useNavigate();
  const { userId, refs, earns, wds, signups, link, code, justCopied, copyLink, shareLink } = useReferrals();
  const db = supabase as any;
  const [selectedReward, setSelectedReward] = useState<(typeof REWARDS)[number] | null>(null);
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
      setRedeemedCounts(Object.fromEntries((catalog ?? []).map((item: { id: string; stock_redeemed: number }) => [item.id, item.stock_redeemed])));
      setClaimed((redemptions ?? []).map((item: { reward_id: string }) => item.reward_id));
    };
    loadRewards();
    return () => { cancelled = true; };
  }, [userId]);

  const activeReferrals = refs.filter((ref) => ref.status === "active" || ref.status === "approved").length;
  const points = signups * POINTS_PER_SIGNUP + activeReferrals * POINTS_PER_SUBSCRIPTION;
  const nextReward = REWARDS.find((reward) => reward.points > points) ?? REWARDS[1];
  const progress = Math.min(100, Math.round((points / nextReward.points) * 100));
  const availableSubscriptions = Math.max(0, 100 - Math.max(...Object.values(redeemedCounts), 0));

  const activity = useMemo(() => refs.map((ref, index) => ({
    id: `ref-${ref.id}`,
    title: `New invite #${index + 1}`,
    date: ref.created_at,
    meta: ref.status === "pending" ? "Awaiting confirmation" : "Points credited",
    points: ref.status === "pending" ? 0 : POINTS_PER_SIGNUP,
  })).slice(0, 5), [refs]);

  const redeem = async () => {
    if (!selectedReward) return;
    if (points < selectedReward.points) {
      toast.error(`You need ${formatNumber(selectedReward.points - points)} more points`);
      return;
    }
    if (claimed.includes(selectedReward.id)) {
      toast.info("You already requested this reward");
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
    toast.success("Your redemption request was submitted");
  };

  return (
    <main dir="rtl" className="mx-auto w-full max-w-[1180px] px-4 pb-16 pt-5 text-[#f8f8f6] sm:px-6 lg:px-10 lg:pt-9">
      <header className="relative overflow-hidden rounded-[32px] border border-white/[.08] bg-[#111315] px-5 pb-5 pt-7 sm:px-10 sm:pb-8 sm:pt-9">
        <div className="pointer-events-none absolute -left-20 -top-28 h-80 w-80 rounded-full bg-[#b9cdfc]/[.12] blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-36 right-1/3 h-72 w-72 rounded-full bg-[#f0c9bc]/[.09] blur-[100px]" />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_.84fr]">
          <div className="max-w-[560px]">
            <div className="mb-5 inline-flex rounded-full border border-white/[.11] bg-white/[.035] px-3 py-1.5 text-[11px] text-white/60">REWARDS SPACE</div>
            <h1 className="max-w-[520px] text-[36px] font-semibold leading-[1.08] tracking-[-.055em] sm:text-[52px]">Share something good.<br /><span className="text-white/45">Earn something better.</span></h1>
            <p className="mt-5 max-w-[470px] text-[14px] leading-7 text-white/48">Every successful invite moves you closer to a free subscription. Earn points from friends and redeem them when it suits you.</p>
            <div className="mt-7 flex flex-wrap items-center gap-3"><button onClick={() => shareLink()} className="inline-flex h-11 items-center rounded-xl bg-white px-5 text-[13px] font-semibold text-[#101113] transition hover:bg-[#e9edf3]">Share your link</button><span className="text-[12px] text-white/35">100 points for every eligible signup</span></div>
          </div>
          <div className="relative mx-auto h-[260px] w-full max-w-[390px] sm:h-[320px]">
            <div className="absolute inset-8 rounded-full bg-[#b9cdfc]/[.08] blur-3xl" />
            <img src="/referrals/aura-flow.png" alt="" className="absolute left-[3%] top-[12%] w-[58%] -rotate-12 opacity-80 mix-blend-screen" />
            <img src="/referrals/aura-orbit.png" alt="" className="absolute right-[4%] top-[-6%] w-[67%] rotate-[12deg] mix-blend-screen" />
            <img src="/referrals/aura-spark.png" alt="" className="absolute bottom-[-16%] left-[15%] w-[63%] rotate-[-8deg] opacity-85 mix-blend-screen" />
            <div className="absolute bottom-3 right-4 rounded-2xl border border-white/[.14] bg-[#16191d]/80 px-4 py-3 backdrop-blur-xl"><p className="text-[10px] text-white/38">Current balance</p><p className="mt-1 text-[22px] font-semibold tracking-[-.04em]">{formatNumber(points)} <span className="text-[11px] font-normal text-white/40">points</span></p></div>
          </div>
        </div>
      </header>

      <section className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
        <div className="rounded-[24px] border border-white/[.08] bg-[#131619] p-6 sm:p-8"><div className="flex items-center justify-between"><div><p className="text-[11px] uppercase tracking-[.18em] text-white/35">YOUR PROGRESS</p><h2 className="mt-2 text-[21px] font-semibold">You are close to your next reward.</h2></div><div className="rounded-full border border-white/[.09] px-3 py-1.5 text-[11px] text-white/48">{progress}%</div></div><div className="mt-7 flex items-end justify-between text-[12px] text-white/43"><span>Progress toward {nextReward.name}</span><span>{formatNumber(Math.max(0, nextReward.points - points))} points remaining</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[.08]"><div className="h-full rounded-full bg-gradient-to-l from-[#dbe6ff] to-[#aebff2] transition-all duration-700" style={{ width: `${progress}%` }} /></div><div className="mt-7 grid grid-cols-3 gap-3"><div><p className="text-[25px] font-semibold">{signups}</p><p className="mt-1 text-[11px] text-white/38">Successful invites</p></div><div><p className="text-[25px] font-semibold">{activeReferrals}</p><p className="mt-1 text-[11px] text-white/38">Active subscribers</p></div><div><p className="text-[25px] font-semibold">{availableSubscriptions}</p><p className="mt-1 text-[11px] text-white/38">Subscriptions available</p></div></div></div>
        <div className="rounded-[24px] border border-white/[.08] bg-[#131619] p-6 sm:p-8"><div className="flex items-center justify-between"><div><p className="text-[11px] uppercase tracking-[.18em] text-white/35">INVITE LINK</p><h2 className="mt-2 text-[21px] font-semibold">Your invite link is ready.</h2></div></div><div className="mt-6 flex items-center gap-2 rounded-xl border border-white/[.09] bg-black/20 p-2"><div className="min-w-0 flex-1 truncate px-2 text-left font-mono text-[11px] text-white/55" dir="ltr">{link || "Creating your link..."}</div><button onClick={() => copyLink()} className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg bg-white px-3 text-[12px] font-medium text-[#101113]">{justCopied ? "Copied" : "Copy"}</button></div><div className="mt-4 flex items-center justify-between text-[11px] text-white/35"><span>Code: <b className="font-mono text-white/60">{code || "—"}</b></span><button onClick={() => shareLink()} className="text-white/60 hover:text-white">Share directly</button></div></div>
      </section>

      <section className="mt-11"><div className="mb-5 flex items-end justify-between"><div><p className="text-[11px] uppercase tracking-[.18em] text-white/35">REDEEM POINTS</p><h2 className="mt-2 text-[25px] font-semibold tracking-[-.035em]">Choose your reward.</h2></div><span className="text-[12px] text-white/35">100 available for each reward</span></div><div className="grid gap-4 md:grid-cols-2">{REWARDS.map((reward) => { const enough = points >= reward.points; const alreadyClaimed = claimed.includes(reward.id); return <article key={reward.id} className={cn("relative min-h-[252px] overflow-hidden rounded-[26px] border p-6 transition", reward.featured ? "border-[#f2d6be]/25 bg-[#1b1717]" : "border-white/[.08] bg-[#131619]")}><img src={reward.image} alt="" className="pointer-events-none absolute -left-10 -top-16 w-[220px] opacity-25 mix-blend-screen" /><div className="relative flex items-start justify-between gap-4"><div><span className="inline-flex items-center gap-1.5 rounded-full border border-white/[.11] px-2.5 py-1 text-[10px] text-white/50">Subscription reward</span><h3 className="mt-6 text-[23px] font-semibold">{reward.name}</h3><p className="mt-2 text-[12px] text-white/42">{reward.description}</p></div>{reward.featured && <span className="rounded-full bg-[#f2d6be] px-2.5 py-1 text-[10px] font-semibold text-[#36241e]">Most popular</span>}</div><div className="relative mt-8 flex items-end justify-between gap-4"><div><p className="text-[27px] font-semibold tracking-[-.05em]">{formatNumber(reward.points)} <span className="text-[11px] font-normal text-white/38">points</span></p><p className="mt-1 text-[11px] text-white/35">Remaining {Math.max(0, reward.stock - (redeemedCounts[reward.id] ?? 0))} of 100</p></div><button disabled={!enough || alreadyClaimed} onClick={() => setSelectedReward(reward)} className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-[12px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-35" style={{ backgroundColor: enough && !alreadyClaimed ? reward.accent : "rgba(255,255,255,.08)", color: enough && !alreadyClaimed ? "#17191D" : "rgba(255,255,255,.6)" }}>{alreadyClaimed ? "Requested" : enough ? "Redeem" : "Not enough points"}</button></div></article>})}</div></section>

      <section className="mt-11 grid gap-4 lg:grid-cols-[.8fr_1.2fr]"><div className="rounded-[24px] border border-white/[.08] bg-[#131619] p-6 sm:p-8"><div className="flex items-center justify-between"><div><p className="text-[11px] uppercase tracking-[.18em] text-white/35">HOW IT WORKS</p><h2 className="mt-2 text-[21px] font-semibold">Three simple steps.</h2></div></div><div className="mt-7 space-y-5">{[{title: "Share your link", body: "Send your invite to someone who will enjoy Megsy AI."}, {title: "Your friend joins", body: "You receive points after an eligible signup."}, {title: "Redeem your reward", body: "Choose a monthly or annual subscription."}].map((step, index) => <div key={step.title} className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[.08] text-[11px] text-white/65">{index + 1}</span><div><p className="text-[13px] font-medium text-white/85">{step.title}</p><p className="mt-1 text-[12px] leading-5 text-white/38">{step.body}</p></div></div>)}</div></div><div className="rounded-[24px] border border-white/[.08] bg-[#131619] p-6 sm:p-8"><div className="mb-4 flex items-center justify-between"><div><p className="text-[11px] uppercase tracking-[.18em] text-white/35">RECENT ACTIVITY</p><h2 className="mt-2 text-[21px] font-semibold">Recent activity</h2></div><button onClick={() => navigate("/settings/earn/tasks")} className="text-[12px] text-white/45 hover:text-white">View all</button></div>{activity.length === 0 ? <EmptyState title="No activity yet" hint="Share your link to get your first invite." /> : <div className="divide-y divide-white/[.06]">{activity.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"><div className="flex min-w-0 items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[.06] text-white/45">01</span><div className="min-w-0"><p className="truncate text-[13px] text-white/78">{item.title}</p><p className="mt-1 text-[11px] text-white/35">{item.meta} · {fmtDate(item.date)}</p></div></div><span className="shrink-0 text-[12px] font-medium text-[#CFE0FF]">{item.points ? `+${formatNumber(item.points)} points` : "Under review"}</span></div>)}</div>}</div></section>

      {selectedReward && <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setSelectedReward(null)}><div className="w-full max-w-md overflow-hidden rounded-[26px] border border-white/[.1] bg-[#181a1e] shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="relative h-32 overflow-hidden border-b border-white/[.08] bg-[#16191d]"><img src={selectedReward.image} alt="" className="absolute left-1/2 top-[-70px] w-64 -translate-x-1/2 opacity-75 mix-blend-screen" /></div><div className="p-6"><p className="text-[11px] uppercase tracking-[.18em] text-white/35">Confirm redemption</p><h2 className="mt-3 text-[24px] font-semibold">{selectedReward.name}</h2><p className="mt-3 text-[13px] leading-6 text-white/50">This will deduct {formatNumber(selectedReward.points)} points from your balance and submit the reward activation request to your account.</p><div className="mt-6 flex gap-3"><button onClick={() => setSelectedReward(null)} className="h-11 flex-1 rounded-xl border border-white/[.1] text-[13px] text-white/65">Cancel</button><button onClick={redeem} className="h-11 flex-1 rounded-xl bg-white text-[13px] font-semibold text-[#111315]">Confirm request</button></div></div></div></div>}
    </main>
  );
}
