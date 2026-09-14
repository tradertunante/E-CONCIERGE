export async function up(pgm) {
  pgm.sql(`
    create table inventory_slots (
      id uuid primary key default gen_random_uuid(),
      service_id text not null references services(id),
      day date not null,
      time text not null,
      capacity_total int not null check (capacity_total > 0),
      capacity_booked int not null default 0 check (capacity_booked >= 0),
      constraint capacity_not_exceeded check (capacity_booked <= capacity_total),
      unique (service_id, day, time)
    );
  `);
}

export async function down(pgm) {
  pgm.sql(`drop table if exists inventory_slots;`);
}
