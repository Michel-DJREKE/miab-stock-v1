
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { X, Package, DollarSign, Calendar, Truck, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductViewModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

const ProductViewModal: React.FC<ProductViewModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  if (!product) return null;

  const getStockStatus = (quantity: number, minQuantity?: number) => {
    if (quantity === 0) {
      return <Badge className="bg-red-100 text-red-800">Rupture de stock</Badge>;
    }
    if (minQuantity && quantity <= minQuantity) {
      return <Badge className="bg-yellow-100 text-yellow-800">Stock faible</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">En stock</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Détails du produit
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* En-tête du produit */}
          <div className="flex items-start space-x-4">
            {product.image_url && (
              <div className="flex-shrink-0">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded-lg border"
                />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-2">{product.name}</h2>
              {product.description && (
                <p className="text-muted-foreground mb-3">{product.description}</p>
              )}
              <div className="flex items-center space-x-2">
                {getStockStatus(product.quantity, product.min_quantity)}
              </div>
            </div>
          </div>

          {/* Informations principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold">Prix et coût</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prix de vente:</span>
                    <span className="font-medium">{product.price.toLocaleString()} F</span>
                  </div>
                  {product.cost_price && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prix d'achat:</span>
                      <span className="font-medium">{product.cost_price.toLocaleString()} F</span>
                    </div>
                  )}
                  {product.cost_price && (
                    <div className="flex justify-between text-green-600">
                      <span>Marge:</span>
                      <span className="font-medium">
                        {(product.price - product.cost_price).toLocaleString()} F
                        ({(((product.price - product.cost_price) / product.price) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold">Stock</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantité actuelle:</span>
                    <span className="font-medium">{product.quantity}</span>
                  </div>
                  {product.min_quantity && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stock minimum:</span>
                      <span className="font-medium">{product.min_quantity}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Informations secondaires */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Tag className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold">Identification</h3>
                </div>
                <div className="space-y-2">
                  {product.sku && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SKU:</span>
                      <span className="font-medium">{product.sku}</span>
                    </div>
                  )}
                  {product.barcode && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Code-barres:</span>
                      <span className="font-medium font-mono">{product.barcode}</span>
                    </div>
                  )}
                  {product.categories?.name && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Catégorie:</span>
                      <Badge style={{ backgroundColor: product.categories.color, color: 'white' }}>
                        {product.categories.name}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <h3 className="font-semibold">Dates</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Créé le:</span>
                    <span className="font-medium">
                      {new Date(product.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modifié le:</span>
                    <span className="font-medium">
                      {new Date(product.updated_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {product.expiry_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date d'expiration:</span>
                      <span className={`font-medium ${new Date(product.expiry_date) < new Date() ? 'text-red-600' : ''}`}>
                        {new Date(product.expiry_date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fournisseur */}
          {product.suppliers && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Truck className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold">Fournisseur</h3>
                </div>
                <p className="text-foreground font-medium">{product.suppliers.name}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductViewModal;
