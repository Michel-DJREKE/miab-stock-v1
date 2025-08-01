
import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Truck,
  Eye,
  Edit,
  Trash,
  Phone,
  Mail,
  MapPin,
  Package,
  TrendingUp,
  Grid3X3,
  List,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { useSuppliers } from '@/hooks/useSuppliers';
import SupplierForm from '@/components/SupplierForm';
import SuppliersListView from '@/components/SuppliersListView';

const Suppliers = () => {
  const { language } = useApp();
  const { t } = useTranslation(language);
  const { suppliers, isLoading, createSupplier, updateSupplier, deleteSupplier } = useSuppliers();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (supplier.phone && supplier.phone.includes(searchTerm))
  );

  const handleNewSupplier = () => {
    setSelectedSupplier(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleViewSupplier = (supplier: any) => {
    setSelectedSupplier(supplier);
    setFormMode('view');
    setIsFormOpen(true);
  };

  const handleEditSupplier = (supplier: any) => {
    setSelectedSupplier(supplier);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDeleteSupplier = async (supplierId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      try {
        await deleteSupplier.mutateAsync(supplierId);
      } catch (error) {
        console.error('Error deleting supplier:', error);
      }
    }
  };

  const handleSaveSupplier = async (supplierData: any) => {
    try {
      if (formMode === 'create') {
        await createSupplier.mutateAsync(supplierData);
      } else if (formMode === 'edit') {
        await updateSupplier.mutateAsync({ id: selectedSupplier.id, ...supplierData });
      }
      setIsFormOpen(false);
      setSelectedSupplier(null);
    } catch (error) {
      console.error('Error saving supplier:', error);
    }
  };

  const handleExport = () => {
    if (suppliers.length === 0) {
      toast.error('Aucun fournisseur à exporter');
      return;
    }

    const csvData = suppliers.map(supplier => ({
      'Nom': supplier.name,
      'Personne de contact': supplier.contact_person || '',
      'Email': supplier.email || '',
      'Téléphone': supplier.phone || '',
      'Adresse': supplier.address || '',
      'Nombre de produits': supplier.productCount || 0,
      'Valeur totale': supplier.totalValue || 0
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fournisseurs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Export réussi');
  };

  const getStatusBadge = (supplier: any) => {
    const hasProducts = supplier.productCount > 0;
    return hasProducts ? (
      <Badge className="bg-green-100 text-green-800">Actif</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Inactif</Badge>
    );
  };

  const stats = {
    totalSuppliers: suppliers.length,
    activeSuppliers: suppliers.filter(s => s.productCount > 0).length,
    totalValue: suppliers.reduce((sum, s) => sum + (s.totalValue || 0), 0),
    averageValue: suppliers.length > 0 ? suppliers.reduce((sum, s) => sum + (s.totalValue || 0), 0) / suppliers.length : 0
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Chargement des fournisseurs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t.nav.suppliers}
          </h1>
          <p className="text-muted-foreground">
            Gérez vos fournisseurs
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={handleNewSupplier}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau fournisseur
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{stats.totalSuppliers}</p>
              <p className="text-sm text-muted-foreground">Total fournisseurs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.activeSuppliers}</p>
              <p className="text-sm text-muted-foreground">Actifs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{stats.totalValue.toLocaleString()} F</p>
              <p className="text-sm text-muted-foreground">Valeur totale</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.averageValue.toLocaleString()} F</p>
              <p className="text-sm text-muted-foreground">Valeur moyenne</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and View Toggle */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un fournisseur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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

      {/* Suppliers Display */}
      {viewMode === 'list' ? (
        <SuppliersListView
          suppliers={filteredSuppliers}
          onView={handleViewSupplier}
          onEdit={handleEditSupplier}
          onDelete={handleDeleteSupplier}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-foreground">{supplier.name}</h3>
                        {getStatusBadge(supplier)}
                      </div>
                      {supplier.contact_person && (
                        <p className="text-sm font-medium text-blue-600 mb-2">{supplier.contact_person}</p>
                      )}
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {supplier.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span>{supplier.email}</span>
                          </div>
                        )}
                        {supplier.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            <span>{supplier.phone}</span>
                          </div>
                        )}
                        {supplier.address && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{supplier.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Truck className="w-6 h-6 text-primary" />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 py-2 border-t border-b">
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">{supplier.productCount || 0}</p>
                      <p className="text-xs text-muted-foreground">Produits</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">{(supplier.totalValue || 0).toLocaleString()} F</p>
                      <p className="text-xs text-muted-foreground">Valeur totale</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewSupplier(supplier)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditSupplier(supplier)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600"
                      onClick={() => handleDeleteSupplier(supplier.id)}
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

      {filteredSuppliers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Truck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchTerm ? 'Aucun fournisseur trouvé' : 'Aucun fournisseur'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? 'Aucun fournisseur ne correspond à votre recherche.' : 'Commencez par ajouter votre premier fournisseur.'}
            </p>
            <Button onClick={handleNewSupplier}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau fournisseur
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Supplier Form Modal */}
      <SupplierForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveSupplier}
        supplier={selectedSupplier}
        mode={formMode}
      />
    </div>
  );
};

export default Suppliers;
