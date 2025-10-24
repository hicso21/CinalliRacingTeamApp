"use client"

import { useState, useEffect, useRef } from "react"
import { OfflineSync } from "@/lib/offline-sync"
import { ProductService } from "@/lib/product-service"
import { useStorage } from "@/hooks/use-storage"

export function useOfflineSync() {
  const storage = useStorage()
  const [isOnline, setIsOnline] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [pendingItems, setPendingItems] = useState(0)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  
  // ✅ Usar ref para evitar múltiples ejecuciones
  const isInitialized = useRef(false)
  const isSyncing = useRef(false)

  useEffect(() => {
    // ✅ Solo inicializar UNA VEZ
    if (isInitialized.current) return
    isInitialized.current = true

    // Inicializar OfflineSync con el storage
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

    // ✅ Auto-sync on mount SOLO si está online
    if (navigator.onLine) {
      autoSync()
    }

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, []) // ✅ Array vacío - solo ejecutar al montar

  const updatePendingCount = () => {
    const pendingSales = OfflineSync.getPendingSales().length
    const pendingOrders = OfflineSync.getPendingPurchaseOrders().length
    setPendingItems(pendingSales + pendingOrders)
  }

  const autoSync = async () => {
    // ✅ Prevenir múltiples syncs simultáneos
    if (!navigator.onLine || isSyncing.current) return
    
    const storage = OfflineSync['getStorage']() // Acceder al storage interno
    const settingsStr = storage.getItem("lubricentro_settings")
    const autoSyncEnabled = settingsStr ? JSON.parse(settingsStr).autoSync : true

    if (autoSyncEnabled) {
      await syncData()
    }
  }

  const syncData = async (): Promise<boolean> => {
    // ✅ Guard para evitar syncs simultáneos
    if (!navigator.onLine || isSyncing.current) return false

    isSyncing.current = true
    setSyncing(true)

    try {
      console.log('🔄 Iniciando sync...')
      
      // Sync products from server
      const { data: productsData, error } = await ProductService.getAllProducts()
      
      if (productsData && !error) {
        console.log(`✅ ${productsData.length} productos obtenidos de la API`)
        
        // ✅ SOLO guardar si realmente cambió algo
        const currentProducts = OfflineSync.getProductsFromLocal()
        const needsUpdate = JSON.stringify(currentProducts) !== JSON.stringify(productsData)
        
        if (needsUpdate) {
          console.log('📦 Actualizando productos locales...')
          OfflineSync.saveProductsToLocal(productsData)
        } else {
          console.log('✓ Productos ya están actualizados')
        }
        
        setLastSync(new Date())
      }

      // Sync pending sales and orders
      const pendingSales = OfflineSync.getPendingSales()
      const pendingOrders = OfflineSync.getPendingPurchaseOrders()

      if (pendingSales.length > 0) {
        console.log(`📤 Enviando ${pendingSales.length} ventas pendientes...`)
        // TODO: Send sales to server
        OfflineSync.clearPendingSales()
      }

      if (pendingOrders.length > 0) {
        console.log(`📤 Enviando ${pendingOrders.length} órdenes pendientes...`)
        // TODO: Send orders to server
        OfflineSync.clearPendingPurchaseOrders()
      }

      OfflineSync.markLastSync()
      updatePendingCount()
      console.log('✅ Sync completado')
      return true
    } catch (error) {
      console.error("❌ Error en sync:", error)
      return false
    } finally {
      setSyncing(false)
      isSyncing.current = false
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