import { LogOut, Pencil, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import {
  clearOpsKey,
  getOpsKey,
  opsCreateProvider,
  opsCreateService,
  opsListProviders,
  opsListServices,
  opsUpdateProvider,
  opsUpdateService,
  setOpsKey,
} from "../lib/opsApi";

const inputClass =
  "rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400";
const labelClass = "flex flex-col gap-1 text-sm";

function AdminGate({ onReady }) {
  const [key, setKey] = useState("");
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setChecking(true);
    setOpsKey(key.trim());
    try {
      await opsListProviders();
      onReady();
    } catch (err) {
      clearOpsKey();
      setError(err.status === 401 ? "Clave incorrecta." : err.message);
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-24">
      <h1 className="font-display text-2xl font-semibold text-ocean-900">Panel de operaciones</h1>
      <p className="mt-2 text-sm text-ocean-800/70">
        Acceso interno. Ingresa la clave de operaciones para continuar.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Clave de operaciones"
          className={inputClass}
          autoFocus
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={!key.trim() || checking}
          className="rounded-full bg-ocean-700 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
        >
          {checking ? "Verificando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

const CONFIRMATION_TYPES = [
  { value: "manual", label: "Manual (WhatsApp)" },
  { value: "auto_cupos", label: "Automática (cupos propios)" },
  { value: "auto_api", label: "Automática (API del proveedor)" },
];

function emptyProviderForm() {
  return {
    name: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    paymentMethod: "",
    payoutClabe: "",
    payoutBank: "",
    confirmationType: "manual",
    defaultCommissionPct: "20",
    active: true,
  };
}

function providerToForm(p) {
  return {
    name: p.name || "",
    contactName: p.contact_name || "",
    contactPhone: p.contact_phone || "",
    contactEmail: p.contact_email || "",
    paymentMethod: p.payment_method || "",
    payoutClabe: p.payout_details?.clabe || "",
    payoutBank: p.payout_details?.bank || "",
    confirmationType: p.confirmation_type,
    defaultCommissionPct: String(p.default_commission_pct),
    active: p.active,
  };
}

function ProvidersPanel({ providers, onChanged }) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyProviderForm());
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  function startCreate() {
    setEditingId(null);
    setForm(emptyProviderForm());
    setShowForm(true);
    setError(null);
  }

  function startEdit(p) {
    setEditingId(p.id);
    setForm(providerToForm(p));
    setShowForm(true);
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      name: form.name.trim(),
      contactName: form.contactName.trim() || null,
      contactPhone: form.contactPhone.trim() || null,
      contactEmail: form.contactEmail.trim() || null,
      paymentMethod: form.paymentMethod.trim() || null,
      payoutDetails: { clabe: form.payoutClabe.trim(), bank: form.payoutBank.trim() },
      confirmationType: form.confirmationType,
      defaultCommissionPct: Number(form.defaultCommissionPct),
      active: form.active,
    };
    try {
      if (editingId) {
        await opsUpdateProvider(editingId, payload);
      } else {
        await opsCreateProvider(payload);
      }
      setShowForm(false);
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ocean-900">Proveedores</h2>
        <button
          onClick={startCreate}
          className="flex items-center gap-1 rounded-full bg-ocean-700 px-4 py-2 text-sm font-semibold text-white hover:bg-ocean-800"
        >
          <Plus size={15} /> Nuevo proveedor
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-sand-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-sand-100 text-xs uppercase tracking-wide text-ocean-700/60">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Contacto</th>
              <th className="px-4 py-3">Confirmación</th>
              <th className="px-4 py-3">Comisión</th>
              <th className="px-4 py-3">Activo</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {providers.map((p) => (
              <tr key={p.id} className="border-b border-sand-50 last:border-0">
                <td className="px-4 py-3 font-medium text-ocean-900">{p.name}</td>
                <td className="px-4 py-3 text-ocean-800/70">
                  {p.contact_phone || p.contact_email || "—"}
                </td>
                <td className="px-4 py-3 text-ocean-800/70">{p.confirmation_type}</td>
                <td className="px-4 py-3 text-ocean-800/70">{p.default_commission_pct}%</td>
                <td className="px-4 py-3">{p.active ? "Sí" : "No"}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => startEdit(p)}
                    className="text-ocean-700/60 hover:text-ocean-800"
                  >
                    <Pencil size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {providers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ocean-700/50">
                  Sin proveedores todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 grid gap-4 rounded-2xl border border-sand-200 bg-white p-6 sm:grid-cols-2"
        >
          <h3 className="font-display text-base font-semibold text-ocean-900 sm:col-span-2">
            {editingId ? "Editar proveedor" : "Nuevo proveedor"}
          </h3>
          <label className={labelClass}>
            <span>Nombre</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            <span>Persona de contacto</span>
            <input
              value={form.contactName}
              onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            <span>Teléfono (WhatsApp)</span>
            <input
              value={form.contactPhone}
              onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            <span>Correo</span>
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            <span>Método de pago</span>
            <input
              value={form.paymentMethod}
              onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))}
              placeholder="Transferencia SPEI"
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            <span>CLABE</span>
            <input
              value={form.payoutClabe}
              onChange={(e) => setForm((f) => ({ ...f, payoutClabe: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            <span>Banco</span>
            <input
              value={form.payoutBank}
              onChange={(e) => setForm((f) => ({ ...f, payoutBank: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            <span>Tipo de confirmación</span>
            <select
              value={form.confirmationType}
              onChange={(e) => setForm((f) => ({ ...f, confirmationType: e.target.value }))}
              className={inputClass}
            >
              {CONFIRMATION_TYPES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            <span>Comisión por default (%)</span>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              required
              value={form.defaultCommissionPct}
              onChange={(e) => setForm((f) => ({ ...f, defaultCommissionPct: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
            />
            Proveedor activo
          </label>

          {error && <p className="text-sm text-red-500 sm:col-span-2">{error}</p>}

          <div className="flex gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-ocean-700 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-full border border-sand-300 px-5 py-2 text-sm font-semibold text-ocean-800"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

const CATEGORY_OPTIONS = ["restaurantes", "actividades", "transporte"];
const PAYOUT_BASIS_OPTIONS = [
  { value: "full_provider_cost", label: "Costo completo al proveedor" },
  { value: "deposit_passthrough", label: "Depósito (proveedor cobra el resto directo)" },
  { value: "none", label: "Ninguno (no se paga payout)" },
];
const CANCELLATION_POLICY_OPTIONS = [
  { value: "provider", label: "Proveedor absorbe" },
  { value: "platform", label: "Nosotros absorbemos" },
  { value: "guest", label: "Huésped absorbe (no reembolsable)" },
  { value: "split", label: "Se reparte" },
];

function emptyServiceForm() {
  return {
    id: "",
    providerId: "",
    category: "actividades",
    subcategory: "",
    name: "",
    location: "",
    tagline: "",
    description: "",
    longDescription: "",
    priceClient: "",
    priceUnit: "persona",
    isDeposit: false,
    costProvider: "",
    commissionOverridePct: "",
    payoutBasis: "full_provider_cost",
    cancellationLossPolicy: "provider",
    sharedInventory: false,
    sharedInventoryCapacity: "",
    duration: "",
    times: "",
    recommended: false,
    imageUrl: "",
    capacity: "",
    active: true,
  };
}

function serviceToForm(s) {
  return {
    id: s.id,
    providerId: s.provider_id,
    category: s.category,
    subcategory: s.subcategory || "",
    name: s.name,
    location: s.location || "",
    tagline: s.tagline || "",
    description: s.description || "",
    longDescription: s.long_description || "",
    priceClient: String(s.price_client),
    priceUnit: s.price_unit,
    isDeposit: s.is_deposit,
    costProvider: String(s.cost_provider),
    commissionOverridePct: s.commission_override_pct != null ? String(s.commission_override_pct) : "",
    payoutBasis: s.payout_basis,
    cancellationLossPolicy: s.cancellation_loss_policy,
    sharedInventory: s.shared_inventory,
    sharedInventoryCapacity: s.shared_inventory_capacity != null ? String(s.shared_inventory_capacity) : "",
    duration: s.duration || "",
    times: (s.times || []).join(", "),
    recommended: s.recommended,
    imageUrl: s.image_url || "",
    capacity: s.capacity || "",
    active: s.active,
  };
}

function ServicesPanel({ services, providers, onChanged }) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyServiceForm());
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  function startCreate() {
    setEditingId(null);
    setForm({ ...emptyServiceForm(), providerId: providers[0]?.id || "" });
    setShowForm(true);
    setError(null);
  }

  function startEdit(s) {
    setEditingId(s.id);
    setForm(serviceToForm(s));
    setShowForm(true);
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      id: form.id.trim() || undefined,
      providerId: form.providerId,
      category: form.category,
      subcategory: form.subcategory.trim() || null,
      name: form.name.trim(),
      location: form.location.trim() || null,
      tagline: form.tagline.trim() || null,
      description: form.description.trim() || null,
      longDescription: form.longDescription.trim() || null,
      priceClient: Number(form.priceClient),
      priceUnit: form.priceUnit,
      isDeposit: form.isDeposit,
      costProvider: Number(form.costProvider),
      commissionOverridePct: form.commissionOverridePct.trim() ? Number(form.commissionOverridePct) : null,
      payoutBasis: form.payoutBasis,
      cancellationLossPolicy: form.cancellationLossPolicy,
      sharedInventory: form.sharedInventory,
      sharedInventoryCapacity: form.sharedInventory && form.sharedInventoryCapacity ? Number(form.sharedInventoryCapacity) : null,
      duration: form.duration.trim() || null,
      times: form.times.split(",").map((t) => t.trim()).filter(Boolean),
      recommended: form.recommended,
      imageUrl: form.imageUrl.trim() || null,
      capacity: form.capacity.trim() || null,
      active: form.active,
    };
    try {
      if (editingId) {
        await opsUpdateService(editingId, payload);
      } else {
        await opsCreateService(payload);
      }
      setShowForm(false);
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ocean-900">Servicios (anuncios)</h2>
        <button
          onClick={startCreate}
          disabled={providers.length === 0}
          className="flex items-center gap-1 rounded-full bg-ocean-700 px-4 py-2 text-sm font-semibold text-white hover:bg-ocean-800 disabled:opacity-40"
        >
          <Plus size={15} /> Nuevo servicio
        </button>
      </div>
      {providers.length === 0 && (
        <p className="mt-2 text-xs text-ocean-700/60">
          Crea primero un proveedor para poder publicar un servicio.
        </p>
      )}

      <div className="mt-4 overflow-x-auto rounded-2xl border border-sand-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-sand-100 text-xs uppercase tracking-wide text-ocean-700/60">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Proveedor</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Activo</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-b border-sand-50 last:border-0">
                <td className="px-4 py-3 font-medium text-ocean-900">{s.name}</td>
                <td className="px-4 py-3 text-ocean-800/70">
                  {s.category}
                  {s.subcategory ? ` / ${s.subcategory}` : ""}
                </td>
                <td className="px-4 py-3 text-ocean-800/70">{s.provider_name}</td>
                <td className="px-4 py-3 text-ocean-800/70">
                  ${Number(s.price_client).toLocaleString("es-MX")} / {s.price_unit}
                </td>
                <td className="px-4 py-3">{s.active ? "Sí" : "No"}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => startEdit(s)}
                    className="text-ocean-700/60 hover:text-ocean-800"
                  >
                    <Pencil size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ocean-700/50">
                  Sin servicios todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 grid gap-4 rounded-2xl border border-sand-200 bg-white p-6 sm:grid-cols-2"
        >
          <h3 className="font-display text-base font-semibold text-ocean-900 sm:col-span-2">
            {editingId ? "Editar servicio" : "Nuevo servicio"}
          </h3>

          {!editingId && (
            <label className={labelClass}>
              <span>Id (opcional, se genera del nombre)</span>
              <input
                value={form.id}
                onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
                placeholder="utv-rental-1"
                className={inputClass}
              />
            </label>
          )}
          <label className={labelClass}>
            <span>Proveedor</span>
            <select
              required
              value={form.providerId}
              onChange={(e) => setForm((f) => ({ ...f, providerId: e.target.value }))}
              className={inputClass}
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            <span>Categoría</span>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className={inputClass}
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            <span>Subcategoría (solo actividades)</span>
            <input
              value={form.subcategory}
              onChange={(e) => setForm((f) => ({ ...f, subcategory: e.target.value }))}
              placeholder="land / water / city / boats"
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            <span>Nombre</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            <span>Ubicación</span>
            <input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            <span>Tagline</span>
            <input
              value={form.tagline}
              onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            <span>URL de imagen</span>
            <input
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              placeholder="https://..."
              className={inputClass}
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            <span>Descripción corta</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className={inputClass}
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            <span>Descripción larga</span>
            <textarea
              value={form.longDescription}
              onChange={(e) => setForm((f) => ({ ...f, longDescription: e.target.value }))}
              rows={3}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            <span>Duración</span>
            <input
              value={form.duration}
              onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
              placeholder="2 hrs"
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            <span>Horarios (separados por coma)</span>
            <input
              value={form.times}
              onChange={(e) => setForm((f) => ({ ...f, times: e.target.value }))}
              placeholder="10:00, 13:00, 16:00"
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            <span>Precio al cliente (MXN)</span>
            <input
              type="number"
              min="0"
              required
              value={form.priceClient}
              onChange={(e) => setForm((f) => ({ ...f, priceClient: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            <span>Unidad de precio</span>
            <input
              value={form.priceUnit}
              onChange={(e) => setForm((f) => ({ ...f, priceUnit: e.target.value }))}
              placeholder="persona / trayecto / unidad"
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            <span>Costo del proveedor (MXN)</span>
            <input
              type="number"
              min="0"
              required
              value={form.costProvider}
              onChange={(e) => setForm((f) => ({ ...f, costProvider: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            <span>Comisión especial (%, opcional)</span>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={form.commissionOverridePct}
              onChange={(e) => setForm((f) => ({ ...f, commissionOverridePct: e.target.value }))}
              placeholder="usa la del proveedor si se deja vacío"
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            <span>Qué se le paga al proveedor</span>
            <select
              value={form.payoutBasis}
              onChange={(e) => setForm((f) => ({ ...f, payoutBasis: e.target.value }))}
              className={inputClass}
            >
              {PAYOUT_BASIS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            <span>Cancelación tardía / no-show, ¿quién absorbe?</span>
            <select
              value={form.cancellationLossPolicy}
              onChange={(e) => setForm((f) => ({ ...f, cancellationLossPolicy: e.target.value }))}
              className={inputClass}
            >
              {CANCELLATION_POLICY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isDeposit}
              onChange={(e) => setForm((f) => ({ ...f, isDeposit: e.target.checked }))}
            />
            Es depósito de reservación (ej. restaurantes)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.recommended}
              onChange={(e) => setForm((f) => ({ ...f, recommended: e.target.checked }))}
            />
            Recomendado por el concierge
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.sharedInventory}
              onChange={(e) => setForm((f) => ({ ...f, sharedInventory: e.target.checked }))}
            />
            Cupo compartido (ej. flotilla de UTVs)
          </label>
          {form.sharedInventory && (
            <label className={labelClass}>
              <span>Capacidad por día/horario</span>
              <input
                type="number"
                min="1"
                required
                value={form.sharedInventoryCapacity}
                onChange={(e) => setForm((f) => ({ ...f, sharedInventoryCapacity: e.target.value }))}
                className={inputClass}
              />
            </label>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
            />
            Publicado en el catálogo
          </label>

          {error && <p className="text-sm text-red-500 sm:col-span-2">{error}</p>}

          <div className="flex gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-ocean-700 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-full border border-sand-300 px-5 py-2 text-sm font-semibold text-ocean-800"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function AdminDashboard() {
  const [tab, setTab] = useState("providers");
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [loadError, setLoadError] = useState(null);

  async function refresh() {
    try {
      const [{ providers }, { services }] = await Promise.all([opsListProviders(), opsListServices()]);
      setProviders(providers);
      setServices(services);
    } catch (err) {
      setLoadError(err.message);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-sand-600">
            Panel de operaciones
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ocean-900">
            Proveedores y catálogo
          </h1>
        </div>
        <button
          onClick={() => {
            clearOpsKey();
            window.location.reload();
          }}
          className="flex items-center gap-1 rounded-full border border-sand-300 px-4 py-2 text-sm font-semibold text-ocean-800 hover:bg-sand-100"
        >
          <LogOut size={15} /> Salir
        </button>
      </div>

      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setTab("providers")}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            tab === "providers" ? "bg-ocean-700 text-white" : "bg-white text-ocean-800 border border-sand-200"
          }`}
        >
          Proveedores
        </button>
        <button
          onClick={() => setTab("services")}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            tab === "services" ? "bg-ocean-700 text-white" : "bg-white text-ocean-800 border border-sand-200"
          }`}
        >
          Servicios
        </button>
      </div>

      {loadError && <p className="mt-4 text-sm text-red-500">{loadError}</p>}

      <div className="mt-6">
        {tab === "providers" ? (
          <ProvidersPanel providers={providers} onChanged={refresh} />
        ) : (
          <ServicesPanel services={services} providers={providers} onChanged={refresh} />
        )}
      </div>
    </div>
  );
}

export default function Admin() {
  const [ready, setReady] = useState(() => Boolean(getOpsKey()));

  if (!ready) {
    return <AdminGate onReady={() => setReady(true)} />;
  }
  return <AdminDashboard />;
}
