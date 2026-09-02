
  # Ohne Namen

  This is a code bundle for Ohne Namen. The original project is available at https://www.figma.com/design/r4d4Kr498cSUlOogycaAeX/Ohne-Namen.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Supabase konfigurieren

  Die App benötigt Supabase Auth mit E-Mail und Passwort sowie diese beiden
  öffentlichen Frontend-Variablen:

  ```env
  VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
  VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
  ```

  Die Anbieter-Tabelle heißt `Provider`. Die Spalte `Provider.id` muss dieselbe
  UUID wie `auth.users.id` sein. Angebote liegen in `EquipmentServices` und
  verwenden `providerId`, um auf den angemeldeten Anbieter zu zeigen.

  Führen Sie diese SQL-Anweisungen im Supabase SQL Editor aus:

  ```sql
  alter table public."Provider" enable row level security;
  alter table public."EquipmentServices" enable row level security;

  revoke all on table public."Provider" from anon, authenticated;
  revoke all on table public."EquipmentServices" from anon, authenticated;

  grant select on table public."Provider" to anon, authenticated;
  grant select on table public."EquipmentServices" to anon;
  grant select, insert, update, delete on table public."EquipmentServices" to authenticated;
  grant select, insert, update on table public."Provider" to authenticated;

  create policy "Provider owners can manage own profile"
  on public."Provider"
  for all
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

  create policy "Public can read visible offers"
  on public."EquipmentServices"
  for select
  to anon, authenticated
  using (visible = true);

  create policy "Providers can manage own offers"
  on public."EquipmentServices"
  for all
  to authenticated
  using ((select auth.uid()) = "providerId")
  with check ((select auth.uid()) = "providerId");

  create index if not exists equipment_services_provider_id_idx
  on public."EquipmentServices" ("providerId");
  ```

  Wenn die E-Mail-Bestätigung in Supabase Auth aktiv ist, sollte der
  Provider-Datensatz serverseitig aus den Registrierungsdaten erstellt werden:

  ```sql
  create or replace function public.create_provider_for_new_user()
  returns trigger
  language plpgsql
  security definer
  set search_path = public
  as $$
  begin
    insert into public."Provider" (id, email, name, phone, street, city, "cityCode")
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'provider_name', ''),
      coalesce(new.raw_user_meta_data->>'provider_phone', ''),
      coalesce(new.raw_user_meta_data->>'provider_street', ''),
      coalesce(new.raw_user_meta_data->>'provider_city', ''),
      coalesce(new.raw_user_meta_data->>'provider_city_code', '')
    )
    on conflict (id) do nothing;

    return new;
  end;
  $$;

  drop trigger if exists create_provider_for_new_user on auth.users;

  create trigger create_provider_for_new_user
  after insert on auth.users
  for each row execute function public.create_provider_for_new_user();
  ```

  Sicherheits-Hinweis: Verwenden Sie im Frontend nur den Supabase Anon Key.
  Service-Role-Keys gehören ausschließlich in serverseitige Funktionen.

  Die Einrichtung des entkoppelten Mailversands über Supabase, Azure Storage
  Queue, Azure Functions und Communication Services ist in
  [`docs/mail-queue-setup.md`](docs/mail-queue-setup.md) beschrieben.
  
