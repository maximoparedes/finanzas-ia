-- finanzas-ia — schema inicial
-- Ejecutar en el SQL Editor de Supabase (Project > SQL Editor > New query)
-- Acceso exclusivo vía service_role (supabaseAdmin), sin policies de anon/authenticated,
-- mismo patrón que recibos-monotributo.

create extension if not exists "pgcrypto";

create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  nombre text not null,
  telegram_chat_id text,
  created_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references usuarios(id) on delete cascade,
  amount numeric(14,2) not null,
  description text not null,
  category text not null check (category in (
    'Comida','Transporte','Salidas','Supermercado','Servicios','Gimnasio',
    'Ropa','Salud','Educación','Suscripciones','Inversiones','Otros'
  )),
  date date not null,
  payment_method text not null default 'debito'
    check (payment_method in ('efectivo','debito','credito','transferencia','otro')),
  type text not null default 'variable' check (type in ('fijo','variable')),
  source text not null default 'manual' check (source in ('manual','mercadopago')),
  mp_transaction_id text,
  dedupe_hash text not null,
  category_source text not null default 'manual' check (category_source in ('manual','ai','ai_low_confidence')),
  category_confidence numeric(3,2),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, dedupe_hash)
);
create index if not exists transactions_user_date_idx on transactions (user_id, date desc);
create index if not exists transactions_needs_review_idx on transactions (user_id) where category_source = 'ai_low_confidence';

create table if not exists monthly_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references usuarios(id) on delete cascade,
  month text not null,
  category text,             -- null = presupuesto general
  amount numeric(14,2) not null,
  created_at timestamptz not null default now()
);
-- Postgres no considera iguales dos NULL a los fines de un unique constraint normal,
-- así que un solo "unique (user_id, month, category)" no evita dos presupuestos
-- generales (category null) para el mismo mes. Se separan en dos índices parciales.
create unique index if not exists monthly_budgets_general_unique
  on monthly_budgets (user_id, month) where category is null;
create unique index if not exists monthly_budgets_category_unique
  on monthly_budgets (user_id, month, category) where category is not null;

create table if not exists budget_alerts_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references usuarios(id) on delete cascade,
  month text not null,
  category text,             -- null = alerta de scope general
  threshold_pct int not null,
  sent_at timestamptz not null default now(),
  channel text not null default 'telegram'
);
create unique index if not exists budget_alerts_log_general_unique
  on budget_alerts_log (user_id, month, threshold_pct) where category is null;
create unique index if not exists budget_alerts_log_category_unique
  on budget_alerts_log (user_id, month, category, threshold_pct) where category is not null;

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references usuarios(id) on delete cascade,
  conversation_id uuid not null,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_conversation_idx on chat_messages (conversation_id, created_at);

alter table usuarios enable row level security;
alter table transactions enable row level security;
alter table monthly_budgets enable row level security;
alter table budget_alerts_log enable row level security;
alter table chat_messages enable row level security;
