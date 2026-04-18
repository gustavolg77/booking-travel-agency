"use client";

import { useCallback, useEffect, useState } from "react";
import { createReceipt, getReceiptBySaleId } from "@/features/receipts/api/receipts";
import { formatDate, formatMoney } from "@/lib/format";
import { Receipt } from "@/types/receipt";

interface ReceiptPageProps {
  saleId: string;
}

export function ReceiptPage({ saleId }: ReceiptPageProps) {
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const loadReceipt = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getReceiptBySaleId(saleId);
      setReceipt(data);
    } catch (err: unknown) {
      setReceipt(null);
      setError(err instanceof Error ? err.message : "No se pudo cargar el comprobante");
    } finally {
      setLoading(false);
    }
  }, [saleId]);

  const handleCreateReceipt = async () => {
    setCreating(true);
    setError("");

    try {
      const data = await createReceipt(saleId);
      setReceipt(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo generar el comprobante");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    void loadReceipt();
  }, [loadReceipt]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">
        Cargando comprobante...
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-10">
        <h1 className="text-3xl font-semibold text-slate-900">
          Comprobante pendiente
        </h1>
        <p className="text-slate-500">
          Aun no existe un comprobante para esta venta. Puedes generarlo ahora mismo.
        </p>
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
            {error}
          </div>
        )}
        <button
          onClick={() => void handleCreateReceipt()}
          disabled={creating}
          className="rounded-2xl bg-slate-900 px-5 py-3 font-medium text-white disabled:opacity-70"
        >
          {creating ? "Generando..." : "Generar comprobante"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-sky-600">
            Comprobante
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            {receipt.receiptNumber}
          </h1>
          <p className="text-slate-500 mt-2">
            Emitido el {formatDate(receipt.issuedAt)}
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="rounded-2xl border border-slate-200 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
        >
          Imprimir
        </button>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Agencia
            </p>
            <h2 className="text-2xl font-semibold text-slate-900 mt-2">
              {receipt.agency?.agencyName || "Booking Travel"}
            </h2>
            <div className="mt-3 space-y-1 text-slate-500">
              <p>{receipt.agency?.email || "-"}</p>
              <p>{receipt.agency?.phone || "-"}</p>
              <p>{receipt.agency?.address || "-"}</p>
              <p>{receipt.agency?.city || "-"}</p>
            </div>
          </div>

          <div className="md:text-right">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Cliente
            </p>
            <h3 className="text-2xl font-semibold text-slate-900 mt-2">
              {receipt.clientName}
            </h3>
            <div className="mt-3 space-y-1 text-slate-500">
              <p>NIT: {receipt.clientNit || "-"}</p>
              <p>Razon social: {receipt.clientBusinessName || "-"}</p>
              <p>Agente: {receipt.sale.user.name}</p>
              <p>Venta: {receipt.sale.saleNumber}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Pasajero</th>
                <th className="px-4 py-3 text-left">Ruta</th>
                <th className="px-4 py-3 text-left">Boleto</th>
                <th className="px-4 py-3 text-left">Fecha vuelo</th>
                <th className="px-4 py-3 text-right">Importe</th>
              </tr>
            </thead>
            <tbody>
              {receipt.sale.items?.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    {item.passengerFirstName} {item.passengerLastName}
                  </td>
                  <td className="px-4 py-3">
                    {item.routeOrigin} → {item.routeDestination}
                  </td>
                  <td className="px-4 py-3">{item.ticketNumber || "-"}</td>
                  <td className="px-4 py-3">{formatDate(item.flightDate)}</td>
                  <td className="px-4 py-3 text-right">
                    {formatMoney(item.amountClient)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-end">
          <div className="w-full max-w-sm rounded-2xl bg-slate-50 p-5">
            <div className="flex items-center justify-between text-slate-500">
              <span>Metodo de pago</span>
              <span>{receipt.paymentMethod || "-"}</span>
            </div>
            <div className="mt-4 flex items-center justify-between text-lg font-semibold text-slate-900">
              <span>Total</span>
              <span>{formatMoney(receipt.totalAmount)}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
