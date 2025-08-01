
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package, Users, Tag, Truck } from 'lucide-react';
import ProductForm from '@/components/ProductForm';
import CustomerForm from '@/components/CustomerForm';
import CategoryForm from '@/components/CategoryForm';  
import SupplierForm from '@/components/SupplierForm';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useCategories } from '@/hooks/useCategories';
import { useSuppliers } from '@/hooks/useSuppliers';

const QuickAddButtons = () => {
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);

  const { createProduct } = useProducts();
  const { createCustomer } = useCustomers();
  const { createCategory } = useCategories();
  const { createSupplier } = useSuppliers();

  const handleSaveProduct = async (productData: any) => {
    try {
      await createProduct.mutateAsync(productData);
      setShowProductForm(false);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleSaveCustomer = async (customerData: any) => {
    try {
      await createCustomer.mutateAsync(customerData);
      setShowCustomerForm(false);
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  const handleSaveCategory = async (categoryData: any) => {
    try {
      await createCategory.mutateAsync(categoryData);
      setShowCategoryForm(false);
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleSaveSupplier = async (supplierData: any) => {
    try {
      await createSupplier.mutateAsync(supplierData);
      setShowSupplierForm(false);
    } catch (error) {
      console.error('Error saving supplier:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Ajouts rapides
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center gap-2"
            onClick={() => setShowProductForm(true)}
          >
            <Package className="w-6 h-6" />
            <span className="text-sm">Produit</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center gap-2"
            onClick={() => setShowCustomerForm(true)}
          >
            <Users className="w-6 h-6" />
            <span className="text-sm">Client</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center gap-2"
            onClick={() => setShowCategoryForm(true)}
          >
            <Tag className="w-6 h-6" />
            <span className="text-sm">Catégorie</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center gap-2"
            onClick={() => setShowSupplierForm(true)}
          >
            <Truck className="w-6 h-6" />
            <span className="text-sm">Fournisseur</span>
          </Button>
        </div>

        {/* Dialogs */}
        <ProductForm
          open={showProductForm}
          onOpenChange={setShowProductForm}
          onSave={handleSaveProduct}
        />

        <CustomerForm
          isOpen={showCustomerForm}
          onClose={() => setShowCustomerForm(false)}
          onSave={handleSaveCustomer}
          mode="create"
        />

        <CategoryForm
          open={showCategoryForm}
          onOpenChange={setShowCategoryForm}
          onSave={handleSaveCategory}
        />

        <SupplierForm
          isOpen={showSupplierForm}
          onClose={() => setShowSupplierForm(false)}
          onSave={handleSaveSupplier}
          mode="create"
        />
      </CardContent>
    </Card>
  );
};

export default QuickAddButtons;
