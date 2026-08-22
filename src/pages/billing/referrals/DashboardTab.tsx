import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Check,
  Copy,
  Gift,
  Link2,
  LockKeyhole,
  Share2,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState, fmtDate, statusLabel, useReferrals } from "../ReferralsPage";

const POINTS_PER_SIGNUP = 100;
const POINTS_PER_SUBSCRIPTION = 400;
const REWARDS = [
  {
    id: "monthly",
    name: "اشتراك شهري",
    description: "شهر كامل من Megsy AI بدون دفع",
    points: 3500,
    stock: 100,
    accent: "#DCE9FF",
    featured: false,
  },
  {
    id: "annual",
    name: "اشتراك سنوي",
    description: "أفضل قيمة — سنة كاملة من الإبداع",
    points: 12000,
    stock: 100,
    accent: "#F3E6C2",
    featured: true,
  },
] as const;

const formatNumber = (value: number) => new Intl.NumberFormat("ar-EG").format(value);

export default function DashboardTab() {
  const navigate = useNavigate();
  const {
    userId,
    refs,
    earns,
    wds,
    signups,
    link,
    code,
    justCopied,
    copyLink,
    shareLink,
  } = useReferrals();
  const [selectedReward, setSelectedReward] = useState<(typeof REWARDS)[number] | null>(null);
  const db = supabase as any;
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
      setRedeemedCounts(Object.fromEntries((catalog ?? []).map((item) => [item.id, item.stock_redeemed])));
      setClaimed((redemptions ?? []).map((item) => item.reward_id));
    };
    loadRewards();
    return () => { cancelled = true; };
  }, [userId]);

  const activeReferrals = refs.filter((ref) => ref.status === "active" || ref.status === "approved").length;
  const points = signups * POINTS_PER_SIGNUP + activeReferrals * POINTS_PER_SUBSCRIPTION;
  const nextReward = REWARDS.find((reward) => reward.points > points) ?? REWARDS[1];
  const progress = Math.min(100, Math.round((points / nextReward.points) * 100));
  const availableSubscriptions = Math.max(0, 100 - Math.max(...Object.values(redeemedCounts), 0));

  const activity = useMemo(() => {
    const referralItems = refs.map((ref, index) => ({
      id: `ref-${ref.id}`,
      title: `دعوة جديدة #${index + 1}`,
      date: ref.created_at,
      meta: ref.status === "pending" ? "في انتظار التأكيد" : "تم احتساب النقاط",
      points: ref.status === "pending" ? 0 : POINTS_PER_SIGNUP,
    }));
    return referralItems.slice(0, 5);
  }, [refs]);

  const redeem = async () => {
    if (!selectedReward) return;
    if (points < selectedReward.points) {
      toast.error(`تحتاج ${formatNumber(selectedReward.points - points)} نقطة إضافية`);
      return;
    }
    if (claimed.includes(selectedReward.id)) {
      toast.info("تم تسجيل طلبك لهذه المكافأة بالفعل");
      return;
    }
    const { data, error } = await db.rpc("redeem_referral_reward", { p_reward_id: selectedReward.id });
    const result = data as { success?: boolean; error?: string } | null;
    if (error || !result?.success) {
      toast.error(result?.error || error?.message || "تعذر تسجيل الطلب حاليًا");
      return;
    }
    setClaimed((current) => [...current, selectedReward.id]);
    setRedeemedCounts((current) => ({ ...current, [selectedReward.id]: (current[selectedReward.id] ?? 0) + 1 }));
    setSelectedReward(null);
    toast.success("تم تسجيل طلب الاستبدال بنجاح");
  };

  return (
    <main dir="rtl" className="mx-auto w-full max-w-[1180px] px-4 py-6 text-[#F7F8FA] sm:px-6 lg:px-10 lg:py-10">
      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 text-[11px] font-medium tracking-[0.18em] text-white/40">MEGSY REWARDS</p>
          <h1 className="text-[30px] font-semibold tracking-[-0.045em] sm:text-[38px]">حوّل دعواتك لمكافآت حقيقية.</h1>
          <p className="mt-3 max-w-[560px] text-[14px] leading-7 text-white/52">كل صديق يبدأ رحلته مع Megsy يضيف لرصيدك. اجمع النقاط واستبدلها باشتراك شهري أو سنوي طالما المخزون متاح.</p>
        </div>
        <button onClick={() => shareLink()} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-[13px] font-semibold text-[#101113] transition hover:bg-[#e9edf3] active:scale-[.98]">
          <Share2 className="h-4 w-4" />
          شارك رابطك
        </button>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
        <div className="relative overflow-hidden rounded-[24px] border border-white/[.08] bg-[#17191D] p-6 sm:p-8">
          <div className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-[#DCE9FF]/[.07] blur-3xl" />
          <div className="relative flex flex-col justify-between gap-10 sm:flex-row">
            <div>
              <div className="flex items-center gap-2 text-white/48"><Sparkles className="h-4 w-4" /><span className="text-[12px]">رصيد المكافآت</span></div>
              <div className="mt-4 flex items-end gap-2"><strong className="text-[54px] font-semibold leading-none tracking-[-.06em]">{formatNumber(points)}</strong><span className="mb-1 text-[14px] text-white/45">نقطة</span></div>
              <p className="mt-3 text-[12px] text-white/42">{formatNumber(nextReward.points - points > 0 ? nextReward.points - points : 0)} نقطة للوصول للمكافأة التالية</p>
            </div>
            <div className="flex items-end sm:items-start"><div className="rounded-2xl border border-white/[.08] bg-white/[.035] px-4 py-3 text-right"><p className="text-[11px] text-white/40">المتاح الآن</p><p className="mt-1 text-[22px] font-semibold">{availableSubscriptions}<span className="mr-1 text-[12px] font-normal text-white/40">/ 100</span></p><p className="text-[11px] text-white/40">اشتراك لكل نوع مكافأة</p></div></div>
          </div>
          <div className="relative mt-10"><div className="mb-2 flex items-center justify-between text-[11px] text-white/42"><span>التقدم نحو {nextReward.name}</span><span>{progress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/[.08]"><div className="h-full rounded-full bg-[#DCE9FF] transition-all duration-500" style={{ width: `${progress}%` }} /></div></div>
        </div>

        <div className="rounded-[24px] border border-white/[.08] bg-[#121417] p-6 sm:p-8"><div className="flex items-center justify-between"><span className="text-[12px] text-white/45">ملخص الأداء</span><Users className="h-4 w-4 text-white/35" /></div><div className="mt-6 grid grid-cols-2 gap-6"><div><p className="text-[28px] font-semibold tracking-[-.04em]">{signups}</p><p className="mt-1 text-[12px] text-white/40">دعوة ناجحة</p></div><div><p className="text-[28px] font-semibold tracking-[-.04em]">{activeReferrals}</p><p className="mt-1 text-[12px] text-white/40">مشترك نشط</p></div><div><p className="text-[28px] font-semibold tracking-[-.04em]">{earns.length}</p><p className="mt-1 text-[12px] text-white/40">عملية مكافأة</p></div><div><p className="text-[28px] font-semibold tracking-[-.04em]">{wds.length}</p><p className="mt-1 text-[12px] text-white/40">طلبات سابقة</p></div></div></div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[24px] border border-white/[.08] bg-[#121417] p-6 sm:p-8"><div className="mb-6 flex items-start justify-between gap-4"><div><p className="text-[11px] font-medium tracking-[.16em] text-white/35">YOUR INVITE LINK</p><h2 className="mt-2 text-[20px] font-semibold">شارك الرابط، والباقي علينا.</h2></div><Link2 className="h-5 w-5 text-white/30" /></div><div className="flex items-center gap-2 rounded-xl border border-white/[.08] bg-black/20 p-2"><div className="min-w-0 flex-1 truncate px-3 text-left font-mono text-[12px] text-white/55" dir="ltr">{link || "جارٍ إنشاء الرابط..."}</div><button onClick={() => copyLink()} className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg bg-white px-3 text-[12px] font-medium text-[#101113]">{justCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{justCopied ? "تم النسخ" : "نسخ"}</button></div><div className="mt-4 flex items-center justify-between text-[11px] text-white/35"><span>كود الإحالة: <b className="font-mono text-white/60">{code || "—"}</b></span><button onClick={() => shareLink()} className="text-white/65 transition hover:text-white">مشاركة مباشرة <ArrowUpRight className="mr-1 inline h-3 w-3" /></button></div></div>
        <div className="rounded-[24px] border border-white/[.08] bg-[#121417] p-6 sm:p-8"><div className="mb-6 flex items-center justify-between"><div><p className="text-[11px] font-medium tracking-[.16em] text-white/35">HOW IT WORKS</p><h2 className="mt-2 text-[20px] font-semibold">ثلاث خطوات بسيطة.</h2></div><WalletCards className="h-5 w-5 text-white/30" /></div><div className="space-y-4">{[{title: "شارك رابطك الخاص", body: "أرسل الدعوة لأي شخص مهتم بـ Megsy AI."}, {title: "صديقك يبدأ استخدامه", body: "تحصل على 100 نقطة بعد إتمام التسجيل."}, {title: "استبدل نقاطك", body: "كل اشتراك جديد يقرّبك من مكافأة مجانية."}].map((step, index) => <div key={step.title} className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[.08] text-[11px] text-white/65">{index + 1}</span><div><p className="text-[13px] font-medium text-white/85">{step.title}</p><p className="mt-1 text-[12px] leading-5 text-white/38">{step.body}</p></div></div>)}</div></div>
      </section>

      <section className="mt-10"><div className="mb-4 flex items-end justify-between"><div><p className="text-[11px] font-medium tracking-[.16em] text-white/35">REDEEM POINTS</p><h2 className="mt-2 text-[22px] font-semibold">اختار مكافأتك القادمة.</h2></div><span className="text-[12px] text-white/35">100 متاح حاليًا</span></div><div className="grid gap-4 md:grid-cols-2">{REWARDS.map((reward) => { const enough = points >= reward.points; const alreadyClaimed = claimed.includes(reward.id); return <article key={reward.id} className={cn("relative overflow-hidden rounded-[24px] border p-6 transition", reward.featured ? "border-[#F3E6C2]/35 bg-[#191814]" : "border-white/[.08] bg-[#121417]")}><div className="absolute -left-10 -top-16 h-40 w-40 rounded-full blur-3xl" style={{ backgroundColor: `${reward.accent}20` }} /><div className="relative flex items-start justify-between gap-4"><div><span className="inline-flex items-center gap-1.5 rounded-full border border-white/[.1] px-2.5 py-1 text-[10px] text-white/45"><Gift className="h-3 w-3" /> مكافأة اشتراك</span><h3 className="mt-5 text-[23px] font-semibold">{reward.name}</h3><p className="mt-2 text-[12px] text-white/42">{reward.description}</p></div>{reward.featured && <span className="rounded-full bg-[#F3E6C2] px-2.5 py-1 text-[10px] font-semibold text-[#272117]">الأكثر طلبًا</span>}</div><div className="relative mt-8 flex items-end justify-between gap-3"><div><p className="text-[26px] font-semibold tracking-[-.04em]">{formatNumber(reward.points)} <span className="text-[12px] font-normal text-white/40">نقطة</span></p><p className="mt-1 text-[11px] text-white/35">متبقي {Math.max(0, reward.stock - (redeemedCounts[reward.id] ?? 0))} من 100</p></div><button disabled={!enough || alreadyClaimed} onClick={() => setSelectedReward(reward)} className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-[12px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-35" style={{ backgroundColor: enough && !alreadyClaimed ? reward.accent : "rgba(255,255,255,.08)", color: enough && !alreadyClaimed ? "#17191D" : "rgba(255,255,255,.6)" }}>{alreadyClaimed ? <Check className="h-3.5 w-3.5" /> : !enough ? <LockKeyhole className="h-3.5 w-3.5" /> : null}{alreadyClaimed ? "تم الطلب" : enough ? "استبدل الآن" : "نقاط غير كافية"}</button></div></article>})}</div></section>

      <section className="mt-10 rounded-[24px] border border-white/[.08] bg-[#121417] p-6 sm:p-8"><div className="mb-5 flex items-center justify-between"><div><p className="text-[11px] font-medium tracking-[.16em] text-white/35">RECENT ACTIVITY</p><h2 className="mt-2 text-[20px] font-semibold">آخر النشاطات</h2></div><button onClick={() => navigate("/settings/referrals/tasks")} className="text-[12px] text-white/45 hover:text-white">عرض الكل</button></div>{activity.length === 0 ? <EmptyState title="لسه مفيش نشاط" hint="شارك رابطك وابدأ أول دعوة." /> : <div className="divide-y divide-white/[.06]">{activity.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"><div className="flex min-w-0 items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[.06] text-white/45"><Users className="h-4 w-4" /></span><div className="min-w-0"><p className="truncate text-[13px] text-white/78">{item.title}</p><p className="mt-1 text-[11px] text-white/35">{item.meta} · {fmtDate(item.date)}</p></div></div><span className="shrink-0 text-[12px] font-medium text-[#CFE0FF]">{item.points ? `+${formatNumber(item.points)} نقطة` : "قيد المراجعة"}</span></div>)}</div>}</section>

      {selectedReward && <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setSelectedReward(null)}><div className="w-full max-w-md rounded-[24px] border border-white/[.1] bg-[#181A1E] p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><p className="text-[11px] tracking-[.16em] text-white/35">تأكيد الاستبدال</p><h2 className="mt-3 text-[24px] font-semibold">{selectedReward.name}</h2><p className="mt-3 text-[13px] leading-6 text-white/50">سيتم خصم {formatNumber(selectedReward.points)} نقطة من رصيدك وتسجيل طلب تفعيل المكافأة على حسابك.</p><div className="mt-6 flex gap-3"><button onClick={() => setSelectedReward(null)} className="h-11 flex-1 rounded-xl border border-white/[.1] text-[13px] text-white/65">إلغاء</button><button onClick={redeem} className="h-11 flex-1 rounded-xl bg-white text-[13px] font-semibold text-[#111315]">تأكيد الطلب</button></div></div></div>}
    </main>
  );
}
