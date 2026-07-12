-- Run this in Supabase SQL Editor (Dashboard → SQL → New query)

create extension if not exists vector;

create table documents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source_type text default 'text',
  created_at timestamp default now()
);

create table chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  content text not null,
  chunk_index integer,
  embedding vector(768),
  created_at timestamp default now()
);

create table chat_history (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sources jsonb,
  confidence text,
  created_at timestamp default now()
);

create or replace function match_chunks(
  query_embedding vector(768),
  match_count int default 3
)
returns table(id uuid, content text, document_id uuid, chunk_index int, similarity float)
language sql stable as $$
  select id, content, document_id, chunk_index,
    1 - (embedding <=> query_embedding) as similarity
  from chunks
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- Demo policies (allow backend via anon key). Tighten for production.
alter table documents enable row level security;
alter table chunks enable row level security;
alter table chat_history enable row level security;

create policy "documents_all" on documents for all using (true) with check (true);
create policy "chunks_all" on chunks for all using (true) with check (true);
create policy "chat_history_all" on chat_history for all using (true) with check (true);

grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant execute on function match_chunks to anon, authenticated;
