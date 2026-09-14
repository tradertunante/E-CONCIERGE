export async function up(pgm) {
  pgm.sql(`
    create table orders (
      id uuid primary key default gen_random_uuid(),
      idempotency_key text not null unique,
      guest_name text not null,
      guest_email text not null,
      guest_phone text not null,
      trip_start date not null,
      trip_end date not null,
      guests_count int not null,
      currency_display text not null default 'MXN',
      exchange_rate_mxn_usd numeric(10,4) not null,
      promo_code text,
      discount_amount numeric(10,2) not null default 0,
      subtotal_mxn numeric(10,2) not null,
      total_mxn numeric(10,2) not null,
      payment_status order_payment_status not null default 'pendiente',
      confirmation_code text not null unique,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table payments (
      id uuid primary key default gen_random_uuid(),
      order_id uuid not null references orders(id),
      gateway text not null,
      gateway_transaction_id text not null,
      gateway_payment_method text,
      amount_mxn numeric(10,2) not null,
      status text not null,
      raw_event jsonb,
      created_at timestamptz not null default now(),
      unique (gateway, gateway_transaction_id)
    );

    create table webhook_events (
      id uuid primary key default gen_random_uuid(),
      gateway text not null,
      event_id text not null,
      event_type text not null,
      payload jsonb not null,
      received_at timestamptz not null default now(),
      unique (gateway, event_id)
    );

    create index idx_payments_order on payments(order_id);
  `);
}

export async function down(pgm) {
  pgm.sql(`
    drop table if exists webhook_events;
    drop table if exists payments;
    drop table if exists orders;
  `);
}
