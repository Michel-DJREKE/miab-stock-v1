import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subDays, subMonths } from 'date-fns';

export interface DashboardStats {
  totalProducts: number;
  totalCustomers: number;
  totalSales: number;
  totalRevenue: number;
  lowStockProducts: number;
  todaysSales: number;
  todaysRevenue: number;
  weekSales: number;
  weekRevenue: number;
  monthSales: number;
  monthRevenue: number;
  recentSales: any[];
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  salesTrend: Array<{ date: string; sales: number; revenue: number }>;
}

export interface DateFilter {
  period: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'last7days' | 'last30days' | 'last90days' | 'custom';
  startDate?: Date;
  endDate?: Date;
}

export const useDashboardStats = (dateFilter: DateFilter = { period: 'month' }) => {
  const { user } = useAuth();

  const getDateRange = () => {
    const now = new Date();
    
    switch (dateFilter.period) {
      case 'today':
        return { startDate: startOfDay(now), endDate: endOfDay(now) };
      case 'week':
        return { startDate: startOfWeek(now, { weekStartsOn: 1 }), endDate: endOfWeek(now, { weekStartsOn: 1 }) };
      case 'month':
        return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
      case 'quarter':
        return { startDate: startOfQuarter(now), endDate: endOfQuarter(now) };
      case 'year':
        return { startDate: startOfYear(now), endDate: endOfYear(now) };
      case 'last7days':
        return { startDate: subDays(now, 6), endDate: endOfDay(now) };
      case 'last30days':
        return { startDate: subDays(now, 29), endDate: endOfDay(now) };
      case 'last90days':
        return { startDate: subDays(now, 89), endDate: endOfDay(now) };
      case 'custom':
        return {
          startDate: dateFilter.startDate || startOfMonth(now),
          endDate: dateFilter.endDate || endOfMonth(now)
        };
      default:
        return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
    }
  };

  const {
    data: dashboardStats,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['dashboard-stats', dateFilter],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user) throw new Error('User not authenticated');

      const { startDate, endDate } = getDateRange();
      const today = new Date();

      // Fetch products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) throw productsError;

      // Fetch customers
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('*');

      if (customersError) throw customersError;

      // Fetch sales for the selected period
      const { data: periodSales, error: periodSalesError } = await supabase
        .from('sales')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .eq('status', 'completed');

      if (periodSalesError) throw periodSalesError;

      // Fetch today's sales
      const { data: todaysSalesData, error: todaysSalesError } = await supabase
        .from('sales')
        .select('*')
        .gte('created_at', startOfDay(today).toISOString())
        .lte('created_at', endOfDay(today).toISOString())
        .eq('status', 'completed');

      if (todaysSalesError) throw todaysSalesError;

      // Fetch this week's sales
      const { data: weekSalesData, error: weekSalesError } = await supabase
        .from('sales')
        .select('*')
        .gte('created_at', startOfWeek(today, { weekStartsOn: 1 }).toISOString())
        .lte('created_at', endOfWeek(today, { weekStartsOn: 1 }).toISOString())
        .eq('status', 'completed');

      if (weekSalesError) throw weekSalesError;

      // Fetch this month's sales
      const { data: monthSalesData, error: monthSalesError } = await supabase
        .from('sales')
        .select('*')
        .gte('created_at', startOfMonth(today).toISOString())
        .lte('created_at', endOfMonth(today).toISOString())
        .eq('status', 'completed');

      if (monthSalesError) throw monthSalesError;

      // Fetch recent sales (last 5)
      const { data: recentSales, error: recentSalesError } = await supabase
        .from('sales')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentSalesError) throw recentSalesError;

      // Fetch sale items for top products
      const salesIds = periodSales?.map(sale => sale.id) || [];
      let saleItems: any[] = [];
      
      if (salesIds.length > 0) {
        const { data: saleItemsData, error: saleItemsError } = await supabase
          .from('sale_items')
          .select(`
            *,
            products!sale_items_product_id_fkey (
              name
            )
          `)
          .in('sale_id', salesIds);

        if (saleItemsError) throw saleItemsError;
        saleItems = saleItemsData || [];
      }

      // Calculate stats
      const totalProducts = products?.length || 0;
      const totalCustomers = customers?.length || 0;
      const totalSales = periodSales?.length || 0;
      const totalRevenue = periodSales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;
      const lowStockProducts = products?.filter(p => p.quantity <= (p.min_quantity || 5)).length || 0;

      const todaysSales = todaysSalesData?.length || 0;
      const todaysRevenue = todaysSalesData?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;

      const weekSales = weekSalesData?.length || 0;
      const weekRevenue = weekSalesData?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;

      const monthSales = monthSalesData?.length || 0;
      const monthRevenue = monthSalesData?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;

      // Calculate top products
      const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
      saleItems.forEach(item => {
        const productName = item.products?.name || 'Produit inconnu';
        const existing = productSales.get(productName) || { name: productName, quantity: 0, revenue: 0 };
        existing.quantity += item.quantity || 0;
        existing.revenue += item.total_price || 0;
        productSales.set(productName, existing);
      });

      const topProducts = Array.from(productSales.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      // Calculate sales trend (based on period)
      const salesTrend = [];
      const days = dateFilter.period === 'last7days' ? 7 : 
                  dateFilter.period === 'last30days' ? 30 : 
                  dateFilter.period === 'last90days' ? 90 : 7;
      
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);
        
        const daySales = periodSales?.filter(sale => {
          const saleDate = new Date(sale.created_at);
          return saleDate >= dayStart && saleDate <= dayEnd;
        }) || [];

        salesTrend.push({
          date: date.toISOString().split('T')[0],
          sales: daySales.length,
          revenue: daySales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0)
        });
      }

      return {
        totalProducts,
        totalCustomers,
        totalSales,
        totalRevenue,
        lowStockProducts,
        todaysSales,
        todaysRevenue,
        weekSales,
        weekRevenue,
        monthSales,
        monthRevenue,
        recentSales: recentSales || [],
        topProducts,
        salesTrend,
      };
    },
    enabled: !!user,
  });

  return {
    dashboardStats,
    isLoading,
    error,
    refetch,
  };
};
