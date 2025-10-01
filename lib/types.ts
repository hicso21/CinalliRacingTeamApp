export interface Product {
  id?: string
  barcode: string
  name: string
  brand: string
  category: string
  price: number
  cost: number
  stock: number
  min_stock: number
  description?: string
  supplier: string
  created_at?: string
  updated_at?: string
}

export interface ProductStats {
  product_name: string;
  total_quantity: number;
  total_revenue: number;
}

export interface Sale {
  id?: string
  sale_number?: string
  product_id: string
  product_barcode: string
  product_name: string
  quantity: number
  unit_price: number
  total_amount: number
  discount_amount?: number
  final_amount: number
  payment_method?: "cash" | "card" | "transfer" | "other"
  customer_name?: string
  customer_email?: string
  notes?: string
  sale_date?: string
  created_at?: string
  updated_at?: string
  total: number | any
}

export interface SaleWithProductInfo extends Sale {
  product_brand: string
  product_category: string
  product_cost: number
  profit_margin: number
}

export interface PurchaseOrder {
  id?: string
  product_id: string
  quantity: number
  unit_cost: number
  total: number
  supplier: string
  status: "pending" | "received" | "cancelled"
  created_at?: string
  received_at?: string
}

export interface InventoryAlert {
  product: Product
  type: "low_stock" | "out_of_stock"
}
