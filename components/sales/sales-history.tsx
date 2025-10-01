"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Receipt, Calendar } from "lucide-react"
import type { Sale, Product } from "@/lib/types"

interface SalesHistoryProps {
  sales: Sale[]
  products: Product[]
}

export function SalesHistory({ sales, products }: SalesHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("")

  const getProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    return product ? `${product.name} (${product.brand})` : "Producto no encontrado"
  }

  const filteredSales = sales.filter((sale) => {
    const productName = getProductName(sale.product_id).toLowerCase()
    const matchesSearch = searchQuery === "" || productName.includes(searchQuery.toLowerCase())

    const saleDate = new Date(sale.created_at!).toISOString().split("T")[0]
    const matchesDate = dateFilter === "" || saleDate === dateFilter

    return matchesSearch && matchesDate
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="racing-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="w-5 h-5" />
          Historial de Ventas
        </CardTitle>
        <CardDescription>Registro completo de todas las ventas realizadas</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por producto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <div className="relative">
              <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="pl-8" />
            </div>
          </div>
          {(searchQuery || dateFilter) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setDateFilter("")
              }}
            >
              Limpiar
            </Button>
          )}
        </div>

        {/* Sales Table */}
        {filteredSales.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No se encontraron ventas</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Precio Unit.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-mono text-sm">{formatDate(sale.created_at!)}</TableCell>
                    <TableCell>
                      <div className="font-medium">{getProductName(sale.product_id)}</div>
                    </TableCell>
                    <TableCell className="text-right">{sale.quantity}</TableCell>
                    <TableCell className="text-right">${sale.unit_price.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium">${sale.total.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={sale.id?.startsWith("temp_") ? "outline" : "secondary"}>
                        {sale.id?.startsWith("temp_") ? "Pendiente sync" : "Completada"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Summary */}
        {filteredSales.length > 0 && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium">Total Ventas</div>
                <div className="text-2xl font-bold text-primary">{filteredSales.length}</div>
              </div>
              <div>
                <div className="font-medium">Cantidad Total</div>
                <div className="text-2xl font-bold text-primary">
                  {filteredSales.reduce((sum, sale) => sum + sale.quantity, 0)}
                </div>
              </div>
              <div>
                <div className="font-medium">Monto Total</div>
                <div className="text-2xl font-bold text-primary">
                  ${filteredSales.reduce((sum, sale) => sum + sale.total, 0).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="font-medium">Ticket Promedio</div>
                <div className="text-2xl font-bold text-primary">
                  $
                  {Math.round(
                    filteredSales.reduce((sum, sale) => sum + sale.total, 0) / filteredSales.length,
                  ).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
