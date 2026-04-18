"use client";

import { useCallback, useEffect, useState } from "react";
import { getClientById, listClients } from "@/features/clients/api/clients";
import { formatDate, formatMoney } from "@/lib/format";
import { ClientDetail, ClientListItem } from "@/types/client";

export function ClientsPage() {
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientDetail | null>(null);
  const [search, setSearch] = useState("");
  const [lastName, setLastName] = useState("");
  const [ranking, setRanking] = useState<"recent" | "top">("recent");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  const loadClients = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await listClients({
        search: search || undefined,
        lastName: lastName || undefined,
        ranking,
      });
      setClients(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los clientes");
    } finally {
      setLoading(false);
    }
  }, [lastName, ranking, search]);

  const openClientDetail = async (clientId: string) => {
    setDetailLoading(true);

    try {
      const detail = await getClientById(clientId);
      setSelectedClient(detail);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el detalle");
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-sky-600">
              Clientes
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              Gestion de clientes
            </h1>
            <p className="text-slate-500 mt-2">
              Consulta clientes frecuentes, historiales de venta y datos fiscales.
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, documento o NIT"
              className="rounded-2xl border border-slate-200 px-4 py-3 min-w-[240px]"
            />
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Apellido"
              className="rounded-2xl border border-slate-200 px-4 py-3 min-w-[180px]"
            />
            <select
              value={ranking}
              onChange={(e) => setRanking(e.target.value as "recent" | "top")}
              className="rounded-2xl border border-slate-200 px-4 py-3"
            >
              <option value="recent">Mas recientes</option>
              <option value="top">Ranking</option>
            </select>
            <button
              onClick={() => void loadClients()}
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
                <th className="px-6 py-4 text-left">Cliente</th>
                <th className="px-6 py-4 text-left">Documento</th>
                <th className="px-6 py-4 text-left">NIT</th>
                <th className="px-6 py-4 text-left">Ventas</th>
                <th className="px-6 py-4 text-left">Ultima venta</th>
                <th className="px-6 py-4 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Cargando clientes...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No se encontraron clientes con esos filtros.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="border-t border-slate-100">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {client.firstName} {client.lastName}
                      </div>
                      <div className="text-slate-500">{client.phone || "Sin telefono"}</div>
                    </td>
                    <td className="px-6 py-4">
                      {client.documentType} {client.documentNumber}
                    </td>
                    <td className="px-6 py-4">{client.nit || "-"}</td>
                    <td className="px-6 py-4">{client.salesCount}</td>
                    <td className="px-6 py-4">
                      {client.latestSale ? formatDate(client.latestSale.saleDate) : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => void openClientDetail(client.id)}
                        className="rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Ver detalle
                      </button>
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

      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-sky-600">
                  Cliente
                </p>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {selectedClient.firstName} {selectedClient.lastName}
                </h2>
                <p className="text-slate-500 mt-1">
                  {selectedClient.documentType} {selectedClient.documentNumber}
                </p>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="rounded-full border border-slate-200 px-4 py-2 text-slate-500"
              >
                Cerrar
              </button>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-[280px_1fr]">
              <aside className="space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Ventas registradas</p>
                  <p className="text-3xl font-semibold text-slate-900">
                    {selectedClient.salesCount}
                  </p>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>Email: {selectedClient.email || "-"}</p>
                  <p>Telefono: {selectedClient.phone || "-"}</p>
                  <p>NIT: {selectedClient.nit || "-"}</p>
                  <p>Razon social: {selectedClient.businessName || "-"}</p>
                  <p>Notas: {selectedClient.notes || "-"}</p>
                </div>
              </aside>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Historial reciente
                </h3>
                {detailLoading ? (
                  <p className="text-slate-500">Cargando detalle...</p>
                ) : selectedClient.sales.length === 0 ? (
                  <p className="text-slate-500">Este cliente aun no tiene ventas.</p>
                ) : (
                  selectedClient.sales.map((sale) => (
                    <div
                      key={sale.id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {sale.saleNumber}
                          </p>
                          <p className="text-sm text-slate-500">
                            {formatDate(sale.saleDate)} · {sale.passengerCount} pasajeros
                          </p>
                        </div>
                        <p className="text-lg font-semibold text-sky-700">
                          {formatMoney(sale.totalClient)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
