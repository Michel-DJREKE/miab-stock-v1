
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash, 
  Package, 
  AlertTriangle, 
  Grid3X3, 
  List,
  Download 
} from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import ProductForm from '@/components/ProductForm';
import ProductViewModal from '@/components/ProductViewModal';
import { toast } from 'sonner';

const Products = () => {
  const { products, isLoading, createProduct, updateProduct, deleteProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (product.barcode && product.barcode.includes(searchTerm));
    
    const matchesCategory = categoryFilter === 'all' || 
                           (product.categories && product.categories.name === categoryFilter);
    
    return matchesSearch && matchesCategory;
  }) || [];

  const totalProducts = products?.length || 0;
  const lowStockCount = products?.filter(p => p.min_quantity && p.quantity <= p.min_quantity).length || 0;
  const outOfStockCount = products?.filter(p => p.quantity === 0).length || 0;
  const totalValue = products?.reduce((sum, p) => sum + (p.quantity * p.price), 0) || 0;

  const categories = Array.from(new Set(products?.map(p => p.categories?.name).filter(Boolean))) || [];

  const handleCreate = () => {
    setSelectedProduct(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleView = (product: any) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDelete = async (product: any) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${product.name}" ?`)) {
      try {
        await deleteProduct.mutateAsync(product.id);
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleSave = async (productData: any) => {
    try {
      if (formMode === 'create') {
        await createProduct.mutateAsync(productData);
      } else if (selectedProduct) {
        await updateProduct.mutateAsync({ id: selectedProduct.id, ...productData });
      }
      setIsFormOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const getStockBadge = (product: any) => {
    if (product.quantity === 0) {
      return <Badge className="bg-red-100 text-red-800">Rupture</Badge>;
    }
    if (product.min_quantity && product.quantity <= product.min_quantity) {
      return <Badge className="bg-yellow-100 text-yellow-800">Stock faible</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">En stock</Badge>;
  };

  const handleExport = () => {
    if (filteredProducts.length === 0) {
      toast.error('Aucun produit à exporter');
      return;
    }

    const csvData = filteredProducts.map(product => ({
      'Nom': product.name,
      'SKU': product.sku || '',
      'Code-barres': product.barcode || '',
      'Prix': product.price,
      'Quantité': product.quantity,
      'Catégorie': product.categories?.name || ''
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `produits_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Export réussi');
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted animate-pulse rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted animate-pulse rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Produits</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau produit
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Produits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock faible</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Produits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rupture</CardTitle>
            <Package className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
            <p className="text-xs text-muted-foreground">Produits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur totale</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalValue.toLocaleString()} F</div>
            <p className="text-xs text-muted-foreground">Stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et vue */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1 max-w-md space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des produits */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des produits</CardTitle>
          <CardDescription>
            Gérez votre inventaire de produits
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || categoryFilter !== 'all' ? 'Aucun produit trouvé' : 'Aucun produit'}
              </p>
              {!searchTerm && categoryFilter === 'all' && (
                <Button onClick={handleCreate} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer le premier produit
                </Button>
              )}
            </div>
          ) : viewMode === 'list' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-8 h-8 object-cover rounded"
                          />
                        )}
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {product.sku || '-'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.price.toLocaleString()} F
                    </TableCell>
                    <TableCell>
                      <span className={product.quantity === 0 ? 'text-red-600' : product.min_quantity && product.quantity <= product.min_quantity ? 'text-yellow-600' : 'text-green-600'}>
                        {product.quantity}
                      </span>
                      {product.min_quantity && (
                        <span className="text-muted-foreground text-sm ml-1">
                          (min: {product.min_quantity})
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.categories ? (
                        <Badge style={{ backgroundColor: product.categories.color, color: 'white' }}>
                          {product.categories.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStockBadge(product)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => handleView(product)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(product)}
                          className="text-red-600"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            /* Vue en grille */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {product.image_url && (
                        <div className="w-full h-32 bg-muted rounded-lg overflow-hidden">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{product.name}</h3>
                        {product.description && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold">{product.price.toLocaleString()} F</span>
                          {getStockBadge(product)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Stock: {product.quantity}
                          {product.min_quantity && ` (min: ${product.min_quantity})`}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleView(product)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600"
                          onClick={() => handleDelete(product)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ProductForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSave}
        product={selectedProduct}
      />

      <ProductViewModal
        product={selectedProduct}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      />
    </div>
  );
};

export default Products;
