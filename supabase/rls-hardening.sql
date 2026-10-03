-- ============================================================
-- Repos — Durcissement RLS (production)
-- À exécuter UNE FOIS dans l'éditeur SQL de Supabase
-- (Dashboard → SQL Editor → New query → coller → Run)
--
-- Ce script remplace les politiques "demo_all" (lecture/écriture
-- ouvertes à tout le monde) par des politiques restreintes :
--  - lecture publique : catalogue, tarifs, avis, photos
--  - réservation invité : insertion anonyme autorisée (client_id NULL)
--  - écriture : propriétaire de l'établissement, client concerné, admin
--  - trigger : création automatique du profil à l'inscription
--
-- IMPORTANT : l'application web (repos-web) est déjà compatible :
-- elle utilise la fonction booking_by_code() si elle existe,
-- sinon l'accès direct (repli pré-durcissement).
-- ============================================================

-- ---------- 0. Migration : colonnes invité sur bookings ----------
alter table public.bookings
  add column if not exists guest_name text,
  add column if not exists guest_phone text;

-- ---------- 1. Fonctions utilitaires (SECURITY DEFINER) ----------
-- Rôle de l'utilisateur courant (évite la récursion RLS sur profiles)
create or replace function public.my_role()
returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

-- L'utilisateur courant est-il propriétaire de l'établissement ?
create or replace function public.is_establishment_owner(p_est_id uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.establishments
    where id = p_est_id and owner_id = auth.uid()
  );
$$;

-- L'utilisateur courant participe-t-il à la réservation (client ou tenancier) ?
create or replace function public.is_booking_participant(p_booking_id uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.bookings b
    where b.id = p_booking_id
      and (
        b.client_id = auth.uid()
        or public.is_establishment_owner(b.establishment_id)
      )
  );
$$;

-- Lecture d'une réservation par son code (page de confirmation publique)
create or replace function public.booking_by_code(p_code text)
returns table (
  code text, day date, slot_type text, total_fcfa int,
  payment_method text, status text,
  guest_name text, arrival_time text,
  est_name text, est_city text, est_address text, est_photos text[]
)
language sql stable security definer set search_path = public as $$
  select b.code, b.day, b.slot_type, b.total_fcfa, b.payment_method, b.status,
         coalesce(b.guest_name, b.extras->>'guest_name'),
         b.extras->>'arrival_time',
         e.name, e.city, e.address, e.photos
  from public.bookings b
  join public.establishments e on e.id = b.establishment_id
  where b.code = p_code
  limit 1;
$$;
grant execute on function public.booking_by_code(text) to anon, authenticated;

-- ---------- 2. Vue publique des profils (id + nom uniquement) ----------
-- Les téléphones et emails restent protégés par le RLS de profiles.
create or replace view public.public_profiles as
  select id, full_name from public.profiles;
grant select on public.public_profiles to anon, authenticated;

-- ---------- 3. Trigger : profil auto à l'inscription ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role, referral_code)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    case when new.raw_user_meta_data->>'role' = 'tenancier'
         then 'tenancier' else 'client' end,
    coalesce(
      new.raw_user_meta_data->>'referral_code',
      'REPOS-' || upper(substr(md5(random()::text), 1, 8))
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- 4. Suppression des politiques démo ----------
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('drop policy if exists "demo_all" on public.%I', t);
  end loop;
end $$;

-- ============================================================
-- 5. Politiques durcies par table
-- ============================================================

-- ----- profiles -----
create policy "profiles_select_own_or_admin"
  on public.profiles for select to authenticated
  using (auth.uid() = id or public.my_role() = 'admin');

create policy "profiles_insert_self"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id and role in ('client', 'tenancier'));

create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id and role in ('client', 'tenancier'));
-- Note : passer un compte en admin se fait via le dashboard Supabase.

-- ----- establishments -----
create policy "establishments_public_read"
  on public.establishments for select to anon, authenticated
  using (is_active = true);

create policy "establishments_owner_read"
  on public.establishments for select to authenticated
  using (owner_id = auth.uid() or public.my_role() = 'admin');

create policy "establishments_insert"
  on public.establishments for insert to authenticated
  with check (
    (owner_id = auth.uid() and public.my_role() in ('tenancier', 'admin'))
    or public.my_role() = 'admin'
  );

create policy "establishments_owner_write"
  on public.establishments for update to authenticated
  using (owner_id = auth.uid() or public.my_role() = 'admin')
  with check (owner_id = auth.uid() or public.my_role() = 'admin');

create policy "establishments_owner_delete"
  on public.establishments for delete to authenticated
  using (owner_id = auth.uid() or public.my_role() = 'admin');

-- ----- slot_prices / promos / extras / availability_blocks -----
-- (même logique : lecture publique si établissement actif, écriture propriétaire/admin)

create policy "slot_prices_public_read"
  on public.slot_prices for select to anon, authenticated
  using (exists (
    select 1 from public.establishments e
    where e.id = establishment_id and e.is_active = true
  ));
create policy "slot_prices_owner_write"
  on public.slot_prices for insert to authenticated
  with check (public.is_establishment_owner(establishment_id) or public.my_role() = 'admin');
create policy "slot_prices_owner_update"
  on public.slot_prices for update to authenticated
  using (public.is_establishment_owner(establishment_id) or public.my_role() = 'admin')
  with check (public.is_establishment_owner(establishment_id) or public.my_role() = 'admin');
create policy "slot_prices_owner_delete"
  on public.slot_prices for delete to authenticated
  using (public.is_establishment_owner(establishment_id) or public.my_role() = 'admin');

