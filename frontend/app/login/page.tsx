import Image from "next/image";
import { LoginForm } from "@/features/auth/components/login-form";
import { appConfig } from "@/lib/config";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1174&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Vista desde avion"
        className="absolute inset-0 w-full h-full object-cover scale-101 animate-[slowZoom_20s_linear_infinite]"
        fill
        priority
      />

      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/20 to-black/60 backdrop-blur-s" />

      <div className="relative z-10 bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl p-10 w-[380px] border border-white/40">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-800">
            {appConfig.appName}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Gestion profesional de viajes
          </p>
        </div>

        <LoginForm />

        <p className="text-xs text-gray-400 text-center mt-6">
          &copy; {new Date().getFullYear()} {appConfig.appName}
        </p>
      </div>
    </div>
  );
}
