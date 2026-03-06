## Required Migration: `brand_shop_settings`

The Admin **Shop Settings** tab expects a `brand_shop_settings` table.  
If this table does not exist, apply the SQL below in Supabase SQL Editor.

```sql
create table if not exists public.brand_shop_settings (
  brand_id uuid primary key references public.brands(id) on delete cascade,
  rep_email text,
  allow_retail_orders boolean not null default true,
  allow_pro_orders boolean not null default true,
  min_order_amount numeric(10,2),
  lead_time_days integer,
  ordering_notes text,
  updated_at timestamptz not null default now()
);

alter table public.brand_shop_settings enable row level security;

-- Admin/platform admin can fully manage settings
create policy if not exists "brand_shop_settings_admin_all"
on public.brand_shop_settings
for all
using (
  exists (
    select 1
    from public.user_profiles up
    where up.id = auth.uid()
      and up.role in ('admin', 'platform_admin')
  )
)
with check (
  exists (
    select 1
    from public.user_profiles up
    where up.id = auth.uid()
      and up.role in ('admin', 'platform_admin')
  )
);

-- Brand admins can read/update settings for their own brand
create policy if not exists "brand_shop_settings_brand_admin_read"
on public.brand_shop_settings
for select
using (
  exists (
    select 1
    from public.user_profiles up
    where up.id = auth.uid()
      and up.role = 'brand_admin'
      and up.brand_id = brand_shop_settings.brand_id
  )
);

create policy if not exists "brand_shop_settings_brand_admin_update"
on public.brand_shop_settings
for update
using (
  exists (
    select 1
    from public.user_profiles up
    where up.id = auth.uid()
      and up.role = 'brand_admin'
      and up.brand_id = brand_shop_settings.brand_id
  )
)
with check (
  exists (
    select 1
    from public.user_profiles up
    where up.id = auth.uid()
      and up.role = 'brand_admin'
      and up.brand_id = brand_shop_settings.brand_id
  )
);
```

