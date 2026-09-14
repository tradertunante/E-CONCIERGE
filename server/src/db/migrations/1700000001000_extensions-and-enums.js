export async function up(pgm) {
  pgm.sql(`create extension if not exists pgcrypto;`);

  pgm.sql(`
    create type provider_confirmation_type as enum ('auto_cupos','auto_api','manual');
    create type booking_status as enum (
      'pendiente_pago','pagado','pendiente_confirmacion_proveedor',
      'confirmado','rechazado','completado','incluido_en_payout','pagado_a_proveedor',
      'cancelado','reembolsado'
    );
    create type order_payment_status as enum ('pendiente','pagado','fallido','parcialmente_reembolsado','reembolsado');
    create type payout_status as enum ('pendiente','pagado');
    create type payout_basis as enum ('full_provider_cost','deposit_passthrough','none');
    create type loss_policy as enum ('platform','provider','guest','split');
  `);
}

export async function down(pgm) {
  pgm.sql(`
    drop type if exists loss_policy;
    drop type if exists payout_basis;
    drop type if exists payout_status;
    drop type if exists order_payment_status;
    drop type if exists booking_status;
    drop type if exists provider_confirmation_type;
  `);
}
