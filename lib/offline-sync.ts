import type { Product, Sale, PurchaseOrder } from "./types"

const STORAGE_KEYS = {
  PRODUCTS: "lubricentro_products",
  SALES: "lubricentro_sales",
  PURCHASE_ORDERS: "lubricentro_purchase_orders",
  LAST_SYNC: "lubricentro_last_sync",
}

export class OfflineSync {
  // Productos

  // Órdenes de compra pendientes
  static savePendingPurchaseOrder(order: Omit<PurchaseOrder, "id">) {
    const pending = this.getPendingPurchaseOrders()
    pending.push({ ...order, id: `temp_${Date.now()}` })
    localStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify(pending))
  }

  static getPendingPurchaseOrders(): PurchaseOrder[] {
    const stored = localStorage.getItem(STORAGE_KEYS.PURCHASE_ORDERS)
    return stored ? JSON.parse(stored) : []
  }

  static clearPendingPurchaseOrders() {
    localStorage.removeItem(STORAGE_KEYS.PURCHASE_ORDERS)
  }

  // Estado de conexión
  static isOnline(): boolean {
    return navigator.onLine
  }

  static getLastSyncTime(): Date | null {
    const stored = localStorage.getItem(STORAGE_KEYS.LAST_SYNC)
    return stored ? new Date(stored) : null
  }

  /**
   * Guardar venta pendiente para sincronización posterior
   */
  static savePendingSale(sale: Omit<Sale, "id"> & { id?: string }): void {
    try {
      const pendingSales = this.getPendingSales();
      const saleWithId = {
        ...sale,
        id: sale.id || `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: sale.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      pendingSales.push(saleWithId);
      localStorage.setItem('pending_sales', JSON.stringify(pendingSales));

      console.log('📦 Venta guardada para sincronización:', saleWithId.sale_number);
    } catch (error) {
      console.error('Error guardando venta pendiente:', error);
    }
  }

  /**
   * Obtener todas las ventas pendientes de sincronización
   */
  static getPendingSales(): Sale[] {
    try {
      const stored = localStorage.getItem('pending_sales');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error obteniendo ventas pendientes:', error);
      return [];
    }
  }

  /**
   * Eliminar venta pendiente después de sincronización exitosa
   */
  static removePendingSale(saleId: string): void {
    try {
      const pendingSales = this.getPendingSales();
      const filtered = pendingSales.filter(sale => sale.id !== saleId);
      localStorage.setItem('pending_sales', JSON.stringify(filtered));

      console.log('✅ Venta sincronizada y eliminada de pendientes:', saleId);
    } catch (error) {
      console.error('Error eliminando venta pendiente:', error);
    }
  }

  /**
   * Limpiar todas las ventas pendientes (usar con precaución)
   */
  static clearPendingSales(): void {
    try {
      localStorage.removeItem('pending_sales');
      console.log('🗑️ Todas las ventas pendientes eliminadas');
    } catch (error) {
      console.error('Error limpiando ventas pendientes:', error);
    }
  }

  /**
   * Actualizar stock de producto localmente
   */
  static updateLocalProductStock(productId: string, newStock: number): void {
    try {
      const products = this.getProductsFromLocal();
      const updatedProducts = products.map(product =>
        product.id === productId
          ? { ...product, stock: newStock, updated_at: new Date().toISOString() }
          : product
      );

      this.saveProductsToLocal(updatedProducts);
      console.log(`📦 Stock local actualizado para producto ${productId}: ${newStock}`);
    } catch (error) {
      console.error('Error actualizando stock local:', error);
    }
  }

  /**
   * Obtener productos desde localStorage
   */
  static getProductsFromLocal(): Product[] {
    try {
      const stored = localStorage.getItem('local_products');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error obteniendo productos locales:', error);
      return [];
    }
  }

  /**
   * Guardar productos en localStorage
   */
  static saveProductsToLocal(products: Product[]): void {
    try {
      localStorage.setItem('local_products', JSON.stringify(products));
      localStorage.setItem('local_products_timestamp', new Date().toISOString());
      console.log(`📦 ${products.length} productos guardados localmente`);
    } catch (error) {
      console.error('Error guardando productos localmente:', error);
    }
  }

  /**
   * Obtener estadísticas de sincronización
   */
  static getSyncStats(): {
    pendingSalesCount: number;
    lastSyncTimestamp: string | null;
    localProductsCount: number;
    localProductsTimestamp: string | null;
  } {
    try {
      return {
        pendingSalesCount: this.getPendingSales().length,
        lastSyncTimestamp: localStorage.getItem('last_sync_timestamp'),
        localProductsCount: this.getProductsFromLocal().length,
        localProductsTimestamp: localStorage.getItem('local_products_timestamp'),
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas de sync:', error);
      return {
        pendingSalesCount: 0,
        lastSyncTimestamp: null,
        localProductsCount: 0,
        localProductsTimestamp: null,
      };
    }
  }

  /**
   * Marcar timestamp de última sincronización exitosa
   */
  static markLastSync(): void {
    try {
      localStorage.setItem('last_sync_timestamp', new Date().toISOString());
    } catch (error) {
      console.error('Error marcando timestamp de sync:', error);
    }
  }

  /**
   * Validar integridad de datos locales
   */
  static validateLocalData(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validar productos locales
      const products = this.getProductsFromLocal();
      if (products.length === 0) {
        warnings.push('No hay productos guardados localmente');
      }

      // Validar estructura de productos
      for (const product of products) {
        if (!product.id) errors.push(`Producto sin ID encontrado`);
        if (!product.barcode) errors.push(`Producto ${product.id} sin código de barras`);
        if (product.stock < 0) errors.push(`Producto ${product.id} con stock negativo: ${product.stock}`);
      }

      // Validar ventas pendientes
      const pendingSales = this.getPendingSales();
      for (const sale of pendingSales) {
        if (!sale.product_id) errors.push(`Venta pendiente sin product_id`);
        if (sale.quantity <= 0) errors.push(`Venta pendiente con cantidad inválida: ${sale.quantity}`);
        if (!sale.sale_number) errors.push(`Venta pendiente sin número de venta`);
      }

      // Verificar timestamps
      const productsTimestamp = localStorage.getItem('local_products_timestamp');
      if (!productsTimestamp) {
        warnings.push('No hay timestamp para productos locales');
      } else {
        const age = Date.now() - new Date(productsTimestamp).getTime();
        const hoursOld = age / (1000 * 60 * 60);
        if (hoursOld > 24) {
          warnings.push(`Los productos locales tienen ${Math.round(hoursOld)} horas de antigüedad`);
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };

    } catch (error: Error | any) {
      errors.push(`Error validando datos locales: ${error.message}`);
      return { isValid: false, errors, warnings };
    }
  }

  /**
   * Exportar datos para respaldo
   */
  static exportLocalData(): {
    products: Product[];
    pendingSales: Sale[];
    timestamp: string;
    stats: any;
  } {
    return {
      products: this.getProductsFromLocal(),
      pendingSales: this.getPendingSales(),
      timestamp: new Date().toISOString(),
      stats: this.getSyncStats(),
    };
  }

  /**
   * Importar datos desde respaldo (usar con precaución)
   */
  static importLocalData(data: {
    products?: Product[];
    pendingSales?: Sale[];
  }): { success: boolean; message: string } {
    try {
      if (data.products) {
        this.saveProductsToLocal(data.products);
      }

      if (data.pendingSales) {
        localStorage.setItem('pending_sales', JSON.stringify(data.pendingSales));
      }

      return {
        success: true,
        message: `Datos importados: ${data.products?.length || 0} productos, ${data.pendingSales?.length || 0} ventas pendientes`
      };
    } catch (error: Error | any) {
      return {
        success: false,
        message: `Error importando datos: ${error.message}`
      };
    }
  }

  /**
   * Verificar si necesita sincronización
   */
  static needsSync(): boolean {
    const pendingSales = this.getPendingSales();
    const lastSync = localStorage.getItem('last_sync_timestamp');

    // Necesita sync si hay ventas pendientes o si hace más de 1 hora del último sync
    if (pendingSales.length > 0) return true;

    if (!lastSync) return true;

    const hoursSinceLastSync = (Date.now() - new Date(lastSync).getTime()) / (1000 * 60 * 60);
    return hoursSinceLastSync > 1;
  }
}
