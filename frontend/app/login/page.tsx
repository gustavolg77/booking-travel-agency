"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* FONDO AVIÓN */}
      <img
        src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1174&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Vista desde avión"
        className="absolute inset-0 w-full h-full object-cover scale-101 animate-[slowZoom_20s_linear_infinite]"
      />

      {/* Overlay elegante */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/20 to-black/60 backdrop-blur-s" />

      {/* CARD LOGIN */}
      <div className="relative z-10 bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl p-10 w-[380px] border border-white/40">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-800">
            Booking Travel
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Gestión profesional de viajes
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-sm text-gray-600">
              Correo electrónico
            </label>
            <input
              type="email"
              className="w-full mt-2 p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">
              Contraseña
            </label>
            <input
              type="password"
              className="w-full mt-2 p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition duration-300 shadow-lg hover:shadow-xl"
          >
            Ingresar al sistema
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          © {new Date().getFullYear()} Booking Travel
        </p>
      </div>

      {/* Animación personalizada */}
      <style jsx global>{`
        @keyframes slowZoom {
          0% {
            transform: scale(1.05);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}