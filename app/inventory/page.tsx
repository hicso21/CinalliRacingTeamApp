"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductService } from "@/lib/product-service";
import { OfflineSync } from "@/lib/offline-sync";
import type { Product } from "@/lib/types";
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  AlertTriangle,
  Package,
} from "lucide-react";
import { ProductDialog } from "@/components/inventory/product-dialog";
import { ProductTable } from "@/components/inventory/product-table";
import { ScannerStatus } from "@/components/barcode/scanner-status";
import { useToast } from "@/hooks/use-toast";

// Updated stats type to match the service response
interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  categories: string[];
  // Optional extended stats
  totalInventoryValue?: number;
  totalCostValue?: number;
  potentialProfit?: number;
  outOfStockCount?: number;
  averageStockLevel?: number;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    totalValue: 0,
    lowStockCount: 0,
    categories: [],
  });
  const { toast } = useToast();

  useEffect(() => {
    const handleBarcodeScanned = (event: CustomEvent) => {
      const { barcode } = event.detail;

      // Find product by barcode
      const product = products.find((p) => p.barcode === barcode);

      if (product) {
        // Highlight the product in search
        setSearchQuery(barcode);
        // Show success feedback
        toast({
          title: "Producto encontrado",
          description: `${product.name} - Stock: ${product.stock}`,
        });

        // Auto-select for editing after a short delay
        setTimeout(() => {
          handleProductEdit(product);
        }, 1000);
      } else {
        // Show error feedback
        setSearchQuery(barcode);
        toast({
          title: "Producto no encontrado",
          description: `No se encontró producto con código: ${barcode}`,
          variant: "destructive",
        });
      }
    };

    window.addEventListener(
      "barcodeScanned",
      handleBarcodeScanned as EventListener
    );

    return () => {
      window.removeEventListener(
        "barcodeScanned",
        handleBarcodeScanned as EventListener
      );
    };
  }, [products, toast]);

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Filter products when search or category changes
  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      if (OfflineSync.isOnline()) {
        // Try to load from Supabase
        const { data, error } = await ProductService.getAllProducts();

        if (data && !error) {
          setProducts(data);
          OfflineSync.saveProductsToLocal(data);

          // Load stats - transform the service response to match component state
          const statsResult = await ProductService.getInventoryStats();
          if (statsResult.data) {
            const transformedStats: InventoryStats = {
              totalProducts: statsResult.data.totalProducts,
              totalValue: statsResult.data.totalInventoryValue, // Map from totalInventoryValue
              lowStockCount: statsResult.data.lowStockCount,
              categories: statsResult.data.categoryDistribution.map(
                (cat) => cat.category
              ),
              // Store additional stats as optional fields
              totalInventoryValue: statsResult.data.totalInventoryValue,
              totalCostValue: statsResult.data.totalCostValue,
              potentialProfit: statsResult.data.potentialProfit,
              outOfStockCount: statsResult.data.outOfStockCount,
              averageStockLevel: statsResult.data.averageStockLevel,
            };
            setStats(transformedStats);
          }
        } else {
          // Fallback to local storage
          const localProducts = OfflineSync.getProductsFromLocal();
          setProducts(localProducts);
          calculateLocalStats(localProducts);
          toast({
            title: "Modo offline",
            description: "Cargando datos desde almacenamiento local",
            variant: "default",
          });
        }

        const { data: categoriesData, error: categoriesError } = await ProductService.getAllCategories();

        if (!categoriesError && categoriesData) {
          setCategories(categoriesData);
        }

      } else {
        // Load from local storage when offline
        const localProducts = OfflineSync.getProductsFromLocal();
        setProducts(localProducts);
        calculateLocalStats(localProducts);
        toast({
          title: "Sin conexión",
          description: "Trabajando en modo offline",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading products:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateLocalStats = (productList: Product[]) => {
    const totalProducts = productList.length;
    const totalValue = productList.reduce(
      (sum, product) => sum + product.price * product.stock,
      0
    );
    const lowStockCount = productList.filter(
      (p) => p.stock <= p.min_stock
    ).length;
    const categories = [
      ...new Set(productList.map((p) => p.category).filter(Boolean)),
    ];

    setStats({
      totalProducts,
      totalValue,
      lowStockCount,
      categories,
    });
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.barcode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.supplier?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    setFilteredProducts(filtered);
  };

  const handleProductSave = async (
    productData: Omit<Product, "id" | "created_at" | "updated_at">
  ) => {
    try {
      // Ensure description is always a string for the service
      const safeProductData = {
        ...productData,
        description: productData.description || "", // Convert undefined to empty string
      };

      if (editingProduct) {
        // Update existing product
        if (OfflineSync.isOnline()) {
          const { data, error } = await ProductService.updateProduct(
            editingProduct.id!,
            safeProductData
          );
          if (data && !error) {
            setProducts((prev) =>
              prev.map((p) => (p.id === editingProduct.id ? data : p))
            );
            toast({
              title: "Producto actualizado",
              description: `${data.name} se actualizó correctamente`,
            });
          }
        } else {
          // Update locally when offline
          const updatedProduct = {
            ...editingProduct,
            ...safeProductData,
            updated_at: new Date().toISOString(),
          };
          setProducts((prev) =>
            prev.map((p) => (p.id === editingProduct.id ? updatedProduct : p))
          );
          const updatedProducts = products.map((p) =>
            p.id === editingProduct.id ? updatedProduct : p
          );
          OfflineSync.saveProductsToLocal(updatedProducts);
          toast({
            title: "Producto actualizado (offline)",
            description: "Los cambios se sincronizarán cuando haya conexión",
          });
        }
      } else {
        // Create new product
        if (OfflineSync.isOnline()) {
          const { data, error } = await ProductService.createProduct(
            safeProductData
          );
          if (data && !error) {
            setProducts((prev) => [data, ...prev]);
            toast({
              title: "Producto creado",
              description: `${data.name} se agregó al inventario`,
            });
          }
        } else {
          // Create locally when offline
          const newProduct: Product = {
            ...safeProductData,
            id: `temp_${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setProducts((prev) => [newProduct, ...prev]);
          const updatedProducts = [newProduct, ...products];
          OfflineSync.saveProductsToLocal(updatedProducts);
          toast({
            title: "Producto creado (offline)",
            description: "Se sincronizará cuando haya conexión",
          });
        }
      }

      setShowProductDialog(false);
      setEditingProduct(null);
      loadProducts(); // Refresh data
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el producto",
        variant: "destructive",
      });
    }
  };

  const handleProductEdit = (product: Product) => {
    setEditingProduct(product);
    setShowProductDialog(true);
  };

  const handleProductDelete = async (product: Product) => {
    if (!confirm(`¿Estás seguro de eliminar ${product.name}?`)) return;

    try {
      if (OfflineSync.isOnline()) {
        const { success, error } = await ProductService.deleteProduct(
          product.id!
        );
        if (success && !error) {
          setProducts((prev) => prev.filter((p) => p.id !== product.id));
          toast({
            title: "Producto eliminado",
            description: `${product.name} se eliminó del inventario`,
          });
        }
      } else {
        // Delete locally when offline
        const updatedProducts = products.filter((p) => p.id !== product.id);
        setProducts(updatedProducts);
        OfflineSync.saveProductsToLocal(updatedProducts);
        toast({
          title: "Producto eliminado (offline)",
          description: "Los cambios se sincronizarán cuando haya conexión",
        });
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">
            Inventario
          </h2>
          <p className="text-muted-foreground">
            Gestión completa de productos del lubricentro
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* <Button className="cursor-pointer" variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button className="cursor-pointer" variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button> */}
          <Button
            onClick={() => setShowProductDialog(true)}
            className="racing-shadow cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      <ScannerStatus />

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
            <div className="text-2xl font-bold text-primary">
              {stats.totalProducts}
            </div>
            <p className="text-xs text-muted-foreground">
              En {stats.categories.length} categorías
            </p>
          </CardContent>
        </Card>

        <Card className="racing-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ${stats.totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor del inventario
            </p>
          </CardContent>
        </Card>

        <Card className="racing-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats.lowStockCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Requieren reposición
            </p>
          </CardContent>
        </Card>

        <Card className="racing-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Tipos de productos</p>
          </CardContent>
        </Card>

      </div>

      {/* Filters */}
      <Card className="racing-shadow">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Busca y filtra productos por diferentes criterios o usa el escáner
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, marca, código de barras... (o usa el escáner)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm cursor-pointer"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>

            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="racing-shadow">
        <CardHeader>
          <CardTitle>Productos ({filteredProducts.length})</CardTitle>
          <CardDescription>
            Lista completa de productos en inventario
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Cargando productos...</div>
            </div>
          ) : (
            <ProductTable
              products={filteredProducts}
              onEdit={handleProductEdit}
              onDelete={handleProductDelete}
            />
          )}
        </CardContent>
      </Card>

      {/* Product Dialog */}
      <ProductDialog
        open={showProductDialog}
        onOpenChange={setShowProductDialog}
        product={editingProduct}
        onSave={handleProductSave}
        categories={categories}
      />
    </DashboardLayout>
  );
}
