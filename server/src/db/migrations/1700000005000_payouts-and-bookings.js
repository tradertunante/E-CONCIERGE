export async function up(pgm) {
  pgm.sql(`
    create table payouts (
      id uuid primary key default gen_random_uuid(),
      provider_id uuid not null references providers(id),
      period_start date not null,
      period_end date not null,
      status payout_status not null default 'pendiente',
      total_amount numeric(10,2) not null default 0,
      payment_reference text,
      paid_at timestamptz,
      created_at timestamptz not null default now(),
      unique (provider_id, period_start, period_end)
    );

    create table bookings (
      id uuid primary key default gen_random_uuid(),
      order_id uuid not null references orders(id),
      service_id text not null references services(id),
      provider_id uuid not null references providers(id),
      inventory_slot_id uuid references inventory_slots(id),
      day date not null,
      time text not null,
      people int not null check (people > 0),
      is_deposit boolean not null,
      price_client numeric(10,2) not null,
      cost_provider numeric(10,2) not null,
      commission_pct numeric(5,2) not null,
      commission_amount numeric(10,2) not null,
      payout_basis payout_basis not null,
      cancellation_loss_policy loss_policy not null,
      status booking_status not null default 'pendiente_pago',
      hold_expires_at timestamptz,
      confirmation_deadline timestamptz,
      confirmed_at timestamptz,
      rejected_reason text,
      cancelled_at timestamptz,
      refund_amount numeric(10,2) not null default 0,
      refund_status text,
      payout_id uuid references payouts(id),
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table booking_events (
      id uuid primary key default gen_random_uuid(),
      booking_id uuid not null references bookings(id),
      from_status booking_status,
      to_status booking_status not null,
      actor text not null,
      note text,
      created_at timestamptz not null default now()
    );

    create index idx_bookings_order on bookings(order_id);
    create index idx_bookings_provider_status on bookings(provider_id, status);
    create index idx_bookings_payout on bookings(payout_id);
    create index idx_bookings_confirmation_deadline on bookings(confirmation_deadline)
      where status = 'pendiente_confirmacion_proveedor';
    create index idx_bookings_hold_expiry on bookings(hold_expires_at)
      where status = 'pendiente_pago';
    create index idx_booking_events_booking on booking_events(booking_id);
  `);
}

export async function down(pgm) {
  pgm.sql(`
    drop table if exists booking_events;
    drop table if exists bookings;
    drop table if exists payouts;
  `);
}
