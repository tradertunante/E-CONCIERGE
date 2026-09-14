export async function up(pgm) {
  pgm.sql(`
    create table providers (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      contact_name text,
      contact_phone text,
      contact_email text,
      payment_method text,
      payout_details jsonb not null default '{}',
      confirmation_type provider_confirmation_type not null default 'manual',
      default_commission_pct numeric(5,2) not null
        check (default_commission_pct >= 0 and default_commission_pct <= 100),
      active boolean not null default true,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table services (
      id text primary key,
      provider_id uuid not null references providers(id),
      category text not null,
      name text not null,
      price_client numeric(10,2) not null,
      price_unit text not null,
      is_deposit boolean not null default false,
      cost_provider numeric(10,2) not null,
      commission_override_pct numeric(5,2)
        check (commission_override_pct is null or (commission_override_pct >= 0 and commission_override_pct <= 100)),
      payout_basis payout_basis not null default 'full_provider_cost',
      cancellation_loss_policy loss_policy not null default 'provider',
      shared_inventory boolean not null default false,
      active boolean not null default true,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create index idx_services_provider on services(provider_id);
  `);
}

export async function down(pgm) {
  pgm.sql(`
    drop table if exists services;
    drop table if exists providers;
  `);
}
