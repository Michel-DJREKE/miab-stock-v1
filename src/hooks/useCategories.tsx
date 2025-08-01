
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useActionHistory } from '@/hooks/useActionHistory';
import { toast } from 'sonner';

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  image?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  productCount?: number;
  totalValue?: number;
}

export const useCategories = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { logAction } = useActionHistory();

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, description, color, image, user_id, created_at, updated_at')
        .order('name');

      if (error) throw error;

      // Enrichir avec le nombre de produits et la valeur totale
      const enrichedCategories = await Promise.all(
        (data || []).map(async (category) => {
          const { data: productsData } = await supabase
            .from('products')
            .select('id, price, quantity')
            .eq('category_id', category.id);

          const productCount = productsData?.length || 0;
          const totalValue = productsData?.reduce((sum, product) => 
            sum + (product.price * product.quantity), 0) || 0;

          return {
            ...category,
            productCount,
            totalValue,
          };
        })
      );

      return enrichedCategories;
    },
    enabled: !!user,
  });

  const createCategory = useMutation({
    mutationFn: async (categoryData: any) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('categories')
        .insert([{ ...categoryData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      await logAction.mutateAsync({
        action_type: 'create',
        entity_type: 'category',
        entity_id: data.id,
        entity_name: data.name,
        description: `Création de la catégorie ${data.name}`,
        new_data: variables,
      });
      toast.success('Catégorie créée avec succès');
    },
    onError: (error) => {
      console.error('Error creating category:', error);
      toast.error('Erreur lors de la création de la catégorie');
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, ...categoryData }: any) => {
      const { data, error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      const originalCategory = categories.find(c => c.id === variables.id);
      await logAction.mutateAsync({
        action_type: 'update',
        entity_type: 'category',
        entity_id: data.id,
        entity_name: data.name,
        description: `Modification de la catégorie ${data.name}`,
        old_data: originalCategory,
        new_data: variables,
      });
      toast.success('Catégorie modifiée avec succès');
    },
    onError: (error) => {
      console.error('Error updating category:', error);
      toast.error('Erreur lors de la modification de la catégorie');
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (categoryId: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
    },
    onSuccess: async (_, categoryId) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      const deletedCategory = categories.find(c => c.id === categoryId);
      await logAction.mutateAsync({
        action_type: 'delete',
        entity_type: 'category',
        entity_id: categoryId,
        entity_name: deletedCategory?.name || 'Catégorie',
        description: `Suppression de la catégorie ${deletedCategory?.name}`,
        old_data: deletedCategory,
      });
      toast.success('Catégorie supprimée avec succès');
    },
    onError: (error) => {
      console.error('Error deleting category:', error);
      toast.error('Erreur lors de la suppression de la catégorie');
    },
  });

  return {
    categories,
    isLoading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
