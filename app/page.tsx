import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  DollarSign,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">
            Dashboard
          </h2>
          <p className="text-muted-foreground">
            Resumen general del lubricentro Cinalli Racing Team
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="racing-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Productos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">1,234</div>
            <p className="text-xs text-muted-foreground">
              +20.1% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card className="racing-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ventas del Día
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">$45,231</div>
            <p className="text-xs text-muted-foreground">+15% desde ayer</p>
          </CardContent>
        </Card>

        <Card className="racing-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">23</div>
            <p className="text-xs text-muted-foreground">
              Productos requieren reposición
            </p>
          </CardContent>
        </Card>

        <Card className="racing-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Inventario
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">$234,567</div>
            <p className="text-xs text-muted-foreground">Total en stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="racing-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Alertas de Stock
            </CardTitle>
            <CardDescription>
              Productos que requieren atención inmediata
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Aceite Mobil 1 5W-30</span>
              <Badge variant="destructive">2 unidades</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Filtro de Aire K&N</span>
              <Badge variant="destructive">0 unidades</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Bujías NGK Iridium</span>
              <Badge variant="outline">5 unidades</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="racing-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Productos Más Vendidos
            </CardTitle>
            <CardDescription>Top 3 productos de la semana</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Aceite Shell Helix 10W-40</span>
              <Badge variant="secondary">45 ventas</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Filtro de Aceite Mann</span>
              <Badge variant="secondary">32 ventas</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Líquido de Frenos DOT 4</span>
              <Badge variant="secondary">28 ventas</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="racing-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Acciones Rápidas
            </CardTitle>
            <CardDescription>Operaciones frecuentes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 gap-2">
              <button className="flex items-center gap-2 p-2 text-sm rounded-md hover:bg-muted transition-colors">
                <ShoppingCart className="h-4 w-4" />
                Nueva Venta
              </button>
              <button className="flex items-center gap-2 p-2 text-sm rounded-md hover:bg-muted transition-colors">
                <Package className="h-4 w-4" />
                Agregar Producto
              </button>
              <button className="flex items-center gap-2 p-2 text-sm rounded-md hover:bg-muted transition-colors">
                <TrendingUp className="h-4 w-4" />
                Nuevo Pedido
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="racing-shadow">
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>
            Últimas operaciones realizadas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Venta registrada</p>
                <p className="text-xs text-muted-foreground">
                  Aceite Castrol GTX 20W-50 - 3 unidades - $15,450
                </p>
              </div>
              <div className="text-xs text-muted-foreground">Hace 5 min</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-accent"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Stock actualizado</p>
                <p className="text-xs text-muted-foreground">
                  Filtro de combustible Bosch - Stock: 15 → 25 unidades
                </p>
              </div>
              <div className="text-xs text-muted-foreground">Hace 12 min</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-destructive"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Alerta de stock bajo</p>
                <p className="text-xs text-muted-foreground">
                  Aceite Mobil 1 5W-30 - Solo quedan 2 unidades
                </p>
              </div>
              <div className="text-xs text-muted-foreground">Hace 25 min</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
