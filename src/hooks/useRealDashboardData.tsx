
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { startOfDay, endOfDay, format, subDays } from 'date-fns';

export const useRealDashboardData = () => {
  const { user } = useAuth();

  // Récupérer les données de paiement réelles
  const { data: paymentMethodsData } = useQuery({
    queryKey: ['payment-methods-stats', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: sales, error } = await supabase
        .from('sales')
        .select('payment_method, total_amount')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      if (error) throw error;

      // Calculer les statistiques par méthode de paiement
      const paymentStats = new Map();
      let totalAmount = 0;

      sales?.forEach(sale => {
        const method = sale.payment_method || 'cash';
        const amount = sale.total_amount || 0;
        totalAmount += amount;
        
        const existing = paymentStats.get(method) || { count: 0, amount: 0 };
        existing.count += 1;
        existing.amount += amount;
        paymentStats.set(method, existing);
      });

      // Convertir en pourcentages
      const result = Array.from(paymentStats.entries()).map(([method, data]) => ({
        name: method === 'cash' ? 'Espèces' : 
              method === 'mobile_money' ? 'Mobile Money' :
              method === 'card' ? 'Carte' :
              method === 'credit' ? 'Crédit' : method,
        value: totalAmount > 0 ? Math.round((data.amount / totalAmount) * 100) : 0,
        color: method === 'cash' ? '#3b82f6' :
               method === 'mobile_money' ? '#10b981' :
               method === 'card' ? '#f59e0b' : '#ef4444'
      }));

      return result;
    },
    enabled: !!user,
  });

  // Récupérer les données de catégorie réelles
  const { data: categoryData } = useQuery({
    queryKey: ['category-performance', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: saleItems, error } = await supabase
        .from('sale_items')
        .select(`
          quantity,
          total_price,
          products!sale_items_product_id_fkey (
            name,
            categories!products_category_id_fkey (
              name
            )
          ),
          sales!sale_items_sale_id_fkey (
            status,
            user_id
          )
        `);

      if (error) throw error;

      // Filtrer par utilisateur et statut
      const userSaleItems = saleItems?.filter(item => 
        item.sales?.user_id === user.id && item.sales?.status === 'completed'
      ) || [];

      // Grouper par catégorie
      const categoryStats = new Map();
      
      userSaleItems.forEach(item => {
        const categoryName = item.products?.categories?.name || 'Sans catégorie';
        const existing = categoryStats.get(categoryName) || { ventes: 0, revenus: 0 };
        existing.ventes += item.quantity || 0;
        existing.revenus += item.total_price || 0;
        categoryStats.set(categoryName, existing);
      });

      return Array.from(categoryStats.entries())
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.revenus - a.revenus)
        .slice(0, 5);
    },
    enabled: !!user,
  });

  // Récupérer les données horaires réelles
  const { data: hourlyData } = useQuery({
    queryKey: ['hourly-sales', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const today = new Date();
      const { data: sales, error } = await supabase
        .from('sales')
        .select('created_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('created_at', startOfDay(today).toISOString())
        .lte('created_at', endOfDay(today).toISOString());

      if (error) throw error;

      // Grouper par heure
      const hourlyStats = new Map();
      
      // Initialiser toutes les heures à 0
      for (let hour = 8; hour <= 19; hour++) {
        hourlyStats.set(hour, 0);
      }

      sales?.forEach(sale => {
        const hour = new Date(sale.created_at).getHours();
        if (hour >= 8 && hour <= 19) {
          hourlyStats.set(hour, (hourlyStats.get(hour) || 0) + 1);
        }
      });

      return Array.from(hourlyStats.entries()).map(([hour, ventes]) => ({
        hour: `${hour}h`,
        ventes
      }));
    },
    enabled: !!user,
  });

  // Récupérer les données de produits expirés réelles
  const { data: expiryAlerts } = useQuery({
    queryKey: ['expiry-alerts', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      const { data: products, error } = await supabase
        .from('products')
        .select('id')
        .eq('user_id', user.id)
        .not('expiry_date', 'is', null)
        .lte('expiry_date', sevenDaysFromNow.toISOString().split('T')[0]);

      if (error) throw error;

      return products?.length || 0;
    },
    enabled: !!user,
  });

  return {
    paymentMethodsData: paymentMethodsData || [],
    categoryData: categoryData || [],
    hourlyData: hourlyData || [],
    expiryAlertsCount: expiryAlerts || 0
  };
};
