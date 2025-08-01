
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ActionHistoryItem {
  id: string;
  user_id: string;
  action_type: 'create' | 'update' | 'delete';
  entity_type: 'product' | 'sale' | 'restocking' | 'customer' | 'supplier' | 'category';
  entity_id: string;
  entity_name: string;
  old_data?: any;
  new_data?: any;
  description?: string;
  created_at: string;
}

export const useActionHistory = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: actionHistory = [], isLoading } = useQuery({
    queryKey: ['action-history'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('action_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const logAction = useMutation({
    mutationFn: async (action: Omit<ActionHistoryItem, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('action_history')
        .insert([{
          ...action,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action-history'] });
    },
    onError: (error) => {
      console.error('Error logging action:', error);
    },
  });

  return {
    actionHistory,
    isLoading,
    logAction,
  };
};
