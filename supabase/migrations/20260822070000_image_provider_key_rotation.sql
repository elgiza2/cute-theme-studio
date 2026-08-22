create table if not exists public.image_provider_keys (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('d', 'r')),
  vault_secret_id uuid not null unique,
  key_label text not null check (key_label in ('d', 'r')),
  enabled boolean not null default true,
  consecutive_failures integer not null default 0 check (consecutive_failures >= 0),
  total_failures integer not null default 0 check (total_failures >= 0),
  last_used_at timestamptz,
  last_success_at timestamptz,
  last_failure_at timestamptz,
  disabled_at timestamptz,
  cooldown_until timestamptz,
  last_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists image_provider_keys_pick_idx
  on public.image_provider_keys (provider, enabled, cooldown_until, last_used_at);

alter table public.image_provider_keys enable row level security;
revoke all on public.image_provider_keys from anon, authenticated;
revoke all on public.image_provider_keys from public;

create or replace function public.image_provider_next_key(p_provider text)
returns table (key_id uuid, provider text, secret_value text)
language sql
security definer
set search_path = public, vault, extensions
as $$
  select k.id, k.provider, s.decrypted_secret
  from public.image_provider_keys k
  join vault.decrypted_secrets s on s.id = k.vault_secret_id
  where k.provider = p_provider
    and k.enabled = true
    and (k.cooldown_until is null or k.cooldown_until <= now())
  order by k.last_used_at nulls first, k.consecutive_failures asc, k.created_at asc
  limit 1;
$$;

create or replace function public.image_provider_mark_used(p_key_id uuid)
returns void
language sql
security definer
set search_path = public, vault, extensions
as $$
  update public.image_provider_keys
  set last_used_at = now(), updated_at = now()
  where id = p_key_id;
$$;

create or replace function public.image_provider_record_result(
  p_key_id uuid,
  p_success boolean,
  p_error_code text default null
)
returns void
language plpgsql
security definer
set search_path = public, vault, extensions
as $$
begin
  if p_success then
    update public.image_provider_keys
    set consecutive_failures = 0,
        last_success_at = now(),
        last_error_code = null,
        cooldown_until = null,
        updated_at = now()
    where id = p_key_id;
  else
    update public.image_provider_keys
    set consecutive_failures = consecutive_failures + 1,
        total_failures = total_failures + 1,
        last_failure_at = now(),
        last_error_code = left(coalesce(p_error_code, 'provider_error'), 160),
        enabled = case when consecutive_failures + 1 >= 2 then false else enabled end,
        disabled_at = case when consecutive_failures + 1 >= 2 then now() else disabled_at end,
        cooldown_until = case when consecutive_failures + 1 >= 2 then null else now() + interval '30 seconds' end,
        updated_at = now()
    where id = p_key_id;
  end if;
end;
$$;

revoke all on function public.image_provider_next_key(text) from public, anon, authenticated;
revoke all on function public.image_provider_mark_used(uuid) from public, anon, authenticated;
revoke all on function public.image_provider_record_result(uuid, boolean, text) from public, anon, authenticated;
grant execute on function public.image_provider_next_key(text) to service_role;
grant execute on function public.image_provider_mark_used(uuid) to service_role;
grant execute on function public.image_provider_record_result(uuid, boolean, text) to service_role;
