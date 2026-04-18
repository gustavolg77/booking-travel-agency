"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { lookupClientByDocument } from "@/features/clients/api/clients";
import { createSale, listSales } from "@/features/sales/api/sales";
import { formatDate, formatMoney } from "@/lib/format";
import { ClientListItem, DocumentType } from "@/types/client";
import { CreateSalePayload, PaymentMethod, Sale } from "@/types/sale";

type ClientMode = "existing" | "new";
type ActiveModal = "confirm" | "cancel" | null;

interface SaleFormItem {
  passengerFirstName: string;
  passengerLastName: string;
  passengerDocType: DocumentType;
  passengerDocNumber: string;
  routeOrigin: string;
  routeDestination: string;
  flightDate: string;
  issueDate: string;
  ticketNumber: string;
  airline: string;
  amountClient: string;
  amountKovar: string;
  commissionAmount: string;
}

const emptyItem = (): SaleFormItem => ({
  passengerFirstName: "",
  passengerLastName: "",
  passengerDocType: "CI",
  passengerDocNumber: "",
  routeOrigin: "",
  routeDestination: "",
  flightDate: "",
  issueDate: "",
  ticketNumber: "",
  airline: "",
  amountClient: "",
  amountKovar: "",
  commissionAmount: "",
});

export function SalesWorkspace() {
  const router = useRouter();
  const [clientMode, setClientMode] = useState<ClientMode>("existing");
  const [documentType, setDocumentType] = useState<DocumentType>("CI");
  const [documentNumber, setDocumentNumber] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientListItem | null>(null);
  const [lookupMessage, setLookupMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("TRANSFER");
  const [notes, setNotes] = useState("");
  const [saleDate, setSaleDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [newClient, setNewClient] = useState({
    firstName: "",
    lastName: "",
    documentType: "CI",
    documentNumber: "",
    phone: "",
    email: "",
    nit: "",
    businessName: "",
    notes: "",
  });
  const [items, setItems] = useState<SaleFormItem[]>([emptyItem()]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [latestSaleId, setLatestSaleId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const loadSales = useCallback(async () => {
    setLoadingSales(true);

    try {
      const data = await listSales({});
      setRecentSales(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las ventas");
    } finally {
      setLoadingSales(false);
    }
  }, []);

  useEffect(() => {
    void loadSales();
  }, [loadSales]);

  const handleLookupClient = async () => {
    setLookupMessage("");
    setError("");

    try {
      const client = await lookupClientByDocument(documentType, documentNumber);
      setSelectedClient(client);
      setClientMode("existing");
      setLookupMessage("Cliente encontrado y cargado correctamente.");
    } catch {
      setSelectedClient(null);
      setLookupMessage(
        "No existe un cliente con ese documento. Puedes registrarlo en la misma venta."
      );
      setClientMode("new");
      setNewClient((current) => ({
        ...current,
        documentType,
        documentNumber,
      }));
    }
  };

  const updateItem = (
    index: number,
    field: keyof SaleFormItem,
    value: string
  ) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  const addItem = () => {
    setItems((current) => [...current, emptyItem()]);
  };

  const removeItem = (index: number) => {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const totalClient = items.reduce(
    (acc, item) => acc + (Number(item.amountClient) || 0),
    0
  );
  const totalKovar = items.reduce(
    (acc, item) => acc + (Number(item.amountKovar) || 0),
    0
  );
  const totalCommission = items.reduce(
    (acc, item) => acc + (Number(item.commissionAmount) || 0),
    0
  );

  const customerName = useMemo(() => {
    if (selectedClient) {
      return `${selectedClient.firstName} ${selectedClient.lastName}`;
    }

    return `${newClient.firstName || "-"} ${newClient.lastName || ""}`.trim();
  }, [newClient.firstName, newClient.lastName, selectedClient]);

  const resetForm = () => {
    setClientMode("existing");
    setSelectedClient(null);
    setDocumentType("CI");
    setDocumentNumber("");
    setLookupMessage("");
    setPaymentMethod("TRANSFER");
    setNotes("");
    setSaleDate(new Date().toISOString().slice(0, 10));
    setNewClient({
      firstName: "",
      lastName: "",
      documentType: "CI",
      documentNumber: "",
      phone: "",
      email: "",
      nit: "",
      businessName: "",
      notes: "",
    });
    setItems([emptyItem()]);
  };

  const buildPayload = (): CreateSalePayload => {
    const payload: CreateSalePayload = {
      saleDate,
      paymentMethod,
      notes,
      items: items.map((item) => ({
        passengerFirstName: item.passengerFirstName,
        passengerLastName: item.passengerLastName,
        passengerDocType: item.passengerDocType,
        passengerDocNumber: item.passengerDocNumber || undefined,
        routeOrigin: item.routeOrigin,
        routeDestination: item.routeDestination,
        issueDate: item.issueDate || undefined,
        flightDate: item.flightDate || undefined,
        ticketNumber: item.ticketNumber || undefined,
        airline: item.airline || undefined,
        amountClient: Number(item.amountClient || 0),
        amountKovar: Number(item.amountKovar || 0),
        commissionAmount: Number(item.commissionAmount || 0),
      })),
    };

    if (clientMode === "existing" && selectedClient) {
      payload.clientId = selectedClient.id;
    }

    if (clientMode === "new") {
      payload.newClient = {
        ...newClient,
        documentType: newClient.documentType,
      };
    }

    return payload;
  };

  const handleConfirmSale = async () => {
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const sale = await createSale(buildPayload());
      setLatestSaleId(sale.id);
      setSuccess(`Venta ${sale.saleNumber} registrada correctamente.`);
      setActiveModal(null);
      resetForm();
      await loadSales();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo registrar la venta");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    items.length > 0 &&
    items.every(
      (item) =>
        item.passengerFirstName &&
        item.passengerLastName &&
        item.routeOrigin &&
        item.routeDestination &&
        item.amountClient
    ) &&
    ((clientMode === "existing" && !!selectedClient) ||
      (clientMode === "new" &&
        newClient.firstName &&
        newClient.lastName &&
        newClient.documentNumber));

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-sky-600">
              Nueva venta
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              Registro operativo de venta
            </h1>
            <p className="mt-2 text-slate-500">
              Sigue el flujo real: cliente, pasajeros, resumen, confirmacion o cancelacion.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/dashboard/sales"
              className="rounded-2xl border border-slate-200 px-4 py-3 font-medium text-slate-700"
            >
              Menu ventas
            </Link>
            <button
              onClick={() => setActiveModal("cancel")}
              className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 font-medium text-rose-700"
            >
              Cancelar venta
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.4fr_0.8fr]">
          <div className="p-6 lg:p-8 space-y-6">
            <div className="grid md:grid-cols-[1fr_auto] gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                >
                  <option value="CI">CI</option>
                  <option value="PASSPORT">Pasaporte</option>
                  <option value="NIT">NIT</option>
                  <option value="OTHER">Otro</option>
                </select>
                <input
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="Documento del cliente"
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
              </div>

              <button
                onClick={() => void handleLookupClient()}
                className="rounded-2xl border border-slate-200 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
              >
                Buscar cliente
              </button>
            </div>

            {lookupMessage && (
              <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sky-700">
                {lookupMessage}
              </div>
            )}

            <div className="rounded-2xl bg-slate-50 p-4 flex gap-3 flex-wrap">
              <button
                onClick={() => setClientMode("existing")}
                className={`rounded-xl px-4 py-2 font-medium ${
                  clientMode === "existing"
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                Cliente existente
              </button>
              <button
                onClick={() => setClientMode("new")}
                className={`rounded-xl px-4 py-2 font-medium ${
                  clientMode === "new"
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                Cliente nuevo
              </button>
            </div>

            {clientMode === "existing" ? (
              <div className="rounded-2xl border border-slate-200 p-5">
                {selectedClient ? (
                  <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-600">
                    <div>
                      <p className="text-slate-400">Cliente</p>
                      <p className="font-semibold text-slate-900">
                        {selectedClient.firstName} {selectedClient.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Documento</p>
                      <p className="font-semibold text-slate-900">
                        {selectedClient.documentType} {selectedClient.documentNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">NIT / Razon social</p>
                      <p className="font-semibold text-slate-900">
                        {selectedClient.nit || "-"} / {selectedClient.businessName || "-"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500">
                    Busca un cliente por documento para cargar sus datos.
                  </p>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4 rounded-2xl border border-slate-200 p-5">
                <input
                  value={newClient.firstName}
                  onChange={(e) =>
                    setNewClient((current) => ({ ...current, firstName: e.target.value }))
                  }
                  placeholder="Nombre"
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
                <input
                  value={newClient.lastName}
                  onChange={(e) =>
                    setNewClient((current) => ({ ...current, lastName: e.target.value }))
                  }
                  placeholder="Apellido"
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
                <input
                  value={newClient.documentNumber}
                  onChange={(e) =>
                    setNewClient((current) => ({
                      ...current,
                      documentNumber: e.target.value,
                    }))
                  }
                  placeholder="Documento"
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
                <input
                  value={newClient.phone}
                  onChange={(e) =>
                    setNewClient((current) => ({ ...current, phone: e.target.value }))
                  }
                  placeholder="Celular"
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
                <input
                  value={newClient.nit}
                  onChange={(e) =>
                    setNewClient((current) => ({ ...current, nit: e.target.value }))
                  }
                  placeholder="NIT"
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
                <input
                  value={newClient.businessName}
                  onChange={(e) =>
                    setNewClient((current) => ({
                      ...current,
                      businessName: e.target.value,
                    }))
                  }
                  placeholder="Razon social"
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">
                  Pasajeros y tramos
                </h2>
                <button
                  onClick={addItem}
                  className="rounded-2xl bg-amber-500 px-4 py-2 font-medium text-white"
                >
                  Agregar pasajero
                </button>
              </div>

              {items.map((item, index) => (
                <div
                  key={`${index}-${item.passengerFirstName}-${item.passengerLastName}`}
                  className="rounded-2xl border border-slate-200 p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900">
                      Pasajero {index + 1}
                    </p>
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="text-sm text-rose-600 font-medium"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <input
                      value={item.passengerFirstName}
                      onChange={(e) =>
                        updateItem(index, "passengerFirstName", e.target.value)
                      }
                      placeholder="Nombre"
                      className="rounded-2xl border border-slate-200 px-4 py-3"
                    />
                    <input
                      value={item.passengerLastName}
                      onChange={(e) =>
                        updateItem(index, "passengerLastName", e.target.value)
                      }
                      placeholder="Apellido"
                      className="rounded-2xl border border-slate-200 px-4 py-3"
                    />
                    <input
                      value={item.routeOrigin}
                      onChange={(e) => updateItem(index, "routeOrigin", e.target.value)}
                      placeholder="Origen"
                      className="rounded-2xl border border-slate-200 px-4 py-3"
                    />
                    <input
                      value={item.routeDestination}
                      onChange={(e) =>
                        updateItem(index, "routeDestination", e.target.value)
                      }
                      placeholder="Destino"
                      className="rounded-2xl border border-slate-200 px-4 py-3"
                    />
                    <input
                      type="date"
                      value={item.issueDate}
                      onChange={(e) => updateItem(index, "issueDate", e.target.value)}
                      className="rounded-2xl border border-slate-200 px-4 py-3"
                    />
                    <input
                      type="date"
                      value={item.flightDate}
                      onChange={(e) => updateItem(index, "flightDate", e.target.value)}
                      className="rounded-2xl border border-slate-200 px-4 py-3"
                    />
                    <input
                      value={item.ticketNumber}
                      onChange={(e) =>
                        updateItem(index, "ticketNumber", e.target.value)
                      }
                      placeholder="Numero de boleto"
                      className="rounded-2xl border border-slate-200 px-4 py-3"
                    />
                    <input
                      value={item.airline}
                      onChange={(e) => updateItem(index, "airline", e.target.value)}
                      placeholder="Aerolinea"
                      className="rounded-2xl border border-slate-200 px-4 py-3"
                    />
                    <input
                      value={item.amountClient}
                      onChange={(e) =>
                        updateItem(index, "amountClient", e.target.value)
                      }
                      placeholder="Monto cliente"
                      className="rounded-2xl border border-slate-200 px-4 py-3"
                    />
                    <input
                      value={item.amountKovar}
                      onChange={(e) =>
                        updateItem(index, "amountKovar", e.target.value)
                      }
                      placeholder="Monto kovar"
                      className="rounded-2xl border border-slate-200 px-4 py-3"
                    />
                    <input
                      value={item.commissionAmount}
                      onChange={(e) =>
                        updateItem(index, "commissionAmount", e.target.value)
                      }
                      placeholder="Comision"
                      className="rounded-2xl border border-slate-200 px-4 py-3"
                    />
                    <input
                      value={item.passengerDocNumber}
                      onChange={(e) =>
                        updateItem(index, "passengerDocNumber", e.target.value)
                      }
                      placeholder="Documento pasajero"
                      className="rounded-2xl border border-slate-200 px-4 py-3"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="border-t lg:border-t-0 lg:border-l border-slate-200 bg-slate-50 p-6 lg:p-8 space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                Resumen economico
              </p>
              <h2 className="text-2xl font-semibold text-slate-900">
                Confirmacion de venta
              </h2>
            </div>

            <div className="space-y-4 rounded-2xl bg-white p-5 border border-slate-200">
              <div>
                <p className="text-slate-400 text-sm">Cliente</p>
                <p className="font-semibold text-slate-900">{customerName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Fecha</p>
                  <input
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </div>
                <div>
                  <p className="text-slate-400">Metodo</p>
                  <select
                    value={paymentMethod}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value as PaymentMethod)
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  >
                    <option value="CASH">Efectivo</option>
                    <option value="TRANSFER">Transferencia</option>
                    <option value="QR">QR</option>
                    <option value="CARD">Tarjeta</option>
                    <option value="MIXED">Mixto</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Pasajeros</span>
                  <span className="font-semibold text-slate-900">{items.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Total cliente</span>
                  <span className="font-semibold text-slate-900">
                    {formatMoney(totalClient)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Total kovar</span>
                  <span className="font-semibold text-slate-900">
                    {formatMoney(totalKovar)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Comision</span>
                  <span className="font-semibold text-emerald-600">
                    {formatMoney(totalCommission)}
                  </span>
                </div>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas operativas de la venta"
                className="min-h-28 rounded-2xl border border-slate-200 px-4 py-3"
              />

              <div className="grid gap-3">
                <button
                  onClick={() => setActiveModal("confirm")}
                  disabled={!canSubmit || submitting}
                  className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-white font-medium disabled:opacity-60"
                >
                  {submitting ? "Registrando venta..." : "Revisar y confirmar"}
                </button>
                <button
                  onClick={() => setActiveModal("cancel")}
                  className="w-full rounded-2xl border border-slate-200 px-5 py-4 font-medium text-slate-700"
                >
                  Cancelar operacion
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
                <p>{success}</p>
                {latestSaleId && (
                  <div className="mt-3 flex gap-3 flex-wrap">
                    <button
                      onClick={() => router.push(`/dashboard/receipts/${latestSaleId}`)}
                      className="rounded-xl bg-emerald-700 px-4 py-2 text-white font-medium"
                    >
                      Ver comprobante
                    </button>
                    <button
                      onClick={() => setLatestSaleId(null)}
                      className="rounded-xl border border-emerald-300 px-4 py-2 font-medium text-emerald-800"
                    >
                      Continuar trabajando
                    </button>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      </section>

      <section className="rounded-[2rem] bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-sky-600">
              Ventas recientes
            </p>
            <h2 className="text-xl font-semibold text-slate-900">
              Historial inmediato
            </h2>
          </div>
          <Link
            href="/dashboard/sales/list"
            className="rounded-2xl border border-slate-200 px-4 py-3 font-medium text-slate-700"
          >
            Ver lista completa
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="px-6 py-4 text-left">Venta</th>
                <th className="px-6 py-4 text-left">Cliente</th>
                <th className="px-6 py-4 text-left">Fecha</th>
                <th className="px-6 py-4 text-left">Pasajeros</th>
                <th className="px-6 py-4 text-left">Total</th>
                <th className="px-6 py-4 text-left">Accion</th>
              </tr>
            </thead>
            <tbody>
              {loadingSales ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Cargando ventas...
                  </td>
                </tr>
              ) : recentSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Aun no hay ventas registradas.
                  </td>
                </tr>
              ) : (
                recentSales.map((sale) => (
                  <tr key={sale.id} className="border-t border-slate-100">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {sale.saleNumber}
                    </td>
                    <td className="px-6 py-4">
                      {sale.client.firstName} {sale.client.lastName}
                    </td>
                    <td className="px-6 py-4">{formatDate(sale.saleDate)}</td>
                    <td className="px-6 py-4">{sale.passengerCount}</td>
                    <td className="px-6 py-4">{formatMoney(sale.totalClient)}</td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/receipts/${sale.id}`}
                        className="rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Ver comprobante
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {activeModal === "confirm" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-lg rounded-[2rem] bg-white p-8 shadow-2xl">
            <p className="text-sm uppercase tracking-[0.2em] text-sky-600">
              Confirmar venta
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">
              Revisa antes de registrar
            </h2>
            <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Cliente</span>
                <span className="font-medium text-slate-900">{customerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Pasajeros</span>
                <span className="font-medium text-slate-900">{items.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total cliente</span>
                <span className="font-medium text-slate-900">
                  {formatMoney(totalClient)}
                </span>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 rounded-2xl border border-slate-200 px-5 py-3 font-medium text-slate-700"
              >
                Volver
              </button>
              <button
                onClick={() => void handleConfirmSale()}
                disabled={submitting}
                className="flex-1 rounded-2xl bg-slate-900 px-5 py-3 font-medium text-white disabled:opacity-70"
              >
                {submitting ? "Guardando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === "cancel" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-lg rounded-[2rem] bg-white p-8 shadow-2xl">
            <p className="text-sm uppercase tracking-[0.2em] text-rose-600">
              Cancelar venta
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">
              Deseas descartar esta operacion?
            </h2>
            <p className="mt-4 text-slate-500">
              Si cancelas, se perderan los datos temporales cargados y no se registrara
              ni la venta ni un cliente nuevo asociado a este intento.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 rounded-2xl border border-slate-200 px-5 py-3 font-medium text-slate-700"
              >
                Seguir editando
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setActiveModal(null);
                  setError("");
                  setSuccess("");
                  setLatestSaleId(null);
                  router.push("/dashboard/sales");
                }}
                className="flex-1 rounded-2xl bg-rose-600 px-5 py-3 font-medium text-white"
              >
                Cancelar venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
