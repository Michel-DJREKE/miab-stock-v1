
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Plus, User, X } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import CustomerForm from '@/components/CustomerForm';

interface CustomerSelectorProps {
  selectedCustomer: any;
  onSelectCustomer: (customer: any) => void;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  selectedCustomer,
  onSelectCustomer
}) => {
  const { customers, isLoading, createCustomer } = useCustomers();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.phone && customer.phone.includes(searchTerm))
  );

  const handleCreateCustomer = async (customerData: any) => {
    try {
      const newCustomer = await createCustomer.mutateAsync(customerData);
      onSelectCustomer(newCustomer);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error creating customer:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">Chargement des clients...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Client sélectionné */}
      {selectedCustomer && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{selectedCustomer.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedCustomer.email || selectedCustomer.phone || 'Client sélectionné'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectCustomer(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recherche de clients */}
      {!selectedCustomer && (
        <>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau
            </Button>
          </div>

          {/* Option client anonyme */}
          <Card className="cursor-pointer hover:bg-accent/50" onClick={() => onSelectCustomer(null)}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-medium">Client anonyme</h3>
                  <p className="text-sm text-muted-foreground">Vente sans client spécifique</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des clients */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {filteredCustomers.map((customer) => (
              <Card
                key={customer.id}
                className="cursor-pointer hover:bg-accent/50"
                onClick={() => onSelectCustomer(customer)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{customer.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {customer.email && <span>{customer.email}</span>}
                          {customer.phone && <span>{customer.phone}</span>}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">Client</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredCustomers.length === 0 && searchTerm && (
              <Card>
                <CardContent className="p-8 text-center">
                  <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Aucun client trouvé
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Aucun client ne correspond à votre recherche.
                  </p>
                  <Button onClick={() => setIsFormOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer un nouveau client
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Formulaire de création de client */}
      <CustomerForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleCreateCustomer}
        mode="create"
      />
    </div>
  );
};

export default CustomerSelector;
