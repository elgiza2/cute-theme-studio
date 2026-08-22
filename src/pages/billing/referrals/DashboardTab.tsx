import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
    accent: "#cfe0ff",
    image: "/referrals/aura-orbit.png",
  },
  {
    id: "annual",
    name: "Annual membership",
    description: "A full year of creative tools",
    points: 12000,
    stock: 100,
    accent: "#f0d4bd",
    image: "/referrals/aura-spark.png",
  },
] as const;

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);

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
  const points = signups * SIGNUP_POINTS + activeReferrals * SUBSCRIPTION_POINTS;
  const nextReward = REWARDS.find((reward) => reward.points > points) ?? REWARDS[1];
  const progress = Math.min(100, Math.round((points / nextReward.points) * 100));
  const availableSubscriptions = Math.max(0, 100 - Math.max(...Object.values(redeemedCounts), 0));

  const activity = useMemo(() => refs.map((ref, index) => ({
    id: `ref-${ref.id}`,
    title: `New invite ${String(index + 1).padStart(2, "0")}`,
    date: ref.created_at,
    meta: ref.status === "pending" ? "Awaiting confirmation" : "Points credited",
    points: ref.status === "pending" ? 0 : SIGNUP_POINTS,
  })).slice(0, 4), [refs]);

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
    <main dir="ltr" className="mx-auto w-full max-w-[720px] px-4 pb-20 pt-5 text-foreground sm:px-6 lg:max-w-[1180px] lg:px-10 lg:pt-9">
      <header className="relative overflow-hidden rounded-[28px] border border-white/[.08] bg-[#111315] px-5 pb-6 pt-6 sm:px-8 lg:rounded-[32px] lg:px-10 lg:py-9">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#bbcdf8]/[.11] blur-[80px]" />
        <div className="relative flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_330px] lg:items-center lg:gap-8">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[.22em] text-white/40">Earn</p>
            <h1 className="mt-3 max-w-[520px] text-[34px] font-semibold leading-[1.05] tracking-[-.06em] sm:text-[46px]">Turn invites into membership.</h1>
            <p className="mt-4 max-w-[460px] text-[13px] leading-6 text-white/48">Invite people you trust, collect points, and redeem them for Megsy AI membership.</p>
            <Button onClick={() => shareLink()} variant="solid" size="lg" className="mt-6 h-11 rounded-xl bg-white px-5 text-[13px] font-semibold text-[#111315] hover:bg-white/90">Share your invite link</Button>
          </div>
          <div className="relative h-[180px] overflow-hidden rounded-[22px] border border-white/[.08] bg-[#17191d] sm:h-[220px] lg:h-[260px]">
            <img src="/referrals/aura-flow.png" alt="" className="absolute -left-4 top-10 w-[58%] -rotate-12 opacity-70 mix-blend-screen" />
            <img src="/referrals/aura-orbit.png" alt="" className="absolute -right-5 -top-10 w-[72%] rotate-12 mix-blend-screen" />
            <img src="/referrals/aura-spark.png" alt="" className="absolute bottom-[-28%] left-[17%] w-[64%] opacity-70 mix-blend-screen" />
            <div className="absolute bottom-3 left-3 rounded-xl border border-white/[.12] bg-[#15181d]/85 px-3 py-2 backdrop-blur-xl"><p className="text-[9px] uppercase tracking-[.15em] text-white/40">Current balance</p><p className="mt-1 text-[20px] font-semibold tracking-[-.04em]">{formatNumber(points)} <span className="text-[10px] font-normal text-white/45">points</span></p></div>
          </div>
        </div>
      </header>

      <section className="mt-3 grid gap-3 lg:grid-cols-[1.1fr_.9fr] lg:gap-4">
        <div className="rounded-[22px] border border-white/[.08] bg-[#131619] p-5 sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[.18em] text-white/35">Progress</p><h2 className="mt-2 text-[19px] font-semibold">Next reward: {nextReward.name}</h2></div><span className="text-[12px] text-white/45">{progress}%</span></div><Progress value={progress} className="mt-5 h-1.5 bg-white/[.08] [&>div]:bg-[#cfe0ff]" /><p className="mt-3 text-[11px] text-white/38">{formatNumber(Math.max(0, nextReward.points - points))} points remaining</p><div className="mt-6 grid grid-cols-3 divide-x divide-white/[.08] text-center"><div><p className="text-[22px] font-semibold">{signups}</p><p className="mt-1 text-[10px] text-white/38">Invites</p></div><div><p className="text-[22px] font-semibold">{activeReferrals}</p><p className="mt-1 text-[10px] text-white/38">Subscribers</p></div><div><p className="text-[22px] font-semibold">{availableSubscriptions}</p><p className="mt-1 text-[10px] text-white/38">Available</p></div></div></div>
        <div className="rounded-[22px] border border-white/[.08] bg-[#131619] p-5 sm:p-7"><p className="text-[10px] uppercase tracking-[.18em] text-white/35">Invite link</p><h2 className="mt-2 text-[19px] font-semibold">Ready to share.</h2><div className="mt-5 overflow-hidden rounded-xl border border-white/[.08] bg-black/20 px-3 py-3 text-left font-mono text-[11px] text-white/55" dir="ltr">{link || "Creating your link..."}</div><div className="mt-3 flex gap-2"><Button onClick={() => copyLink()} variant="solid" className="h-10 flex-1 rounded-xl bg-white text-[12px] font-semibold text-[#111315] hover:bg-white/90">{justCopied ? "Copied" : "Copy link"}</Button><Button onClick={() => shareLink()} variant="outline" className="h-10 flex-1 rounded-xl border-white/[.12] text-[12px] text-white/70 hover:bg-white/[.06] hover:text-white">Share</Button></div><p className="mt-3 text-[10px] text-white/35">Code: <span className="font-mono text-white/60">{code || "—"}</span></p></div>
      </section>

      <section className="mt-9"><div className="mb-4 flex items-end justify-between"><div><p className="text-[10px] uppercase tracking-[.18em] text-white/35">Rewards</p><h2 className="mt-2 text-[23px] font-semibold tracking-[-.035em]">Redeem your points.</h2></div><span className="text-[11px] text-white/35">100 available each</span></div><div className="grid gap-3 lg:grid-cols-2 lg:gap-4">{REWARDS.map((reward) => { const enough = points >= reward.points; const alreadyClaimed = claimed.includes(reward.id); return <article key={reward.id} className={cn("relative overflow-hidden rounded-[22px] border p-5 sm:p-7", reward.id === "annual" ? "border-[#f0d4bd]/25 bg-[#1a1717]" : "border-white/[.08] bg-[#131619]")}><img src={reward.image} alt="" className="pointer-events-none absolute -left-10 -top-16 w-48 opacity-20 mix-blend-screen" /><div className="relative"><p className="text-[10px] uppercase tracking-[.16em] text-white/40">Membership reward</p><h3 className="mt-4 text-[21px] font-semibold">{reward.name}</h3><p className="mt-1 text-[12px] text-white/42">{reward.description}</p><div className="mt-7 flex items-end justify-between gap-3"><div><p className="text-[25px] font-semibold tracking-[-.05em]">{formatNumber(reward.points)} <span className="text-[10px] font-normal text-white/40">points</span></p><p className="mt-1 text-[10px] text-white/35">Remaining {Math.max(0, reward.stock - (redeemedCounts[reward.id] ?? 0))} of 100</p></div><button disabled={!enough || alreadyClaimed} onClick={() => setSelectedReward(reward)} className="h-10 rounded-xl px-4 text-[12px] font-semibold transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-35" style={{ backgroundColor: enough && !alreadyClaimed ? reward.accent : "rgba(255,255,255,.08)", color: enough && !alreadyClaimed ? "#17191D" : "rgba(255,255,255,.6)" }}>{alreadyClaimed ? "Requested" : enough ? "Redeem" : "Not enough"}</button></div></div></article>; })}</div></section>

      <section className="mt-9 grid gap-3 lg:grid-cols-[.8fr_1.2fr] lg:gap-4"><div className="rounded-[22px] border border-white/[.08] bg-[#131619] p-5 sm:p-7"><p className="text-[10px] uppercase tracking-[.18em] text-white/35">How it works</p><h2 className="mt-2 text-[19px] font-semibold">Three simple steps.</h2><div className="mt-6 space-y-4">{[{title: "Share your link", body: "Send your personal invite to someone who will enjoy Megsy AI."}, {title: "They join", body: "You earn points when their signup is confirmed."}, {title: "Redeem", body: "Use your points for a monthly or annual membership."}].map((step, index) => <div key={step.title} className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/[.08] text-[10px] text-white/60">{String(index + 1).padStart(2, "0")}</span><div><p className="text-[12px] font-medium text-white/80">{step.title}</p><p className="mt-1 text-[11px] leading-5 text-white/35">{step.body}</p></div></div>)}</div></div><div className="rounded-[22px] border border-white/[.08] bg-[#131619] p-5 sm:p-7"><div className="flex items-end justify-between"><div><p className="text-[10px] uppercase tracking-[.18em] text-white/35">Activity</p><h2 className="mt-2 text-[19px] font-semibold">Recent activity.</h2></div><button onClick={() => navigate("/settings/earn/tasks")} className="text-[11px] text-white/40 hover:text-white">View all</button></div>{activity.length === 0 ? <EmptyState title="No activity yet" hint="Share your link to get your first invite." /> : <div className="mt-4 divide-y divide-white/[.06]">{activity.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 py-3.5 first:pt-0"><div><p className="text-[12px] text-white/75">{item.title}</p><p className="mt-1 text-[10px] text-white/35">{item.meta} · {fmtDate(item.date)}</p></div><span className="text-[11px] text-[#cfe0ff]">{item.points ? `+${formatNumber(item.points)}` : "Pending"}</span></div>)}</div>}</div></section>

      {selectedReward && <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setSelectedReward(null)}><div className="w-full max-w-md overflow-hidden rounded-[24px] border border-white/[.1] bg-[#181a1e]" onClick={(event) => event.stopPropagation()}><div className="relative h-28 overflow-hidden bg-[#15181d]"><img src={selectedReward.image} alt="" className="absolute left-1/2 top-[-85px] w-56 -translate-x-1/2 opacity-70 mix-blend-screen" /></div><div className="p-6"><p className="text-[10px] uppercase tracking-[.18em] text-white/35">Confirm redemption</p><h2 className="mt-3 text-[22px] font-semibold">{selectedReward.name}</h2><p className="mt-3 text-[12px] leading-6 text-white/50">This will deduct {formatNumber(selectedReward.points)} points and submit your membership activation request.</p><div className="mt-6 flex gap-2"><button onClick={() => setSelectedReward(null)} className="h-11 flex-1 rounded-xl border border-white/[.1] text-[12px] text-white/65">Cancel</button><button onClick={redeem} className="h-11 flex-1 rounded-xl bg-white text-[12px] font-semibold text-[#111315]">Confirm request</button></div></div></div></div>}
    </main>
  );
}
