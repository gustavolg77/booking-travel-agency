"use client";

import { useCallback, useEffect, useState } from "react";
import { getWeeklyReport } from "@/features/sales/api/sales";
import { formatDate, formatMoney } from "@/lib/format";
import { WeeklyReport } from "@/types/sale";

export function WeeklyReportPage() {
  const currentDate = new Date();
  const [year, setYear] = useState(String(currentDate.getFullYear()));
  const [week, setWeek] = useState("");
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getWeeklyReport({
        year: year ? Number(year) : undefined,
        week: week ? Number(week) : undefined,
      });
      setReport(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "No se pudo cargar el reporte semanal"
      );
    } finally {
      setLoading(false);
    }
  }, [week, year]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-sky-600">
              Reporte semanal
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              Resumen gerencial y operativo por semana
            </h1>
            <p className="mt-2 text-slate-500">
              Observa volumen de ventas, pasajeros, agentes y rutas con mayor movimiento.
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
              value={week}
              onChange={(e) => setWeek(e.target.value)}
              placeholder="Semana"
              className="rounded-2xl border border-slate-200 px-4 py-3 w-28"
            />
            <button
              onClick={() => void loadReport()}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-white font-medium"
            >
              Consultar
            </button>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          Cargando reporte...
        </div>
      ) : report ? (
        <>
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Ventas</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {report.salesCount}
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Pasajeros</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {report.passengersCount}
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Facturacion</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {formatMoney(report.revenue)}
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Comision</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {formatMoney(report.commission)}
              </p>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">
                Rendimiento por agente
              </h2>
              <div className="mt-6 space-y-4">
                {report.salesByAgent.length === 0 ? (
                  <p className="text-slate-500">Sin movimiento en esta semana.</p>
                ) : (
                  report.salesByAgent.map((agent) => (
                    <div
                      key={agent.userId}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {agent.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {agent.salesCount} ventas · {agent.passengersCount} pasajeros
                          </p>
                        </div>
                        <p className="font-semibold text-slate-900">
                          {formatMoney(agent.revenue)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">
                Top rutas
              </h2>
              <div className="mt-6 space-y-4">
                {report.topDestinations.length === 0 ? (
                  <p className="text-slate-500">Sin rutas para esta semana.</p>
                ) : (
                  report.topDestinations.map((destination, index) => (
                    <div key={destination.route} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-slate-800">
                          {index + 1}. {destination.route}
                        </p>
                        <p className="text-sm text-slate-500">
                          {destination.count} pasajeros
                        </p>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
                          style={{
                            width: `${Math.max(
                              18,
                              (destination.count /
                                (report.topDestinations[0]?.count || destination.count)) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-2xl font-semibold text-slate-900">
                Ventas recientes de la semana {report.week}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide">
                  <tr>
                    <th className="px-6 py-4 text-left">Venta</th>
                    <th className="px-6 py-4 text-left">Cliente</th>
                    <th className="px-6 py-4 text-left">Agente</th>
                    <th className="px-6 py-4 text-left">Fecha</th>
                    <th className="px-6 py-4 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {report.recentSales.map((sale) => (
                    <tr key={sale.id} className="border-t border-slate-100">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {sale.saleNumber}
                      </td>
                      <td className="px-6 py-4">
                        {sale.client.firstName} {sale.client.lastName}
                      </td>
                      <td className="px-6 py-4">{sale.user.name}</td>
                      <td className="px-6 py-4">{formatDate(sale.saleDate)}</td>
                      <td className="px-6 py-4">{formatMoney(sale.totalClient)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
          {error}
        </div>
      )}
    </div>
  );
}
