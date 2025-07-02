-- Create customers table
create table
  public.customers (
    id uuid not null default gen_random_uuid (),
    user_id uuid not null,
    created_at timestamp with time zone not null default now(),
    name text not null,
    nic text not null,
    contact text not null,
    order_history text null,
    preferences text null,
    constraint customers_pkey primary key (id),
    constraint customers_user_id_fkey foreign key (user_id) references auth.users (id) on update cascade on delete cascade
  ) tablespace pg_default;

-- Create measurement_sets table
create table
  public.measurement_sets (
    id uuid not null default gen_random_uuid (),
    customer_id uuid not null,
    created_at timestamp with time zone not null default now(),
    date text not null,
    measurements jsonb not null,
    job_number text null,
    request_date text null,
    payment_status text not null,
    order_status text not null,
    completion_date text null,
    handover_date text null,
    constraint measurement_sets_pkey primary key (id),
    constraint measurement_sets_customer_id_fkey foreign key (customer_id) references customers (id) on update cascade on delete cascade
  ) tablespace pg_default;

-- Secure the tables with Row Level Security
-- 1. Enable RLS on the tables
alter table public.customers enable row level security;
alter table public.measurement_sets enable row level security;

-- 2. Create policies for customers table
create policy "Users can view their own customers" on public.customers for
select
  using (auth.uid () = user_id);

create policy "Users can insert their own customers" on public.customers for
insert
  with check (auth.uid () = user_id);

create policy "Users can update their own customers" on public.customers for
update
  using (auth.uid () = user_id);

create policy "Users can delete their own customers" on public.customers for
delete
  using (auth.uid () = user_id);


-- 3. Create policies for measurement_sets table
create policy "Users can view measurement sets for their own customers" on public.measurement_sets for
select
  using (
    exists (
      select
        1
      from
        customers
      where
        customers.id = measurement_sets.customer_id and customers.user_id = auth.uid()
    )
  );

create policy "Users can insert measurement sets for their own customers" on public.measurement_sets for
insert
  with check (
    exists (
      select
        1
      from
        customers
      where
        customers.id = measurement_sets.customer_id and customers.user_id = auth.uid()
    )
  );

create policy "Users can update measurement sets for their own customers" on public.measurement_sets for
update
  using (
    exists (
      select
        1
      from
        customers
      where
        customers.id = measurement_sets.customer_id and customers.user_id = auth.uid()
    )
  );

create policy "Users can delete measurement sets for their own customers" on public.measurement_sets for
delete
  using (
    exists (
      select
        1
      from
        customers
      where
        customers.id = measurement_sets.customer_id and customers.user_id = auth.uid()
    )
  );
