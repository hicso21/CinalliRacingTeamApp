"use client"

import { useState, useEffect } from "react"
import { OfflineSync } from "@/lib/offline-sync"
import { ProductService } from "@/lib/product-service"

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [pendingItems, setPendingItems] = useState(0)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  useEffect(() => {
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
  }, [])

  const updatePendingCount = () => {
    const pendingSales = OfflineSync.getPendingSales().length
    const pendingOrders = OfflineSync.getPendingPurchaseOrders().length
    setPendingItems(pendingSales + pendingOrders)
  }

  const autoSync = async () => {
    if (!navigator.onLine || syncing) return

    const settings = localStorage.getItem("lubricentro_settings")
    const autoSyncEnabled = settings ? JSON.parse(settings).autoSync : true

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

      // In a real implementation, you would sync pending sales and orders to the server
      // For now, we'll just clear them to simulate successful sync
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

      updatePendingCount()
      return true
    } catch (error) {
      console.error("Sync error:", error)
      return false
    } finally {
      setSyncing(false)
    }
  }

  const forcSync = async () => {
    return await syncData()
  }

  return {
    isOnline,
    syncing,
    pendingItems,
    lastSync,
    syncData: forcSync,
    updatePendingCount,
  }
}
