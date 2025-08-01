
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useSuppliers } from '@/hooks/useSuppliers';
import { toast } from 'sonner';

interface SupplierSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const SupplierSelector: React.FC<SupplierSelectorProps> = ({ value, onChange, className }) => {
  const { suppliers, createSupplier } = useSuppliers();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: ''
  });

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Le nom du fournisseur est requis');
      return;
    }

    try {
      const newSupplier = await createSupplier.mutateAsync(formData);
      onChange(newSupplier.id);
      setIsOpen(false);
      setFormData({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: ''
      });
      toast.success('Fournisseur créé avec succès');
    } catch (error) {
      console.error('Error creating supplier:', error);
      toast.error('Erreur lors de la création du fournisseur');
    }
  };

  const handleValueChange = (newValue: string) => {
    // Convert "none" back to empty string for the parent component
    onChange(newValue === "none" ? "" : newValue);
  };

  // Convert empty string to "none" for the Select component
  const selectValue = value === "" ? "none" : value;

  return (
    <>
      <div className={`flex gap-2 ${className}`}>
        <Select value={selectValue} onValueChange={handleValueChange}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Sélectionner un fournisseur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Aucun fournisseur</SelectItem>
            {suppliers.map(supplier => (
              <SelectItem key={supplier.id} value={supplier.id}>
                {supplier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" variant="outline" onClick={() => setIsOpen(true)}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau fournisseur</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSupplier} className="space-y-4">
            <div>
              <Label htmlFor="name">Nom du fournisseur *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="contact_person">Personne de contact</Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={createSupplier.isPending}>
                {createSupplier.isPending ? 'Création...' : 'Créer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SupplierSelector;
