
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X, Save, Plus, Trash, Package, AlertCircle, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { useProducts } from '@/hooks/useProducts';
import { useSuppliers } from '@/hooks/useSuppliers';
import SupplierForm from './SupplierForm';

interface RestockingItem {
  product_id: string;
  quantity: number;
  unit_cost: number;
}

interface RestockingFormData {
  supplier_id?: string;
  status: string;
  notes?: string;
  total_amount: number;
}

interface RestockingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (restockingData: { restocking: RestockingFormData; items: RestockingItem[] }) => void;
  restocking?: any;
  mode: 'create' | 'edit' | 'view';
}

const RestockingForm: React.FC<RestockingFormProps> = ({
  isOpen,
  onClose,
  onSave,
  restocking,
  mode
}) => {
  const { products } = useProducts();
  const { suppliers, createSupplier } = useSuppliers();
  
  const [formData, setFormData] = useState<RestockingFormData>({
    supplier_id: '',
    status: 'pending',
    notes: '',
    total_amount: 0
  });

  const [items, setItems] = useState<RestockingItem[]>([]);
  const [isSupplierFormOpen, setIsSupplierFormOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState<string>('1');
  const [unitCost, setUnitCost] = useState<string>('0');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const isReadOnly = mode === 'view' || (restocking?.status === 'completed');
  const isCompleted = restocking?.status === 'completed';

  useEffect(() => {
    if (restocking && isOpen) {
      setFormData({
        supplier_id: restocking.supplier_id || '',
        status: restocking.status || 'pending',
        notes: restocking.notes || '',
        total_amount: restocking.total_amount || 0
      });

      if (restocking.restocking_items) {
        const restockingItems = restocking.restocking_items.map((item: any) => ({
          product_id: item.product_id,
          quantity: Number(item.quantity) || 0,
          unit_cost: Number(item.unit_cost) || 0
        }));
        setItems(restockingItems);
      }
    } else if (!restocking && isOpen) {
      // Reset pour nouvelle création
      setFormData({
        supplier_id: '',
        status: 'pending',
        notes: '',
        total_amount: 0
      });
      setItems([]);
      setSelectedProductId('');
      setQuantity('1');
      setUnitCost('0');
      setErrors({});
    }
  }, [restocking, isOpen]);

  // Recalculer le total à chaque modification des items
  useEffect(() => {
    const total = items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
    setFormData(prev => ({ ...prev, total_amount: total }));
  }, [items]);

  const validateItem = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!selectedProductId) {
      newErrors.product = 'Veuillez sélectionner un produit';
    }
    
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      newErrors.quantity = 'La quantité doit être supérieure à 0';
    }
    
    const cost = parseFloat(unitCost);
    if (isNaN(cost) || cost < 0) {
      newErrors.unitCost = 'Le coût unitaire doit être positif';
    }
    
    // Vérifier si le produit est déjà ajouté
    if (selectedProductId && items.some(item => item.product_id === selectedProductId)) {
      newErrors.product = 'Ce produit est déjà dans la liste';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddItem = () => {
    if (!validateItem()) {
      return;
    }

    const newItem: RestockingItem = {
      product_id: selectedProductId,
      quantity: parseFloat(quantity),
      unit_cost: parseFloat(unitCost),
    };

    setItems(prev => [...prev, newItem]);
    
    // Reset du formulaire d'ajout
    setSelectedProductId('');
    setQuantity('1');
    setUnitCost('0');
    setErrors({});
    
    toast.success('Produit ajouté avec succès');
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
    toast.success('Produit retiré de la liste');
  };

  const handleUpdateItemQuantity = (index: number, newQuantity: string) => {
    const qty = parseFloat(newQuantity);
    if (isNaN(qty) || qty <= 0) return;
    
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, quantity: qty } : item
    ));
  };

  const handleUpdateItemCost = (index: number, newCost: string) => {
    const cost = parseFloat(newCost);
    if (isNaN(cost) || cost < 0) return;
    
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, unit_cost: cost } : item
    ));
  };

  const validateForm = () => {
    if (items.length === 0) {
      toast.error('Veuillez ajouter au moins un produit');
      return false;
    }

    const validItems = items.filter(item => item.product_id && item.quantity > 0 && item.unit_cost >= 0);
    if (validItems.length !== items.length) {
      toast.error('Certains articles contiennent des erreurs');
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave({ restocking: formData, items });
  };

  const handleChange = (field: keyof RestockingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNewSupplier = async (supplierData: any) => {
    try {
      await createSupplier.mutateAsync(supplierData);
      setIsSupplierFormOpen(false);
      toast.success('Fournisseur créé avec succès');
    } catch (error) {
      console.error('Error creating supplier:', error);
      toast.error('Erreur lors de la création du fournisseur');
    }
  };

  const getProductInfo = (productId: string) => {
    return products?.find(p => p.id === productId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>
                  {mode === 'create' && 'Nouveau Réapprovisionnement'}
                  {mode === 'edit' && 'Modifier Réapprovisionnement'}
                  {mode === 'view' && 'Détails Réapprovisionnement'}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          {isCompleted && (
            <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
              <AlertCircle className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-sm text-green-800">
                Ce réapprovisionnement est terminé et a été intégré au stock.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations générales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier_id">Fournisseur *</Label>
                <div className="flex space-x-2">
                  <select
                    id="supplier_id"
                    value={formData.supplier_id}
                    onChange={(e) => handleChange('supplier_id', e.target.value)}
                    disabled={isReadOnly}
                    className="flex-1 h-10 px-3 py-2 border border-input bg-background rounded-md text-sm disabled:opacity-50"
                  >
                    <option value="">Sélectionner un fournisseur</option>
                    {suppliers?.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                  {!isReadOnly && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSupplierFormOpen(true)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  disabled={isReadOnly}
                  className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm disabled:opacity-50"
                >
                  <option value="pending">En attente</option>
                  <option value="completed">Terminé</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>
            </div>

            {/* Section d'ajout de produits (seulement en mode création) */}
            {!isReadOnly && mode === 'create' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Ajouter des produits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Produit *</Label>
                      <select
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        className={`w-full h-10 px-3 py-2 border rounded-md text-sm ${errors.product ? 'border-red-500' : 'border-input'}`}
                      >
                        <option value="">Sélectionner un produit</option>
                        {products?.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} (Stock actuel: {product.quantity})
                          </option>
                        ))}
                      </select>
                      {errors.product && <p className="text-xs text-red-500">{errors.product}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Quantité *</Label>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className={errors.quantity ? 'border-red-500' : ''}
                        placeholder="Ex: 10"
                      />
                      {errors.quantity && <p className="text-xs text-red-500">{errors.quantity}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Coût unitaire (F CFA) *</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={unitCost}
                        onChange={(e) => setUnitCost(e.target.value)}
                        className={errors.unitCost ? 'border-red-500' : ''}
                        placeholder="Ex: 1000"
                      />
                      {errors.unitCost && <p className="text-xs text-red-500">{errors.unitCost}</p>}
                    </div>
                    
                    <div className="flex items-end">
                      <Button
                        type="button"
                        onClick={handleAddItem}
                        className="w-full"
                        disabled={!selectedProductId || !quantity || !unitCost}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter
                      </Button>
                    </div>
                  </div>
                  
                  {selectedProductId && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span>Total pour cet article:</span>
                        <span className="font-semibold">
                          {formatCurrency((parseFloat(quantity) || 0) * (parseFloat(unitCost) || 0))}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Liste des produits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Produits à réapprovisionner
                  </div>
                  {items.length > 0 && (
                    <Badge variant="secondary">
                      {items.length} produit{items.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">Aucun produit ajouté</p>
                    <p className="text-sm">Commencez par ajouter des produits à réapprovisionner</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item, index) => {
                      const product = getProductInfo(item.product_id);
                      return (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                          <div className="flex-1">
                            <div className="font-medium text-lg">
                              {product?.name || 'Produit inconnu'}
                            </div>
                            <div className="text-sm text-muted-foreground mb-2">
                              Stock actuel: {product?.quantity || 0}
                            </div>
                            
                            {!isReadOnly && mode === 'edit' ? (
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <Label className="text-xs">Qté:</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => handleUpdateItemQuantity(index, e.target.value)}
                                    className="w-20 h-8"
                                  />
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Label className="text-xs">Coût:</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={item.unit_cost}
                                    onChange={(e) => handleUpdateItemCost(index, e.target.value)}
                                    className="w-24 h-8"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Quantité: </span>
                                <span className="font-medium">{item.quantity}</span>
                                <span className="text-muted-foreground"> × </span>
                                <span className="font-medium">{formatCurrency(item.unit_cost)}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-semibold">
                              {formatCurrency(item.quantity * item.unit_cost)}
                            </div>
                            {!isReadOnly && mode === 'create' && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                readOnly={isReadOnly}
                rows={3}
                placeholder="Notes concernant ce réapprovisionnement..."
                className="disabled:opacity-50"
              />
            </div>

            {/* Total */}
            <div className="flex justify-between items-center p-6 bg-primary/5 rounded-lg border-2 border-primary/20">
              <div className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-primary" />
                <span className="text-lg font-semibold">Total du réapprovisionnement:</span>
              </div>
              <span className="text-3xl font-bold text-primary">
                {formatCurrency(formData.total_amount)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                {isReadOnly ? 'Fermer' : 'Annuler'}
              </Button>
              {!isReadOnly && (
                <Button 
                  type="submit" 
                  disabled={items.length === 0}
                  className="min-w-[120px]"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {mode === 'create' ? 'Créer' : 'Sauvegarder'}
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <SupplierForm
        isOpen={isSupplierFormOpen}
        onClose={() => setIsSupplierFormOpen(false)}
        onSave={handleNewSupplier}
        mode="create"
      />
    </>
  );
};

export default RestockingForm;
