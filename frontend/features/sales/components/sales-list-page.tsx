"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { listSales } from "@/features/sales/api/sales";
import { formatDate, formatMoney } from "@/lib/format";
import { Sale, SaleStatus } from "@/types/sale";

export function SalesListPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [status, setStatus] = useState("");
  const [client, setClient] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [month, setMonth] = useState("");
  const [week, setWeek] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSales = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await listSales({
        status: status || undefined,
        client: client || undefined,
        year: year ? Number(year) : undefined,
        month: month ? Number(month) : undefined,
        week: week ? Number(week) : undefined,
      });
      setSales(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las ventas");
    } finally {
      setLoading(false);
    }
  }, [client, month, status, week, year]);

  useEffect(() => {
    void loadSales();
  }, [loadSales]);

  const statusLabel: Record<SaleStatus, string> = {
    DRAFT: "Borrador",
    CONFIRMED: "Confirmada",
    CANCELLED: "Cancelada",
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-sky-600">
              Lista de ventas
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              Historial de operaciones registradas
            </h1>
            <p className="mt-2 text-slate-500">
              Filtra por cliente, estado y periodo para revisar la actividad comercial.
            </p>
          </div>

          <Link
            href="/dashboard/sales/new"
            className="rounded-2xl bg-slate-900 px-5 py-3 text-white font-medium"
          >
            Nueva venta
          </Link>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <input
            value={client}
            onChange={(e) => setClient(e.target.value)}
            placeholder="Cliente o documento"
            className="rounded-2xl border border-slate-200 px-4 py-3"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3"
          >
            <option value="">Todos los estados</option>
            <option value="DRAFT">Borrador</option>
            <option value="CONFIRMED">Confirmada</option>
            <option value="CANCELLED">Cancelada</option>
          </select>
          <input
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Año"
            className="rounded-2xl border border-slate-200 px-4 py-3"
          />
          <input
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="Mes"
            className="rounded-2xl border border-slate-200 px-4 py-3"
          />
          <div className="flex gap-3">
            <input
              value={week}
              onChange={(e) => setWeek(e.target.value)}
              placeholder="Semana"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            />
            <button
              onClick={() => void loadSales()}
              className="rounded-2xl border border-slate-200 px-4 py-3 font-medium text-slate-700"
            >
              Buscar
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="px-6 py-4 text-left">Venta</th>
                <th className="px-6 py-4 text-left">Fecha</th>
                <th className="px-6 py-4 text-left">Cliente</th>
                <th className="px-6 py-4 text-left">Agente</th>
                <th className="px-6 py-4 text-left">Pasajeros</th>
                <th className="px-6 py-4 text-left">Total</th>
                <th className="px-6 py-4 text-left">Estado</th>
                <th className="px-6 py-4 text-left">Comprobante</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                    Cargando ventas...
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                    No se encontraron ventas para esos filtros.
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id} className="border-t border-slate-100">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {sale.saleNumber}
                    </td>
                    <td className="px-6 py-4">{formatDate(sale.saleDate)}</td>
                    <td className="px-6 py-4">
                      {sale.client.firstName} {sale.client.lastName}
                    </td>
                    <td className="px-6 py-4">{sale.user.name}</td>
                    <td className="px-6 py-4">{sale.passengerCount}</td>
                    <td className="px-6 py-4">{formatMoney(sale.totalClient)}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {statusLabel[sale.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/receipts/${sale.id}`}
                        className="rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
          {error}
        </div>
      )}
    </div>
  );
}
