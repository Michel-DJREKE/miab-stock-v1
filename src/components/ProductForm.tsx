
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useCategories } from '@/hooks/useCategories';
import SupplierSelector from '@/components/SupplierSelector';
import ImageUpload from '@/components/ImageUpload';

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: any;
  onSave: (product: any) => void;
}

const ProductForm = ({ open, onOpenChange, product, onSave }: ProductFormProps) => {
  const { categories } = useCategories();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    barcode: '',
    sku: '',
    price: 0,
    cost_price: 0,
    quantity: 0,
    min_quantity: 5,
    category_id: '',
    supplier_id: '',
    image_url: '',
    expiry_date: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        barcode: product.barcode || '',
        sku: product.sku || '',
        price: product.price || 0,
        cost_price: product.cost_price || 0,
        quantity: product.quantity || 0,
        min_quantity: product.min_quantity || 5,
        category_id: product.category_id || '',
        supplier_id: product.supplier_id || '',
        image_url: product.image_url || '',
        expiry_date: product.expiry_date || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        barcode: '',
        sku: '',
        price: 0,
        cost_price: 0,
        quantity: 0,
        min_quantity: 5,
        category_id: '',
        supplier_id: '',
        image_url: '',
        expiry_date: ''
      });
    }
  }, [product, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.price <= 0) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (categories.length > 0 && !formData.category_id) {
      toast.error('Veuillez sélectionner une catégorie');
      return;
    }

    const productData = {
      ...formData,
      price: Number(formData.price),
      cost_price: Number(formData.cost_price),
      quantity: Number(formData.quantity),
      min_quantity: Number(formData.min_quantity),
      category_id: formData.category_id || null,
      supplier_id: formData.supplier_id || null,
      expiry_date: formData.expiry_date || null,
    };

    onSave(productData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Modifier le produit' : 'Ajouter un nouveau produit'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <ImageUpload
            value={formData.image_url}
            onChange={(value) => setFormData({ ...formData, image_url: value })}
            label="Image du produit"
          />

          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nom du produit *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: iPhone 14 Pro"
                required
              />
            </div>
            <div>
              <Label htmlFor="category_id">Catégorie</Label>
              <select
                id="category_id"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Créez d'abord une catégorie dans la section Catégories
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description du produit..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="barcode">Code-barres</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="Laissez vide pour génération automatique"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Un code-barres sera généré automatiquement si ce champ est vide
              </p>
            </div>
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="SKU-001"
              />
            </div>
          </div>

          {/* Prix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cost_price">Prix d'achat (F CFA)</Label>
              <Input
                id="cost_price"
                type="number"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="price">Prix de vente (F CFA) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          {/* Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Stock initial</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="min_quantity">Seuil d'alerte</Label>
              <Input
                id="min_quantity"
                type="number"
                value={formData.min_quantity}
                onChange={(e) => setFormData({ ...formData, min_quantity: parseInt(e.target.value) || 5 })}
                placeholder="5"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Fournisseur</Label>
              <SupplierSelector
                value={formData.supplier_id}
                onChange={(value) => setFormData({ ...formData, supplier_id: value })}
              />
            </div>
            <div>
              <Label htmlFor="expiry_date">Date de péremption</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Vous recevrez des alertes avant l'expiration
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              {product ? 'Modifier' : 'Ajouter'} le produit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
