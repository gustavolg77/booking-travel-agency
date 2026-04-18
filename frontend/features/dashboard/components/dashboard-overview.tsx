"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CircleDollarSign,
  Compass,
  ReceiptText,
  Sparkles,
  Ticket,
  Users,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { listClients } from "@/features/clients/api/clients";
import { listPassengers, listSales } from "@/features/sales/api/sales";
import { getStoredUser } from "@/lib/auth";
import { formatDate, formatMoney } from "@/lib/format";
import { ClientListItem } from "@/types/client";
import { PassengerRecord, Sale } from "@/types/sale";

function getCurrentMonthSales(sales: Sale[]) {
  const now = new Date();

  return sales.filter((sale) => {
    const saleDate = new Date(sale.saleDate);

    return (
      saleDate.getMonth() === now.getMonth() &&
      saleDate.getFullYear() === now.getFullYear()
    );
  });
}

function getTopDestinations(passengers: PassengerRecord[]) {
  const destinations = new Map<string, number>();

  passengers.forEach((item) => {
    const label = `${item.routeOrigin} → ${item.routeDestination}`;
    destinations.set(label, (destinations.get(label) || 0) + 1);
  });

  return Array.from(destinations.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
}

function getUpcomingFlights(passengers: PassengerRecord[]) {
  const now = new Date();

  return passengers
    .filter((item) => item.flightDate && new Date(item.flightDate) >= now)
    .sort((a, b) => {
      const firstDate = a.flightDate ? new Date(a.flightDate).getTime() : 0;
      const secondDate = b.flightDate ? new Date(b.flightDate).getTime() : 0;

      return firstDate - secondDate;
    })
    .slice(0, 4);
}

export function DashboardOverview() {
  const user = getStoredUser();
  const [sales, setSales] = useState<Sale[]>([]);
  const [passengers, setPassengers] = useState<PassengerRecord[]>([]);
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [salesData, passengersData, clientsData] = await Promise.all([
        listSales({}),
        listPassengers({}),
        listClients({ ranking: "top" }),
      ]);

      setSales(salesData);
      setPassengers(passengersData);
      setClients(clientsData);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar el resumen del dashboard"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const currentMonthSales = getCurrentMonthSales(sales);
  const monthlyRevenue = currentMonthSales.reduce(
    (acc, sale) => acc + Number(sale.totalClient),
    0
  );
  const monthlyKovar = currentMonthSales.reduce(
    (acc, sale) => acc + Number(sale.totalKovar),
    0
  );
  const monthlyCommission = currentMonthSales.reduce(
    (acc, sale) => acc + Number(sale.totalCommission),
    0
  );
  const topDestinations = getTopDestinations(passengers);
  const upcomingFlights = getUpcomingFlights(passengers);
  const recentClients = clients.slice(0, 4);
  const confirmedSales = sales.filter((sale) => sale.status === "CONFIRMED").length;
  const draftSales = sales.filter((sale) => sale.status === "DRAFT").length;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-sky-100 bg-gradient-to-br from-sky-950 via-cyan-900 to-sky-800 p-8 text-white shadow-[0_30px_80px_rgba(14,116,144,0.28)]">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -right-16 top-0 h-56 w-56 rounded-full bg-cyan-300 blur-3xl" />
          <div className="absolute left-10 bottom-0 h-40 w-40 rounded-full bg-amber-200 blur-3xl" />
        </div>

        <div className="relative grid gap-8 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">
                <Sparkles size={16} />
                Panel operativo de agencia
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-sky-100">
                {loading ? "Sincronizando datos..." : "Datos listos para operar"}
              </span>
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-sky-200">
                Booking Travel
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
                Un tablero que te muestra ventas, clientes y movimiento real del negocio.
              </h1>
              <p className="mt-4 max-w-2xl text-base text-sky-100/85 md:text-lg">
                {user?.name || "Equipo de operaciones"}, desde aqui puedes detectar
                que se vendio, que esta pendiente y hacia donde se esta moviendo la agencia.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-sm text-sky-100/75">Ventas confirmadas</p>
                <p className="mt-3 text-3xl font-semibold">{confirmedSales}</p>
                <p className="mt-2 text-sm text-sky-100/70">
                  {draftSales} ventas aun en borrador
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-sm text-sky-100/75">Pasajeros cargados</p>
                <p className="mt-3 text-3xl font-semibold">{passengers.length}</p>
                <p className="mt-2 text-sm text-sky-100/70">
                  Controlando historico y operacion
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-sm text-sky-100/75">Clientes activos</p>
                <p className="mt-3 text-3xl font-semibold">{clients.length}</p>
                <p className="mt-2 text-sm text-sky-100/70">
                  Base comercial para reutilizar
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/sales/new"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-medium text-sky-900 transition hover:bg-sky-50"
              >
                Nueva venta
                <ArrowUpRight size={18} />
              </Link>
              <Link
                href="/dashboard/tickets"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 font-medium text-white transition hover:bg-white/15"
              >
                Revisar pasajes
                <Ticket size={18} />
              </Link>
            </div>
          </div>

          <div className="relative min-h-[320px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/8 shadow-inner backdrop-blur-sm">
            <Image
              src="https://images.unsplash.com/photo-1502920917128-1aa500764b6d?q=80&w=1200&auto=format&fit=crop"
              alt="Vista de viaje para hero dashboard"
              fill
              className="object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-sky-950/90 via-sky-900/35 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-sm uppercase tracking-[0.25em] text-sky-100/70">
                Enfoque del dia
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Prioriza ventas confirmadas y convierte cada pasajero en operacion trazable.
              </h2>
              <p className="mt-3 text-sm text-sky-100/75">
                Este dashboard ya no solo decora: ayuda a decidir donde mirar primero.
              </p>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
          {error}
        </div>
      )}

      <section className="grid gap-5 xl:grid-cols-4">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <CircleDollarSign size={22} />
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Este mes
            </span>
          </div>
          <p className="mt-5 text-sm text-slate-500">Facturacion cliente</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {formatMoney(monthlyRevenue)}
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
              <Wallet size={22} />
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Este mes
            </span>
          </div>
          <p className="mt-5 text-sm text-slate-500">Total Kovar</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {formatMoney(monthlyKovar)}
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-sky-50 p-3 text-sky-600">
              <ReceiptText size={22} />
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Este mes
            </span>
          </div>
          <p className="mt-5 text-sm text-slate-500">Comision proyectada</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {formatMoney(monthlyCommission)}
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-violet-50 p-3 text-violet-600">
              <Users size={22} />
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Activos
            </span>
          </div>
          <p className="mt-5 text-sm text-slate-500">Clientes con movimiento</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {recentClients.length}
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-sky-600">
                Radar comercial
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                Destinos y agenda operativa
              </h2>
            </div>
            <Link
              href="/dashboard/tickets"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
            >
              Ver pasajes
              <ArrowUpRight size={18} />
            </Link>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[1.5rem] bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                  <Compass size={20} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Top destinos</p>
                  <p className="text-sm text-slate-500">
                    Rutas con mayor movimiento reciente
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {topDestinations.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Aun no hay pasajes suficientes para construir tendencias.
                  </p>
                ) : (
                  topDestinations.map((destination, index) => (
                    <div key={destination.label} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">
                          {index + 1}. {destination.label}
                        </span>
                        <span className="text-slate-500">
                          {destination.count} pasajeros
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
                          style={{
                            width: `${Math.max(
                              18,
                              (destination.count /
                                (topDestinations[0]?.count || destination.count)) *
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

            <div className="rounded-[1.5rem] border border-slate-200 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Proximos vuelos</p>
                  <p className="text-sm text-slate-500">
                    Lo que merece seguimiento operativo
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {upcomingFlights.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Todavia no hay vuelos futuros cargados en el sistema.
                  </p>
                ) : (
                  upcomingFlights.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl bg-slate-50 p-4"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {item.passengerFirstName} {item.passengerLastName}
                          </p>
                          <p className="text-sm text-slate-500">
                            {item.routeOrigin} → {item.routeDestination}
                          </p>
                        </div>
                        <div className="text-sm text-slate-600 md:text-right">
                          <p>{formatDate(item.flightDate)}</p>
                          <p>{item.sale.saleNumber}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-sky-600">
                Relaciones
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                Clientes destacados
              </h2>
            </div>
            <Link
              href="/dashboard/clients"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
            >
              Ver clientes
              <ArrowUpRight size={18} />
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {recentClients.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
                Aun no hay suficientes clientes para construir un ranking comercial.
              </div>
            ) : (
              recentClients.map((client) => (
                <div
                  key={client.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {client.firstName} {client.lastName}
                      </p>
                      <p className="text-sm text-slate-500">
                        {client.documentType} {client.documentNumber}
                      </p>
                    </div>
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
                      {client.salesCount} ventas
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Ultima venta:{" "}
                      {client.latestSale
                        ? formatDate(client.latestSale.saleDate)
                        : "Sin movimientos"}
                    </span>
                    <span className="font-medium text-slate-900">
                      {client.latestSale
                        ? formatMoney(client.latestSale.totalClient)
                        : formatMoney(0)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