create policy "promos_public_read"
  on public.promos for select to anon, authenticated
  using (exists (
    select 1 from public.establishments e
    where e.id = establishment_id and e.is_active = true
  ));
create policy "promos_owner_write"
  on public.promos for all to authenticated
  using (public.is_establishment_owner(establishment_id) or public.my_role() = 'admin')
  with check (public.is_establishment_owner(establishment_id) or public.my_role() = 'admin');

create policy "extras_public_read"
  on public.extras for select to anon, authenticated
  using (exists (
    select 1 from public.establishments e
    where e.id = establishment_id and e.is_active = true
  ));
create policy "extras_owner_write"
  on public.extras for all to authenticated
  using (public.is_establishment_owner(establishment_id) or public.my_role() = 'admin')
  with check (public.is_establishment_owner(establishment_id) or public.my_role() = 'admin');

create policy "blocks_public_read"
  on public.availability_blocks for select to anon, authenticated
  using (exists (
    select 1 from public.establishments e
    where e.id = establishment_id and e.is_active = true
  ));
create policy "blocks_owner_write"
  on public.availability_blocks for all to authenticated
  using (public.is_establishment_owner(establishment_id) or public.my_role() = 'admin')
  with check (public.is_establishment_owner(establishment_id) or public.my_role() = 'admin');

-- ----- bookings -----
-- Insertion ouverte (réservation invité sans compte) mais client_id verrouillé
create policy "bookings_insert"
  on public.bookings for insert to anon, authenticated
  with check (client_id is null or client_id = auth.uid());

create policy "bookings_select"
  on public.bookings for select to authenticated
  using (
    client_id = auth.uid()
    or public.is_establishment_owner(establishment_id)
    or public.my_role() = 'admin'
  );

-- Le client peut annuler ses propres réservations à venir
create policy "bookings_client_cancel"
  on public.bookings for update to authenticated
  using (client_id = auth.uid() and status in ('pending', 'confirmed'))
  with check (client_id = auth.uid() and status = 'cancelled');

-- Le tenancier / l'admin gèrent les statuts
create policy "bookings_owner_update"
  on public.bookings for update to authenticated
  using (public.is_establishment_owner(establishment_id) or public.my_role() = 'admin')
  with check (public.is_establishment_owner(establishment_id) or public.my_role() = 'admin');

create policy "bookings_admin_delete"
  on public.bookings for delete to authenticated
  using (public.my_role() = 'admin');

-- ----- reviews -----
create policy "reviews_public_read"
  on public.reviews for select to anon, authenticated
  using (is_flagged = false);

create policy "reviews_insert"
  on public.reviews for insert to authenticated
  with check (client_id = auth.uid());

create policy "reviews_update_own"
  on public.reviews for update to authenticated
  using (client_id = auth.uid())
  with check (client_id = auth.uid());

create policy "reviews_owner_update"
  on public.reviews for update to authenticated
  using (public.is_establishment_owner(establishment_id) or public.my_role() = 'admin')
  with check (public.is_establishment_owner(establishment_id) or public.my_role() = 'admin');

create policy "reviews_admin_delete"
  on public.reviews for delete to authenticated
  using (public.my_role() = 'admin');

-- ----- favorites -----
create policy "favorites_own_all"
  on public.favorites for all to authenticated
  using (client_id = auth.uid())
  with check (client_id = auth.uid());

-- ----- loyalty_ledger -----
create policy "loyalty_select_own"
  on public.loyalty_ledger for select to authenticated
  using (client_id = auth.uid() or public.my_role() = 'admin');
-- Écriture réservée au service_role (bypass RLS) et au dashboard.

-- ----- messages -----
create policy "messages_select"
  on public.messages for select to authenticated
  using (public.is_booking_participant(booking_id) or public.my_role() = 'admin');

create policy "messages_insert"
  on public.messages for insert to authenticated
  with check (sender_id = auth.uid() and public.is_booking_participant(booking_id));

-- ----- withdrawals -----
create policy "withdrawals_own_read"
  on public.withdrawals for select to authenticated
  using (owner_id = auth.uid() or public.my_role() = 'admin');

create policy "withdrawals_own_insert"
  on public.withdrawals for insert to authenticated
  with check (owner_id = auth.uid());

create policy "withdrawals_admin_update"
  on public.withdrawals for update to authenticated
  using (public.my_role() = 'admin')
  with check (public.my_role() = 'admin');

-- ----- team_members -----
create policy "team_owner_all"
  on public.team_members for all to authenticated
  using (owner_id = auth.uid() or public.my_role() = 'admin')
  with check (owner_id = auth.uid() or public.my_role() = 'admin');

-- ----- referrals -----
create policy "referrals_read"
  on public.referrals for select to authenticated
  using (
    referrer_id = auth.uid()
    or referred_id = auth.uid()
    or public.my_role() = 'admin'
  );

create policy "referrals_insert"
  on public.referrals for insert to authenticated
  with check (referrer_id = auth.uid());

-- ============================================================
-- 6. Stockage : upload réservé aux tenanciers/admins
-- (lecture publique conservée pour les photos du catalogue)
-- ============================================================
drop policy if exists "assets_anon_upload" on storage.objects;

create policy "assets_tenancier_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'assets'
    and public.my_role() in ('tenancier', 'admin')
  );

create policy "assets_tenancier_update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'assets'
    and public.my_role() in ('tenancier', 'admin')
  );

create policy "assets_tenancier_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'assets'
    and public.my_role() in ('tenancier', 'admin')
  );

-- ============================================================
-- Vérification rapide après exécution :
--   select tablename, policyname from pg_policies
--   where schemaname = 'public' order by tablename, policyname;
-- Aucune politique "demo_all" ne doit subsister.
-- ============================================================
