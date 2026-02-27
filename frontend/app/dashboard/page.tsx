"use client";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-700">
          Dashboard
        </h2>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            Fernanda Caceres
          </span>
          <div className="w-10 h-10 bg-gray-300 rounded-full" />
        </div>
      </div>

      {/* TOP SECTION */}
      <div className="grid grid-cols-3 gap-6">
        {/* Imagen */}
        <div className="col-span-1 bg-white rounded-xl shadow-md overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1590511076511-9d8a99b0c35e"
            className="h-48 w-full object-cover"
          />
          <div className="p-4">
            <h3 className="font-semibold text-orange-500">
              Cochabamba, 10 de Febrero
            </h3>
          </div>
        </div>

        {/* Calendario */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <h3 className="font-semibold text-blue-600 mb-4">
            Calendario
          </h3>
          <div className="grid grid-cols-7 text-center text-sm text-gray-600 gap-2">
            {Array.from({ length: 30 }, (_, i) => (
              <div
                key={i}
                className={`p-2 rounded-full ${
                  i === 9
                    ? "bg-teal-500 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Top Destinos */}
        <div className="bg-gradient-to-br from-blue-100 to-teal-100 rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-blue-600 mb-4">
            Top Destinos
          </h3>

          <div className="space-y-3">
            {[
              { city: "Santa Cruz, BO", count: 92 },
              { city: "Tarija, BO", count: 68 },
              { city: "La Paz, BO", count: 35 },
              { city: "Sao Paolo, BR", count: 20 },
            ].map((item) => (
              <div
                key={item.city}
                className="flex justify-between items-center"
              >
                <span className="text-gray-700">
                  {item.city}
                </span>
                <span className="text-orange-500 font-semibold">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-3 gap-6">
        {/* Balance mensual */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-blue-600 font-semibold mb-4">
            Balance Mensual
          </h3>

          <div className="flex justify-between">
            <div>
              <p className="text-green-600 text-2xl">↑</p>
              <p className="text-sm text-gray-600">
                Ventas: 2500 bs
              </p>
            </div>

            <div>
              <p className="text-red-500 text-2xl">↓</p>
              <p className="text-sm text-gray-600">
                Kovar: 7200 bs
              </p>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-orange-500 font-semibold mb-4">
            Acciones rápidas
          </h3>

          <div className="flex justify-around">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Nueva venta
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Ver pasajes
              </p>
            </div>
          </div>
        </div>

        {/* Clientes recientes */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-blue-600 font-semibold mb-4">
            Clientes recientes
          </h3>

          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <p className="font-semibold">Maria Perez</p>
              <p>CI: 58585858</p>
              <p>Destino: Tarija, BO</p>
            </div>

            <div>
              <p className="font-semibold">Juan Hurtado</p>
              <p>CI: 78787878</p>
              <p>Destino: La Paz, BO</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}