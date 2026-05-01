create table if not exists public.sala_chat (
  id bigserial primary key,
  sala_slug text not null,
  device_id text not null,
  name text not null,
  text text not null check (char_length(text) between 1 and 200),
  created_at timestamptz not null default now()
);

create index if not exists sala_chat_sala_created_idx on public.sala_chat (sala_slug, created_at desc);

alter table public.sala_chat enable row level security;

drop policy if exists sala_chat_public_read on public.sala_chat;
create policy sala_chat_public_read on public.sala_chat
  for select using (true);

drop policy if exists sala_chat_no_client_insert on public.sala_chat;
create policy sala_chat_no_client_insert on public.sala_chat
  for insert to anon, authenticated with check (false);

drop policy if exists sala_chat_no_client_update on public.sala_chat;
create policy sala_chat_no_client_update on public.sala_chat
  for update to anon, authenticated using (false) with check (false);

drop policy if exists sala_chat_no_client_delete on public.sala_chat;
create policy sala_chat_no_client_delete on public.sala_chat
  for delete to anon, authenticated using (false);

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.sala_chat;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;