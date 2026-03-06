-- W10-11: Auto-email trigger on access_requests INSERT
-- Fires notify_access_request_inserted() after every new row in access_requests.
-- Calls the send-email edge function (type='access_request') via pg_net.
-- Never blocks the INSERT — all errors are caught and logged as warnings.
--
-- REQUIRED SETUP (run once in SQL Editor after deploying this migration):
--
--   ALTER DATABASE postgres SET app.supabase_url     = 'https://<project_ref>.supabase.co';
--   ALTER DATABASE postgres SET app.service_role_key = '<your_service_role_key>';
--
-- Until these settings are configured the trigger fires but logs a warning and exits
-- gracefully — no INSERT is blocked.
--
-- Allowed path: SOCELLE-WEB/supabase/migrations/ (ADD ONLY — AGENT_SCOPE_REGISTRY §Backend Agent)
-- Authority: build_tracker.md WO W10-11

create or replace function public.notify_access_request_inserted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_supabase_url  text;
  v_service_key   text;
  v_payload       jsonb;
begin
  v_supabase_url := current_setting('app.supabase_url', true);
  v_service_key  := current_setting('app.service_role_key', true);

  -- Graceful no-op if DB settings not yet configured
  if v_supabase_url is null or v_supabase_url = '' then
    raise warning 'W10-11: app.supabase_url not configured — access_request email skipped (id=%)', NEW.id;
    return NEW;
  end if;

  if v_service_key is null or v_service_key = '' then
    raise warning 'W10-11: app.service_role_key not configured — access_request email skipped (id=%)', NEW.id;
    return NEW;
  end if;

  v_payload := jsonb_build_object(
    'type', 'access_request',
    'data', jsonb_build_object(
      'request_id',      NEW.id,
      'email',           NEW.email,
      'contact_name',    coalesce(NEW.contact_name, ''),
      'business_name',   coalesce(NEW.business_name, ''),
      'business_type',   coalesce(NEW.business_type, ''),
      'referral_source', coalesce(NEW.referral_source, ''),
      'created_at',      to_char(NEW.created_at at time zone 'UTC', 'YYYY-MM-DD HH24:MI UTC')
    )
  );

  perform net.http_post(
    url     := v_supabase_url || '/functions/v1/send-email',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || v_service_key
    ),
    body    := v_payload
  );

  return NEW;
exception when others then
  -- Never block the INSERT due to email failure
  raise warning 'W10-11: access_request email failed for id=%, error=%', NEW.id, sqlerrm;
  return NEW;
end;
$$;

-- Drop and recreate trigger (idempotent)
drop trigger if exists on_access_request_inserted on public.access_requests;

create trigger on_access_request_inserted
  after insert on public.access_requests
  for each row
  execute function public.notify_access_request_inserted();

comment on function public.notify_access_request_inserted() is
  'W10-11: Fires after access_requests INSERT. Calls send-email edge function '
  '(type=access_request) via pg_net. Requires app.supabase_url and '
  'app.service_role_key DB settings. Never blocks the INSERT.';
