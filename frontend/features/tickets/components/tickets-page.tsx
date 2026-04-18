"use client";

import { useCallback, useEffect, useState } from "react";
import { listPassengers } from "@/features/sales/api/sales";
import { formatDate, formatMoney } from "@/lib/format";
import { PassengerRecord } from "@/types/sale";

export function TicketsPage() {
  const currentYear = new Date().getFullYear();
  const [passengers, setPassengers] = useState<PassengerRecord[]>([]);
  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState("");
  const [week, setWeek] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPassengers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await listPassengers({
        year: year ? Number(year) : undefined,
        month: month ? Number(month) : undefined,
        week: week ? Number(week) : undefined,
      });
      setPassengers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los pasajes");
    } finally {
      setLoading(false);
    }
  }, [month, week, year]);

  useEffect(() => {
    void loadPassengers();
  }, [loadPassengers]);

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-sky-600">
              Pasajes
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              Control operativo de pasajes
            </h1>
            <p className="text-slate-500 mt-2">
              Consulta por periodo los boletos emitidos y la informacion de cada pasajero.
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="Año"
              className="rounded-2xl border border-slate-200 px-4 py-3 w-28"
            />
            <input
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              placeholder="Mes"
              className="rounded-2xl border border-slate-200 px-4 py-3 w-28"
            />
            <input
              value={week}
              onChange={(e) => setWeek(e.target.value)}
              placeholder="Semana"
              className="rounded-2xl border border-slate-200 px-4 py-3 w-28"
            />
            <button
              onClick={() => void loadPassengers()}
              className="rounded-2xl bg-sky-600 px-5 py-3 text-white font-medium"
            >
              Filtrar
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="px-6 py-4 text-left">Pasajero</th>
                <th className="px-6 py-4 text-left">Ruta</th>
                <th className="px-6 py-4 text-left">Emision</th>
                <th className="px-6 py-4 text-left">Vuelo</th>
                <th className="px-6 py-4 text-left">Boleto</th>
                <th className="px-6 py-4 text-left">Venta</th>
                <th className="px-6 py-4 text-left">Agente</th>
                <th className="px-6 py-4 text-left">Cliente</th>
                <th className="px-6 py-4 text-left">Monto</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-slate-500">
                    Cargando pasajes...
                  </td>
                </tr>
              ) : passengers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-slate-500">
                    No hay pasajes para esos filtros.
                  </td>
                </tr>
              ) : (
                passengers.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {item.passengerFirstName} {item.passengerLastName}
                      </div>
                      <div className="text-slate-500">
                        Semana {item.weekNumber || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.routeOrigin} → {item.routeDestination}
                    </td>
                    <td className="px-6 py-4">{formatDate(item.issueDate)}</td>
                    <td className="px-6 py-4">{formatDate(item.flightDate)}</td>
                    <td className="px-6 py-4">{item.ticketNumber || "-"}</td>
                    <td className="px-6 py-4">{item.sale.saleNumber}</td>
                    <td className="px-6 py-4">{item.sale.user.name}</td>
                    <td className="px-6 py-4">
                      {item.sale.client.firstName} {item.sale.client.lastName}
                    </td>
                    <td className="px-6 py-4">{formatMoney(item.amountClient)}</td>
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
