export async function up(pgm) {
  pgm.sql(`
    alter table services
      add column subcategory text,
      add column location text,
      add column tagline text,
      add column description text,
      add column long_description text,
      add column duration text,
      add column times text[] not null default '{}',
      add column recommended boolean not null default false,
      add column image_url text,
      add column capacity text;
  `);
}

export async function down(pgm) {
  pgm.sql(`
    alter table services
      drop column if exists capacity,
      drop column if exists image_url,
      drop column if exists recommended,
      drop column if exists times,
      drop column if exists duration,
      drop column if exists long_description,
      drop column if exists description,
      drop column if exists tagline,
      drop column if exists location,
      drop column if exists subcategory;
  `);
}
