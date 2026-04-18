"use client";

import Image from "next/image";
import Link from "next/link";
import { getStoredUser } from "@/lib/auth";

const topDestinations = [
  { city: "Santa Cruz, BO", count: 92 },
  { city: "Tarija, BO", count: 68 },
  { city: "La Paz, BO", count: 35 },
  { city: "Sao Paolo, BR", count: 20 },
];

const recentClients = [
  { name: "Maria Perez", document: "58585858", destination: "Tarija, BO" },
  { name: "Juan Hurtado", document: "78787878", destination: "La Paz, BO" },
];

export function DashboardOverview() {
  const user = getStoredUser();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-700">
          Dashboard
        </h2>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {user?.name || "Usuario interno"}
          </span>
          <div className="w-10 h-10 bg-gray-300 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1590511076511-9d8a99b0c35e"
            alt="Destino destacado"
            className="h-48 w-full object-cover"
            width={800}
            height={320}
          />
          <div className="p-4">
            <h3 className="font-semibold text-orange-500">
              Cochabamba, 10 de Febrero
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5">
          <h3 className="font-semibold text-blue-600 mb-4">
            Calendario
          </h3>
          <div className="grid grid-cols-7 text-center text-sm text-gray-600 gap-2">
            {Array.from({ length: 30 }, (_, i) => (
              <div
                key={i}
                className={`p-2 rounded-full ${
                  i === 9 ? "bg-teal-500 text-white" : "hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-100 to-teal-100 rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-blue-600 mb-4">
            Top Destinos
          </h3>

          <div className="space-y-3">
            {topDestinations.map((item) => (
              <div key={item.city} className="flex justify-between items-center">
                <span className="text-gray-700">{item.city}</span>
                <span className="text-orange-500 font-semibold">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-blue-600 font-semibold mb-4">
            Balance Mensual
          </h3>

          <div className="flex justify-between">
            <div>
              <p className="text-green-600 text-2xl">↑</p>
              <p className="text-sm text-gray-600">Ventas: 2500 bs</p>
            </div>

            <div>
              <p className="text-red-500 text-2xl">↓</p>
              <p className="text-sm text-gray-600">Kovar: 7200 bs</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-orange-500 font-semibold mb-4">
            Acciones rapidas
          </h3>

          <div className="flex justify-around gap-4">
            <Link href="/dashboard/sales" className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-2" />
              <p className="text-sm text-gray-600">Nueva venta</p>
            </Link>

            <Link href="/dashboard/tickets" className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full mx-auto mb-2" />
              <p className="text-sm text-gray-600">Ver pasajes</p>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-blue-600 font-semibold mb-4">
            Clientes recientes
          </h3>

          <div className="space-y-3 text-sm text-gray-600">
            {recentClients.map((client) => (
              <div key={client.document}>
                <p className="font-semibold">{client.name}</p>
                <p>CI: {client.document}</p>
                <p>Destino: {client.destination}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
