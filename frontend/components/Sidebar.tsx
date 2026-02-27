"use client";

import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const menu = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Ventas", icon: ShoppingCart, path: "/dashboard/sales" },
    { name: "Factura", icon: FileText, path: "/dashboard/invoices" },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-blue-200 shadow">
        <h1 className="font-semibold text-gray-700">
          Booking Travel
        </h1>
        <button onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Overlay Mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full w-64 bg-gradient-to-b from-blue-200 to-blue-300 p-6 flex flex-col shadow-lg z-50 transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      >
        <div className="hidden lg:flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-white rounded-full shadow-md mb-3" />
          <h1 className="text-lg font-semibold text-gray-700">
            Booking Travel
          </h1>
        </div>

        <nav className="space-y-2 flex-1">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.path;

            return (
              <button
                key={item.name}
                onClick={() => {
                  router.push(item.path);
                  setOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition ${
                  active
                    ? "bg-white shadow text-blue-600"
                    : "hover:bg-white/50 text-gray-700"
                }`}
              >
                <Icon size={18} />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-blue-300 pt-4 space-y-2">
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-white/50 text-gray-700">
            <Settings size={18} />
            Configuración
          </button>

          <button
            onClick={() => {
              localStorage.clear();
              router.push("/login");
            }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-red-500 hover:text-white transition"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}