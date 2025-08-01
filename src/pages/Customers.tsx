
import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Search, 
  Users,
  Eye,
  Edit,
  Trash,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Grid,
  List,
  Download
} from 'lucide-react';
import CustomerForm from '@/components/CustomerForm';
import CustomersListView from '@/components/CustomersListView';
import CustomerViewModal from '@/components/CustomerViewModal';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { useCustomers } from '@/hooks/useCustomers';

const Customers = () => {
  const { language } = useApp();
  const { t } = useTranslation(language);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const { 
    customers, 
    isLoading, 
    createCustomer, 
    updateCustomer, 
    deleteCustomer 
  } = useCustomers();

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (customer.phone && customer.phone.includes(searchTerm));
    return matchesSearch;
  });

  const handleNewCustomer = () => {
    setFormMode('create');
    setSelectedCustomer(null);
    setShowForm(true);
  };

  const handleEditCustomer = (customer: any) => {
    setFormMode('edit');
    setSelectedCustomer(customer);
    setShowForm(true);
  };

  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setShowViewModal(true);
  };

  const handleDeleteCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setShowDeleteDialog(true);
  };

  const handleSaveCustomer = async (customerData: any) => {
    try {
      if (formMode === 'create') {
        await createCustomer.mutateAsync(customerData);
      } else if (selectedCustomer) {
        await updateCustomer.mutateAsync({ 
          id: selectedCustomer.id, 
          ...customerData 
        });
      }
      setShowForm(false);
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  const confirmDeleteCustomer = async () => {
    if (selectedCustomer) {
      try {
        await deleteCustomer.mutateAsync(selectedCustomer.id);
        setShowDeleteDialog(false);
        setSelectedCustomer(null);
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const handleExportExcel = () => {
    const exportData = filteredCustomers.map(customer => ({
      'Nom': customer.name,
      'Email': customer.email || '',
      'Téléphone': customer.phone || '',
      'Adresse': customer.address || '',
      'Date création': new Date(customer.created_at).toLocaleDateString('fr-FR')
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clients');
    XLSX.writeFile(wb, `clients_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Export Excel généré avec succès');
  };

  const stats = {
    totalCustomers: customers.length,
    activeCustomers: customers.length, // Tous sont actifs par défaut
    newThisMonth: customers.filter(c => new Date(c.created_at) > new Date(new Date().getFullYear(), new Date().getMonth(), 1)).length,
    totalRevenue: 0 // À calculer avec les ventes si nécessaire
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">Chargement des clients...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t.nav.customers}
          </h1>
          <p className="text-muted-foreground">
            Gérez vos clients
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleExportExcel}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exporter Excel
          </Button>
          <Button onClick={handleNewCustomer} className="miabe-button-primary">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau client
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="miabe-card">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{stats.totalCustomers}</p>
              <p className="text-sm text-muted-foreground">Total clients</p>
            </div>
          </CardContent>
        </Card>
        <Card className="miabe-card">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.activeCustomers}</p>
              <p className="text-sm text-muted-foreground">Actifs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="miabe-card">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.newThisMonth}</p>
              <p className="text-sm text-muted-foreground">Nouveaux</p>
            </div>
          </CardContent>
        </Card>
        <Card className="miabe-card">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">₣{stats.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">CA généré</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and View Toggle */}
      <Card className="miabe-card">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Display */}
      {viewMode === 'list' ? (
        <Card className="miabe-card">
          <CardContent className="p-6">
            <CustomersListView
              customers={filteredCustomers.map(customer => ({
                ...customer,
                firstName: customer.name.split(' ')[0] || '',
                lastName: customer.name.split(' ').slice(1).join(' ') || '',
                totalOrders: 0,
                totalSpent: 0,
                lastOrder: customer.created_at,
                status: 'active',
                registrationDate: customer.created_at
              }))}
              onView={handleViewCustomer}
              onEdit={handleEditCustomer}
              onDelete={handleDeleteCustomer}
            />
          </CardContent>
        </Card>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="miabe-card">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-foreground">
                          {customer.name}
                        </h3>
                        <Badge className="bg-green-500 text-white">Actif</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {customer.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span>{customer.email}</span>
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                        {customer.address && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{customer.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-miabe-yellow-100 dark:bg-miabe-black-800 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-miabe-yellow-600" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Créé le: {new Date(customer.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewCustomer(customer)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditCustomer(customer)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600"
                      onClick={() => handleDeleteCustomer(customer)}
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

      {filteredCustomers.length === 0 && (
        <Card className="miabe-card">
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Aucun client trouvé
            </h3>
            <p className="text-muted-foreground mb-6">
              Ajoutez votre premier client.
            </p>
            <Button onClick={handleNewCustomer} className="miabe-button-primary">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau client
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <CustomerForm
        customer={selectedCustomer ? {
          ...selectedCustomer,
          firstName: selectedCustomer.name.split(' ')[0] || '',
          lastName: selectedCustomer.name.split(' ').slice(1).join(' ') || '',
          status: 'active'
        } : null}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSaveCustomer}
        mode={formMode}
      />

      <CustomerViewModal
        customer={selectedCustomer ? {
          ...selectedCustomer,
          firstName: selectedCustomer.name.split(' ')[0] || '',
          lastName: selectedCustomer.name.split(' ').slice(1).join(' ') || '',
          totalOrders: 0,
          totalSpent: 0,
          lastOrder: selectedCustomer.created_at,
          status: 'active',
          registrationDate: selectedCustomer.created_at
        } : null}
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le client</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le client "{selectedCustomer?.name}" ? 
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCustomer}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Customers;
