create table if not exists public.referral_reward_catalog (
  id text primary key,
  name text not null,
  description text not null,
  points integer not null check (points > 0),
  stock_total integer not null default 100 check (stock_total >= 0),
  stock_redeemed integer not null default 0 check (stock_redeemed >= 0 and stock_redeemed <= stock_total),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.referral_reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reward_id text not null references public.referral_reward_catalog(id),
  points_spent integer not null check (points_spent > 0),
  status text not null default 'pending' check (status in ('pending', 'fulfilled', 'cancelled')),
  created_at timestamptz not null default now(),
  unique (user_id, reward_id)
);

alter table public.referral_reward_catalog enable row level security;
alter table public.referral_reward_redemptions enable row level security;

drop policy if exists "Anyone can read active referral rewards" on public.referral_reward_catalog;
create policy "Anyone can read active referral rewards"
  on public.referral_reward_catalog for select
  using (active = true);

drop policy if exists "Users can read their own reward redemptions" on public.referral_reward_redemptions;
create policy "Users can read their own reward redemptions"
  on public.referral_reward_redemptions for select
  to authenticated
  using (auth.uid() = user_id);

insert into public.referral_reward_catalog (id, name, description, points, stock_total)
values
  ('monthly', 'اشتراك شهري', 'شهر كامل من Megsy AI بدون دفع', 3500, 100),
  ('annual', 'اشتراك سنوي', 'أفضل قيمة — سنة كاملة من الإبداع', 12000, 100)
on conflict (id) do nothing;

create or replace function public.redeem_referral_reward(p_reward_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_reward public.referral_reward_catalog%rowtype;
  v_signups integer;
  v_active integer;
  v_points integer;
  v_spent integer;
begin
  if v_user is null then
    return jsonb_build_object('success', false, 'error', 'Not authenticated');
  end if;

  select * into v_reward
  from public.referral_reward_catalog
  where id = p_reward_id and active = true
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Reward is not available');
  end if;

  select count(*)::integer into v_signups
  from public.referrals
  where referrer_id = v_user and status in ('active', 'approved');

  v_active := v_signups;
  v_points := (v_signups * 100) + (v_active * 400);

  select coalesce(sum(points_spent), 0)::integer into v_spent
  from public.referral_reward_redemptions
  where user_id = v_user and status in ('pending', 'fulfilled');

  if v_points - v_spent < v_reward.points then
    return jsonb_build_object('success', false, 'error', 'Insufficient points', 'points', v_points - v_spent);
  end if;

  if v_reward.stock_redeemed >= v_reward.stock_total then
    return jsonb_build_object('success', false, 'error', 'Reward is sold out');
  end if;

  insert into public.referral_reward_redemptions (user_id, reward_id, points_spent)
  values (v_user, v_reward.id, v_reward.points);

  update public.referral_reward_catalog
  set stock_redeemed = stock_redeemed + 1
  where id = v_reward.id;

  return jsonb_build_object(
    'success', true,
    'reward_id', v_reward.id,
    'points_remaining', v_points - v_spent - v_reward.points
  );
exception
  when unique_violation then
    return jsonb_build_object('success', false, 'error', 'You already requested this reward');
end;
$$;

revoke all on function public.redeem_referral_reward(text) from public, anon;
grant execute on function public.redeem_referral_reward(text) to authenticated;
