create table if not exists public."BookingRequests" (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  from_date timestamptz,
  to_date timestamptz,
  status text not null default 'Open',
  processing_status text not null default 'Pending',
  customer_id uuid null references auth.users (id) on delete set null
);

-- The id is required to correlate a queue message with exactly one request.
-- These statements also make the migration usable when the table already exists.
alter table public."BookingRequests"
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now(),
  add column if not exists from_date timestamptz,
  add column if not exists to_date timestamptz,
  add column if not exists status text default 'Open',
  add column if not exists processing_status text default 'Pending',
  add column if not exists customer_id uuid;

update public."BookingRequests"
set
  id = coalesce(id, gen_random_uuid()),
  created_at = coalesce(created_at, now()),
  updated_at = coalesce(updated_at, now()),
  status = coalesce(status, 'Open'),
  processing_status = coalesce(processing_status, 'Pending')
where id is null
   or created_at is null
   or updated_at is null
   or status is null
   or processing_status is null;

alter table public."BookingRequests"
  alter column id set default gen_random_uuid(),
  alter column id set not null,
  alter column created_at set default now(),
  alter column created_at set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null,
  alter column status set default 'Open',
  alter column status set not null,
  alter column processing_status set default 'Pending',
  alter column processing_status set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public."BookingRequests"'::regclass
      and contype = 'p'
  ) then
    alter table public."BookingRequests"
      add constraint booking_requests_pkey primary key (id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    where c.conrelid = 'public."BookingRequests"'::regclass
      and c.contype = 'f'
      and (
        select a.attnum
        from pg_attribute a
        where a.attrelid = c.conrelid
          and a.attname = 'customer_id'
      ) = any (c.conkey)
  ) then
    alter table public."BookingRequests"
      add constraint booking_requests_customer_id_fkey
      foreign key (customer_id) references auth.users (id) on delete set null;
  end if;
end
$$;

create unique index if not exists booking_requests_id_idx
  on public."BookingRequests" (id);

create index if not exists booking_requests_processing_status_idx
  on public."BookingRequests" (processing_status);

create index if not exists booking_requests_created_at_idx
  on public."BookingRequests" (created_at desc);

alter table public."BookingRequests" enable row level security;
revoke all on table public."BookingRequests" from anon, authenticated;
grant all on table public."BookingRequests" to service_role;

comment on column public."BookingRequests".processing_status is
  'Pending, Processing, Completed, Failed or EnqueueFailed';
