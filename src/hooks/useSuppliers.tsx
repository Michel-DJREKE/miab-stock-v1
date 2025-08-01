
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useActionHistory } from '@/hooks/useActionHistory';
import { toast } from 'sonner';

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  productCount?: number;
  totalValue?: number;
}

export const useSuppliers = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { logAction } = useActionHistory();

  const { data: suppliers = [], isLoading, error } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');

      if (error) throw error;

      // Enrichir avec les statistiques de produits
      const enrichedSuppliers = await Promise.all(
        (data || []).map(async (supplier) => {
          const { data: productsData } = await supabase
            .from('products')
            .select('id, cost_price, quantity')
            .eq('supplier_id', supplier.id);

          const productCount = productsData?.length || 0;
          const totalValue = productsData?.reduce((sum, product) => 
            sum + (product.cost_price * product.quantity), 0) || 0;

          return {
            ...supplier,
            productCount,
            totalValue,
          };
        })
      );

      return enrichedSuppliers;
    },
    enabled: !!user,
  });

  const createSupplier = useMutation({
    mutationFn: async (supplierData: any) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('suppliers')
        .insert([{ 
          ...supplierData, 
          user_id: user.id,
          status: 'active' // Statut par défaut
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      await logAction.mutateAsync({
        action_type: 'create',
        entity_type: 'supplier',
        entity_id: data.id,
        entity_name: data.name,
        description: `Création du fournisseur ${data.name}`,
        new_data: variables,
      });
      toast.success('Fournisseur créé avec succès');
    },
    onError: (error) => {
      console.error('Error creating supplier:', error);
      toast.error('Erreur lors de la création du fournisseur');
    },
  });

  const updateSupplier = useMutation({
    mutationFn: async ({ id, ...supplierData }: any) => {
      const { data, error } = await supabase
        .from('suppliers')
        .update(supplierData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      const originalSupplier = suppliers.find(s => s.id === variables.id);
      await logAction.mutateAsync({
        action_type: 'update',
        entity_type: 'supplier',
        entity_id: data.id,
        entity_name: data.name,
        description: `Modification du fournisseur ${data.name}`,
        old_data: originalSupplier,
        new_data: variables,
      });
      toast.success('Fournisseur modifié avec succès');
    },
    onError: (error) => {
      console.error('Error updating supplier:', error);
      toast.error('Erreur lors de la modification du fournisseur');
    },
  });

  const deleteSupplier = useMutation({
    mutationFn: async (supplierId: string) => {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', supplierId);

      if (error) throw error;
    },
    onSuccess: async (_, supplierId) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      const deletedSupplier = suppliers.find(s => s.id === supplierId);
      await logAction.mutateAsync({
        action_type: 'delete',
        entity_type: 'supplier',
        entity_id: supplierId,
        entity_name: deletedSupplier?.name || 'Fournisseur',
        description: `Suppression du fournisseur ${deletedSupplier?.name}`,
        old_data: deletedSupplier,
      });
      toast.success('Fournisseur supprimé avec succès');
    },
    onError: (error) => {
      console.error('Error deleting supplier:', error);
      toast.error('Erreur lors de la suppression du fournisseur');
    },
  });

  return {
    suppliers,
    isLoading,
    error,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  };
};
