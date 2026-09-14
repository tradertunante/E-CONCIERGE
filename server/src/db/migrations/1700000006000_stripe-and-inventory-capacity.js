export async function up(pgm) {
  pgm.sql(`
    alter table orders
      add column stripe_checkout_session_id text unique,
      add column checkout_url text;

    alter table services
      add column shared_inventory_capacity int,
      add constraint shared_inventory_requires_capacity
        check (not shared_inventory or shared_inventory_capacity is not null);
  `);
}

export async function down(pgm) {
  pgm.sql(`
    alter table services
      drop constraint if exists shared_inventory_requires_capacity,
      drop column if exists shared_inventory_capacity;

    alter table orders
      drop column if exists checkout_url,
      drop column if exists stripe_checkout_session_id;
  `);
}
