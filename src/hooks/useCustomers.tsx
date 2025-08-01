
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useActionHistory } from '@/hooks/useActionHistory';
import { toast } from 'sonner';

export const useCustomers = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { logAction } = useActionHistory();

  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');

      if (error) throw error;

      // Enrichir avec les statistiques de ventes
      const enrichedCustomers = await Promise.all(
        (data || []).map(async (customer) => {
          const { data: salesData } = await supabase
            .from('sales')
            .select('id, total_amount, created_at')
            .eq('customer_id', customer.id)
            .order('created_at', { ascending: false });

          const orderCount = salesData?.length || 0;
          const totalSpent = salesData?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;
          const lastOrderDate = salesData?.[0]?.created_at || null;

          return {
            ...customer,
            orderCount,
            totalSpent,
            lastOrderDate,
          };
        })
      );

      return enrichedCustomers;
    },
    enabled: !!user,
  });

  const createCustomer = useMutation({
    mutationFn: async (customerData: any) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('customers')
        .insert([{ ...customerData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      await logAction.mutateAsync({
        action_type: 'create',
        entity_type: 'customer',
        entity_id: data.id,
        entity_name: data.name,
        description: `Création du client ${data.name}`,
        new_data: variables,
      });
      toast.success('Client créé avec succès');
    },
    onError: (error) => {
      console.error('Error creating customer:', error);
      toast.error('Erreur lors de la création du client');
    },
  });

  const updateCustomer = useMutation({
    mutationFn: async ({ id, ...customerData }: any) => {
      const { data, error } = await supabase
        .from('customers')
        .update(customerData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      const originalCustomer = customers.find(c => c.id === variables.id);
      await logAction.mutateAsync({
        action_type: 'update',
        entity_type: 'customer',
        entity_id: data.id,
        entity_name: data.name,
        description: `Modification du client ${data.name}`,
        old_data: originalCustomer,
        new_data: variables,
      });
      toast.success('Client modifié avec succès');
    },
    onError: (error) => {
      console.error('Error updating customer:', error);
      toast.error('Erreur lors de la modification du client');
    },
  });

  const deleteCustomer = useMutation({
    mutationFn: async (customerId: string) => {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) throw error;
    },
    onSuccess: async (_, customerId) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      const deletedCustomer = customers.find(c => c.id === customerId);
      await logAction.mutateAsync({
        action_type: 'delete',
        entity_type: 'customer',
        entity_id: customerId,
        entity_name: deletedCustomer?.name || 'Client',
        description: `Suppression du client ${deletedCustomer?.name}`,
        old_data: deletedCustomer,
      });
      toast.success('Client supprimé avec succès');
    },
    onError: (error) => {
      console.error('Error deleting customer:', error);
      toast.error('Erreur lors de la suppression du client');
    },
  });

  return {
    customers,
    isLoading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
};
