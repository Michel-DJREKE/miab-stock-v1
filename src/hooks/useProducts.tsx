
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useActionHistory } from '@/hooks/useActionHistory';
import { toast } from 'sonner';

export const useProducts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { logAction } = useActionHistory();

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories!fk_products_category (name, color),
          suppliers!fk_products_supplier (name)
        `)
        .order('name');

      if (error) {
        console.error('Products query error:', error);
        // Fallback sans les relations
        const { data: basicData, error: basicError } = await supabase
          .from('products')
          .select('*')
          .order('name');
        
        if (basicError) throw basicError;
        return (basicData || []).map(product => ({
          ...product,
          categories: null,
          suppliers: null
        }));
      }
      
      return (data || []).map(product => ({
        ...product,
        categories: Array.isArray(product.categories) ? product.categories[0] : product.categories,
        suppliers: Array.isArray(product.suppliers) ? product.suppliers[0] : product.suppliers
      }));
    },
    enabled: !!user,
  });

  const createProduct = useMutation({
    mutationFn: async (productData: any) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('products')
        .insert([{ ...productData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      await logAction.mutateAsync({
        action_type: 'create',
        entity_type: 'product',
        entity_id: data.id,
        entity_name: data.name,
        description: `Création du produit ${data.name}`,
        new_data: variables,
      });
      toast.success('Produit créé avec succès');
    },
    onError: (error) => {
      console.error('Error creating product:', error);
      toast.error('Erreur lors de la création du produit');
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...productData }: any) => {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      const originalProduct = products.find(p => p.id === variables.id);
      await logAction.mutateAsync({
        action_type: 'update',
        entity_type: 'product',
        entity_id: data.id,
        entity_name: data.name,
        description: `Modification du produit ${data.name}`,
        old_data: originalProduct,
        new_data: variables,
      });
      toast.success('Produit modifié avec succès');
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      toast.error('Erreur lors de la modification du produit');
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
    },
    onSuccess: async (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      const deletedProduct = products.find(p => p.id === productId);
      await logAction.mutateAsync({
        action_type: 'delete',
        entity_type: 'product',
        entity_id: productId,
        entity_name: deletedProduct?.name || 'Produit',
        description: `Suppression du produit ${deletedProduct?.name}`,
        old_data: deletedProduct,
      });
      toast.success('Produit supprimé avec succès');
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
      toast.error('Erreur lors de la suppression du produit');
    },
  });

  return {
    products,
    isLoading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
