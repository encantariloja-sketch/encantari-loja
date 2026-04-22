-- Encantari — Schema Supabase

-- Configurações da home (JSON único)
create table if not exists configuracoes_home (
  id uuid primary key default gen_random_uuid(),
  config jsonb not null default '{}',
  atualizado_em timestamptz default now()
);

create table if not exists categorias (
  id text primary key,
  nome text not null,
  icone text,
  ordem int default 0,
  criado_em timestamptz default now()
);

create table if not exists produtos (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nome text not null,
  descricao text,
  categoria text references categorias(id),
  preco numeric(10,2) not null,
  preco_antigo numeric(10,2),
  sku text,
  imagem text,
  imagens text[],
  estoque text default 'disponivel' check (estoque in ('disponivel','sob-consulta','indisponivel')),
  destaque boolean default false,
  novo boolean default false,
  peso numeric(6,3),
  comprimento numeric(6,1),
  largura numeric(6,1),
  altura numeric(6,1),
  tags text[],
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

create table if not exists pedidos (
  id uuid primary key default gen_random_uuid(),
  mp_payment_id text,
  mp_preference_id text,
  status text default 'pendente',
  itens jsonb,
  comprador jsonb,
  endereco jsonb,
  frete_nome text,
  frete_preco numeric(10,2),
  total numeric(10,2),
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- Storage bucket para imagens de produtos
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true) on conflict do nothing;

-- RLS: permitir leitura pública dos produtos
alter table produtos enable row level security;
create policy "produtos_leitura_publica" on produtos for select using (true);

alter table categorias enable row level security;
create policy "categorias_leitura_publica" on categorias for select using (true);

-- Categorias reais da Encantari
insert into categorias (id, nome, icone, ordem) values
  ('cafes-chas',        'Cafés e Chás',         '☕', 1),
  ('canecas',           'Canecas',              '🫖', 2),
  ('vasos',             'Vasos',                '🏺', 3),
  ('flores-artificiais','Flores Artificiais',   '🌸', 4),
  ('ceramicas',         'Cerâmicas Decorativas','🪴', 5),
  ('papelaria',         'Papelaria',            '📓', 6),
  ('silvanian',         'Silvanian Families',   '🐿️', 7)
on conflict do nothing;

-- RLS para configuracoes_home (somente service role escreve)
alter table configuracoes_home enable row level security;
create policy "home_leitura_publica" on configuracoes_home for select using (true);
