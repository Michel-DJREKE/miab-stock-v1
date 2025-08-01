
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  User, 
  Package,
  Receipt,
  Calculator,
  Percent,
  DollarSign,
  QrCode
} from 'lucide-react';
import { toast } from 'sonner';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import CustomerSelector from '@/components/CustomerSelector';
import BarcodeScanner from '@/components/BarcodeScanner';
import ReceiptPreview from '@/components/ReceiptPreview';

interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  stock: number;
}

const NewSale = () => {
  const { products, isLoading: isLoadingProducts } = useProducts();
  const { createSale } = useSales();

  // États principaux
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  
  // États pour les remises
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage');
  const [discountValue, setDiscountValue] = useState('0');
  
  // États des modales
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);
  const [completedSale, setCompletedSale] = useState<any>(null);

  // Recherche de produits
  const [searchTerm, setSearchTerm] = useState('');

  // Calculs
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = discountType === 'percentage' 
    ? (subtotal * parseFloat(discountValue || '0')) / 100
    : parseFloat(discountValue || '0');
  const totalAmount = Math.max(0, subtotal - discountAmount);

  // Produits filtrés pour la recherche
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.includes(searchTerm)
  );

  // Ajouter un produit au panier
  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.product_id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.quantity) {
        toast.error('Stock insuffisant');
        return;
      }
      
      setCart(cart.map(item =>
        item.product_id === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
              total: (item.quantity + 1) * item.price
            }
          : item
      ));
    } else {
      if (product.quantity <= 0) {
        toast.error('Produit en rupture de stock');
        return;
      }
      
      setCart([...cart, {
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        total: product.price,
        stock: product.quantity
      }]);
    }
  };

  // Modifier la quantité d'un produit
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const item = cart.find(item => item.product_id === productId);
    if (item && newQuantity > item.stock) {
      toast.error('Quantité supérieure au stock disponible');
      return;
    }

    setCart(cart.map(item =>
      item.product_id === productId
        ? {
            ...item,
            quantity: newQuantity,
            total: newQuantity * item.price
          }
        : item
    ));
  };

  // Supprimer un produit du panier
  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  // Vider le panier
  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setDiscountValue('0');
    setNotes('');
  };

  // Traitement du scan de code-barres
  const handleBarcodeScanned = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      addToCart(product);
      toast.success(`Produit ${product.name} ajouté au panier`);
    } else {
      toast.error('Produit non trouvé');
    }
  };

  // Finaliser la vente
  const completeSale = async () => {
    if (cart.length === 0) {
      toast.error('Le panier est vide');
      return;
    }

    if (totalAmount <= 0) {
      toast.error('Le montant total doit être positif');
      return;
    }

    try {
      const saleData = {
        sale: {
          sale_number: `VT-${Date.now()}`,
          customer_id: selectedCustomer?.id || null,
          total_amount: totalAmount,
          discount_amount: discountAmount,
          payment_method: paymentMethod,
          status: 'completed',
          notes: notes || undefined,
          tax_amount: 0,
        },
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.total,
        }))
      };

      const newSale = await createSale.mutateAsync(saleData);
      
      setCompletedSale({
        ...newSale,
        items: cart,
        customer: selectedCustomer,
        discount_amount: discountAmount,
        total_amount: totalAmount
      });
      
      setShowReceiptPreview(true);
      clearCart();
      
    } catch (error) {
      console.error('Error completing sale:', error);
    }
  };

  if (isLoadingProducts) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Section gauche - Sélection des produits */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header avec recherche */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Nouvelle Vente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un produit par nom ou code-barres..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowBarcodeScanner(true)}
                >
                  <QrCode className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sélection du client */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Client
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerSelector
                selectedCustomer={selectedCustomer}
                onSelectCustomer={setSelectedCustomer}
              />
            </CardContent>
          </Card>

          {/* Grille des produits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Produits Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => addToCart(product)}
                  >
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm truncate">{product.name}</h4>
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-primary">₣{product.price}</span>
                          <Badge variant={product.quantity > 0 ? "secondary" : "destructive"}>
                            Stock: {product.quantity}
                          </Badge>
                        </div>
                        {product.categories && (
                          <div className="text-xs text-muted-foreground truncate">
                            {product.categories.name}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucun produit trouvé</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Section droite - Panier et finalisation */}
        <div className="space-y-6">
          
          {/* Panier */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Panier ({cart.length})
              </CardTitle>
              {cart.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearCart}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.product_id} className="flex items-center justify-between p-3 bg-accent/50 rounded">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">₣{item.price} × {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromCart(item.product_id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {cart.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Panier vide</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Remise */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Remise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Button
                  variant={discountType === 'percentage' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDiscountType('percentage')}
                >
                  <Percent className="w-4 h-4" />
                </Button>
                <Button
                  variant={discountType === 'amount' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDiscountType('amount')}
                >
                  <DollarSign className="w-4 h-4" />
                </Button>
              </div>
              <Input
                type="number"
                placeholder={discountType === 'percentage' ? 'Pourcentage' : 'Montant (₣)'}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                min="0"
                max={discountType === 'percentage' ? '100' : undefined}
              />
            </CardContent>
          </Card>

          {/* Mode de paiement */}
          <Card>
            <CardHeader>
              <CardTitle>Mode de paiement</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Espèces</SelectItem>
                  <SelectItem value="card">Carte bancaire</SelectItem>
                  <SelectItem value="mobile">Paiement mobile</SelectItem>
                  <SelectItem value="check">Chèque</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Notes sur la vente..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Récapitulatif et finalisation */}
          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Sous-total:</span>
                <span>₣{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Remise:</span>
                  <span>-₣{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>₣{totalAmount.toFixed(2)}</span>
              </div>
              <Button 
                className="w-full" 
                onClick={completeSale}
                disabled={cart.length === 0 || createSale.isPending}
              >
                <Receipt className="w-4 h-4 mr-2" />
                {createSale.isPending ? 'Traitement...' : 'Finaliser la vente'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modales */}
      <BarcodeScanner
        open={showBarcodeScanner}
        onOpenChange={setShowBarcodeScanner}
        onBarcodeScanned={handleBarcodeScanned}
      />

      {completedSale && (
        <ReceiptPreview
          isOpen={showReceiptPreview}
          onClose={() => {
            setShowReceiptPreview(false);
            setCompletedSale(null);
          }}
          saleData={completedSale}
          onValidate={() => {
            setShowReceiptPreview(false);
            setCompletedSale(null);
          }}
          onEdit={() => {
            setShowReceiptPreview(false);
            // Optionnel: recharger les données dans le panier pour modification
          }}
        />
      )}
    </div>
  );
};

export default NewSale;
