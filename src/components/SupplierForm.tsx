
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X, Save, Plus, Trash, Star } from 'lucide-react';

interface Supplier {
  id?: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive' | 'blocked';
  productsSupplied: string[];
  rating: number;
  averageDelay: number;
}

interface SupplierFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (supplier: Supplier) => void;
  supplier?: Supplier | null;
  mode: 'create' | 'edit' | 'view';
}

const SupplierForm: React.FC<SupplierFormProps> = ({
  isOpen,
  onClose,
  onSave,
  supplier,
  mode
}) => {
  const [formData, setFormData] = useState<Supplier>({
    name: supplier?.name || '',
    company: supplier?.company || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    address: supplier?.address || '',
    status: supplier?.status || 'active',
    productsSupplied: supplier?.productsSupplied || [],
    rating: supplier?.rating || 0,
    averageDelay: supplier?.averageDelay || 0
  });

  const [newProduct, setNewProduct] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const supplierData = {
      ...formData,
      id: supplier?.id || Date.now().toString()
    };
    onSave(supplierData);
    onClose();
  };

  const handleChange = (field: keyof Supplier, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddProduct = () => {
    if (newProduct.trim() && !formData.productsSupplied.includes(newProduct.trim())) {
      setFormData(prev => ({
        ...prev,
        productsSupplied: [...prev.productsSupplied, newProduct.trim()]
      }));
      setNewProduct('');
    }
  };

  const handleRemoveProduct = (productToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      productsSupplied: prev.productsSupplied.filter(product => product !== productToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddProduct();
    }
  };

  const renderStars = (rating: number, editable: boolean = false) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            disabled={!editable}
            onClick={() => editable && handleChange('rating', star)}
            className={`${editable ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          ({rating}/5)
        </span>
      </div>
    );
  };

  const isReadOnly = mode === 'view';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {mode === 'create' && 'Nouveau Fournisseur'}
            {mode === 'edit' && 'Modifier Fournisseur'}
            {mode === 'view' && 'Détails Fournisseur'}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du contact</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                readOnly={isReadOnly}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Entreprise</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                readOnly={isReadOnly}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                readOnly={isReadOnly}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                readOnly={isReadOnly}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              readOnly={isReadOnly}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Note du fournisseur</Label>
              {renderStars(formData.rating, !isReadOnly)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="averageDelay">Délai moyen (jours)</Label>
              <Input
                id="averageDelay"
                type="number"
                min="0"
                value={formData.averageDelay}
                onChange={(e) => handleChange('averageDelay', parseInt(e.target.value) || 0)}
                readOnly={isReadOnly}
              />
            </div>
          </div>

          {/* Produits fournis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Produits fournis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isReadOnly && (
                <div className="flex space-x-2">
                  <Input
                    value={newProduct}
                    onChange={(e) => setNewProduct(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nom du produit"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAddProduct}
                    disabled={!newProduct.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {formData.productsSupplied.map((product, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center space-x-1"
                  >
                    <span>{product}</span>
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(product)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>

              {formData.productsSupplied.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun produit ajouté
                </p>
              )}
            </CardContent>
          </Card>

          {!isReadOnly && (
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value as 'active' | 'inactive' | 'blocked')}
                className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="blocked">Bloqué</option>
              </select>
            </div>
          )}

          {!isReadOnly && (
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                {mode === 'create' ? 'Créer' : 'Sauvegarder'}
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SupplierForm;
