-- Create projects table
create table projects (
  id bigserial primary key,
  name text not null,
  outline jsonb not null, -- Array of {x, y, color}
  created_by text not null,
  created_at timestamp with time zone not null default now()
);

-- Create project_contributions table
create table project_contributions (
  id bigserial primary key,
  project_id bigint references projects(id) on delete cascade,
  x integer not null,
  y integer not null,
  color text not null,
  filled_by text not null, -- user id 
  filled_at timestamp with time zone not null default now(),
  unique (project_id, x, y)
);

-- Enable Row Level Security 
alter table projects enable row level security;
alter table project_contributions enable row level security;

-- Anyone can read
create policy "Anyone can read projects" on projects for select using (true);
create policy "Anyone can read project_contributions" on project_contributions for select using (true); 

-- Only authenticated users can insert contributions
create policy "Authenticated can contribute" on project_contributions for insert
  to authenticated
  with check (true); 