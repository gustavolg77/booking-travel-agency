"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  PlusCircle,
  Rows3,
  Ticket,
  Users,
} from "lucide-react";

const menuCards = [
  {
    title: "Nueva venta",
    description:
      "Inicia una operacion completa: cliente, pasajeros, montos y confirmacion.",
    href: "/dashboard/sales/new",
    icon: PlusCircle,
    tone: "from-sky-600 to-cyan-500",
  },
  {
    title: "Ver pasajes",
    description:
      "Consulta boletos vendidos por semana, agente, fecha de vuelo y numero de ticket.",
    href: "/dashboard/tickets",
    icon: Ticket,
    tone: "from-emerald-600 to-teal-500",
  },
  {
    title: "Ver clientes",
    description:
      "Revisa compradores frecuentes, ultima venta, datos fiscales e historial comercial.",
    href: "/dashboard/clients",
    icon: Users,
    tone: "from-violet-600 to-fuchsia-500",
  },
  {
    title: "Lista de ventas",
    description:
      "Accede a las ventas ya registradas, con filtros por cliente, fecha y estado.",
    href: "/dashboard/sales/list",
    icon: Rows3,
    tone: "from-amber-500 to-orange-500",
  },
  {
    title: "Reporte semanal",
    description:
      "Resume volumen, pasajeros, rutas y rendimiento de agentes para la semana elegida.",
    href: "/dashboard/sales/weekly-report",
    icon: BarChart3,
    tone: "from-slate-700 to-slate-900",
  },
];

export function SalesHub() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.22em] text-sky-600">
          Modulo de ventas
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900">
          Centro operativo para registrar, consultar y controlar ventas.
        </h1>
        <p className="mt-4 max-w-3xl text-slate-500">
          Desde aqui el agente entra al flujo real del negocio: buscar o crear clientes,
          registrar pasajeros, confirmar operaciones y revisar historicos sin salir del
          modulo principal.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {menuCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.title}
              href={card.href}
              className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${card.tone}`}
              />
              <div className="flex items-start justify-between gap-4">
                <div className={`rounded-2xl bg-gradient-to-br ${card.tone} p-3 text-white`}>
                  <Icon size={22} />
                </div>
                <ArrowRight
                  size={20}
                  className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-500"
                />
              </div>

              <h2 className="mt-6 text-2xl font-semibold text-slate-900">
                {card.title}
              </h2>
              <p className="mt-3 text-slate-500">{card.description}</p>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
