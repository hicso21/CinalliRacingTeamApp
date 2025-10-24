import type React from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { useStorage } from "@/hooks/use-storage";
import { useEffect, useRef } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const storage = useStorage();
  const isInitialized = useRef(false);

  useEffect(() => {
    // Solo ejecutar una vez, incluso en Strict Mode
    if (!storage || isInitialized.current) return;

    // Verificar y establecer valores por defecto solo si no existen
    if (!storage.getItem("markupPercentage")) {
      storage.setItem("markupPercentage", "0.3");
    }

    if (!storage.getItem("lubricentro_settings")) {
      storage.setItem(
        "lubricentro_settings",
        JSON.stringify({
          autoSync: true,
          lowStockThreshold: 5,
          backupFrequency: "daily",
          notifications: true,
          markupPercentage: 0.3,
        })
      );
    }

    isInitialized.current = true;
  }, [storage]); // ✅ Incluir storage en dependencias

  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <Sidebar />
        </div>
        <div className="flex flex-col">
          <Header />
          <main className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
