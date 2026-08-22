create or replace function public.add_image_provider_key(p_provider text, p_secret text)
returns uuid
language plpgsql
security definer
set search_path = public, vault, extensions
as $$
declare
  secret_id uuid;
  new_id uuid;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'not_authorized';
  end if;
  if p_provider not in ('d', 'r') then raise exception 'invalid_provider'; end if;
  if p_secret is null or length(trim(p_secret)) < 12 then raise exception 'invalid_secret'; end if;
  secret_id := vault.create_secret(trim(p_secret), 'image_' || p_provider || '_' || substr(md5(gen_random_uuid()::text), 1, 12), 'image provider key');
  insert into public.image_provider_keys (provider, vault_secret_id, key_label)
  values (p_provider, secret_id, p_provider)
  returning id into new_id;
  return new_id;
end;
$$;

create or replace function public.list_image_provider_key_status()
returns table (id uuid, provider text, key_label text, enabled boolean, consecutive_failures integer, total_failures integer, last_used_at timestamptz, last_success_at timestamptz, last_failure_at timestamptz, disabled_at timestamptz, last_error_code text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'not_authorized'; end if;
  return query select k.id, k.provider, k.key_label, k.enabled, k.consecutive_failures, k.total_failures, k.last_used_at, k.last_success_at, k.last_failure_at, k.disabled_at, k.last_error_code
  from public.image_provider_keys k order by k.provider, k.created_at;
end;
$$;

revoke all on function public.add_image_provider_key(text, text) from public, anon;
revoke all on function public.list_image_provider_key_status() from public, anon;
grant execute on function public.add_image_provider_key(text, text) to authenticated;
grant execute on function public.list_image_provider_key_status() to authenticated;
