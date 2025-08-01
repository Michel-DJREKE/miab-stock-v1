
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ExpiryAlert {
  id: string;
  name: string;
  expiry_date: string;
  quantity: number;
  days_until_expiry: number;
  alert_level: 'critical' | 'warning' | 'info';
}

export const useExpiryAlerts = () => {
  const { user } = useAuth();

  const {
    data: alerts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['expiry-alerts'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('id, name, expiry_date, quantity')
        .not('expiry_date', 'is', null)
        .gt('quantity', 0)
        .order('expiry_date', { ascending: true });

      if (error) throw error;

      const today = new Date();
      const alerts: ExpiryAlert[] = [];

      (data || []).forEach(product => {
        if (product.expiry_date) {
          const expiryDate = new Date(product.expiry_date);
          const timeDiff = expiryDate.getTime() - today.getTime();
          const daysUntilExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));

          if (daysUntilExpiry <= 30) {
            let alertLevel: 'critical' | 'warning' | 'info' = 'info';
            
            if (daysUntilExpiry <= 3) {
              alertLevel = 'critical';
            } else if (daysUntilExpiry <= 7) {
              alertLevel = 'warning';
            }

            alerts.push({
              id: product.id,
              name: product.name,
              expiry_date: product.expiry_date,
              quantity: product.quantity,
              days_until_expiry: daysUntilExpiry,
              alert_level: alertLevel,
            });
          }
        }
      });

      return alerts;
    },
    enabled: !!user,
    refetchInterval: 1000 * 60 * 60, // Rafraîchir toutes les heures
  });

  return {
    alerts,
    isLoading,
    error,
  };
};
