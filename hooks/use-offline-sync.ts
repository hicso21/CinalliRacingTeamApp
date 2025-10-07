"use client"

import { useState, useEffect } from "react"
import { OfflineSync } from "@/lib/offline-sync"
import { ProductService } from "@/lib/product-service"
import { useStorage } from "@/hooks/use-storage"

export function useOfflineSync() {
  const storage = useStorage() // ✅ Obtener storage del contexto
  const [isOnline, setIsOnline] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [pendingItems, setPendingItems] = useState(0)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  useEffect(() => {
    // ✅ Inicializar OfflineSync con el storage
    OfflineSync.setStorage(storage)

    // Initialize state
    setIsOnline(navigator.onLine)
    setLastSync(OfflineSync.getLastSyncTime())
    updatePendingCount()

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      autoSync()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Auto-sync on mount if online
    if (navigator.onLine) {
      autoSync()
    }

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [storage]) // ✅ Agregar storage como dependencia

  const updatePendingCount = () => {
    const pendingSales = OfflineSync.getPendingSales().length
    const pendingOrders = OfflineSync.getPendingPurchaseOrders().length
    setPendingItems(pendingSales + pendingOrders)
  }

  const autoSync = async () => {
    if (!navigator.onLine || syncing) return

    const settingsStr = storage.getItem("lubricentro_settings")
    const autoSyncEnabled = settingsStr ? JSON.parse(settingsStr).autoSync : true

    if (autoSyncEnabled) {
      await syncData()
    }
  }

  const syncData = async (): Promise<boolean> => {
    if (!navigator.onLine || syncing) return false

    setSyncing(true)

    try {
      // Sync products from server
      const { data: productsData, error } = await ProductService.getAllProducts()
      if (productsData && !error) {
        OfflineSync.saveProductsToLocal(productsData)
        setLastSync(new Date())
      }

      // Sync pending sales and orders
      const pendingSales = OfflineSync.getPendingSales()
      const pendingOrders = OfflineSync.getPendingPurchaseOrders()

      if (pendingSales.length > 0) {
        // TODO: Send sales to server
        OfflineSync.clearPendingSales()
      }

      if (pendingOrders.length > 0) {
        // TODO: Send orders to server
        OfflineSync.clearPendingPurchaseOrders()
      }

      OfflineSync.markLastSync()
      updatePendingCount()
      return true
    } catch (error) {
      console.error("Sync error:", error)
      return false
    } finally {
      setSyncing(false)
    }
  }

  const forceSync = async () => {
    return await syncData()
  }

  return {
    isOnline,
    syncing,
    pendingItems,
    lastSync,
    syncData: forceSync,
    updatePendingCount,
  }
}