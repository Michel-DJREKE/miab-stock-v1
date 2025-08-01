
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subWeeks, subMonths, subYears } from 'date-fns';

export interface AnalyticsData {
  totalSales: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockProducts: number;
  topSellingProducts: Array<{ name: string; quantity: number; revenue: number }>;
  salesByDate: Array<{ date: string; sales: number; revenue: number }>;
  salesByPaymentMethod: Array<{ method: string; count: number; amount: number }>;
  revenueByCategory: Array<{ category: string; revenue: number }>;
  monthlyComparison: Array<{ month: string; sales: number; revenue: number }>;
  dailyStats: Array<{ day: string; sales: number; revenue: number }>;
  topCustomers: Array<{ name: string; totalSpent: number; totalOrders: number }>;
  averageOrderValue: number;
  totalProfit: number;
  profitMargin: number;
}

export interface DateFilter {
  startDate: Date;
  endDate: Date;
  period: 'day' | 'week' | 'month' | 'year' | 'custom';
}

export const useAnalytics = (dateFilter: DateFilter) => {
  const { user } = useAuth();

  const {
    data: analyticsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['analytics', dateFilter],
    queryFn: async (): Promise<AnalyticsData> => {
      if (!user) throw new Error('User not authenticated');

      const { startDate, endDate } = dateFilter;

      // Fetch sales data with proper column specification
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .eq('status', 'completed');

      if (salesError) throw salesError;

      // Fetch sale items with products separately
      const salesIds = salesData?.map(sale => sale.id) || [];
      let saleItemsData: any[] = [];
      
      if (salesIds.length > 0) {
        const { data: itemsData, error: itemsError } = await supabase
          .from('sale_items')
          .select(`
            *,
            products!sale_items_product_id_fkey (
              name,
              cost_price,
              categories!products_category_id_fkey (
                name
              )
            )
          `)
          .in('sale_id', salesIds);

        if (itemsError) throw itemsError;
        saleItemsData = itemsData || [];
      }

      // Fetch customers separately
      const customerIds = salesData?.map(sale => sale.customer_id).filter(Boolean) || [];
      let customersData: any[] = [];
      
      if (customerIds.length > 0) {
        const { data: customers, error: customersError } = await supabase
          .from('customers')
          .select('id, name')
          .in('id', customerIds);

        if (customersError) throw customersError;
        customersData = customers || [];
      }

      // Fetch products data
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) throw productsError;

      // Calculate analytics
      const totalSales = salesData?.length || 0;
      const totalRevenue = salesData?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;
      const totalProducts = productsData?.length || 0;
      const lowStockProducts = productsData?.filter(p => p.quantity <= (p.min_quantity || 5)).length || 0;

      // Calculate total cost and profit
      const totalCost = saleItemsData.reduce((sum, item) => {
        const costPrice = item.products?.cost_price || 0;
        return sum + (costPrice * item.quantity);
      }, 0);
      const totalProfit = totalRevenue - totalCost;
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

      // Average order value
      const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

      // Top selling products
      const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
      saleItemsData.forEach(item => {
        const productName = item.products?.name || 'Produit inconnu';
        const existing = productSales.get(productName) || { name: productName, quantity: 0, revenue: 0 };
        existing.quantity += item.quantity;
        existing.revenue += item.total_price;
        productSales.set(productName, existing);
      });

      const topSellingProducts = Array.from(productSales.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);

      // Top customers
      const customerSales = new Map<string, { name: string; totalSpent: number; totalOrders: number }>();
      salesData?.forEach(sale => {
        if (sale.customer_id) {
          const customer = customersData.find(c => c.id === sale.customer_id);
          const customerName = customer?.name || 'Client inconnu';
          const existing = customerSales.get(customerName) || { name: customerName, totalSpent: 0, totalOrders: 0 };
          existing.totalSpent += sale.total_amount || 0;
          existing.totalOrders += 1;
          customerSales.set(customerName, existing);
        }
      });

      const topCustomers = Array.from(customerSales.values())
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10);

      // Sales by date
      const salesByDateMap = new Map<string, { sales: number; revenue: number }>();
      salesData?.forEach(sale => {
        const date = new Date(sale.created_at).toISOString().split('T')[0];
        const existing = salesByDateMap.get(date) || { sales: 0, revenue: 0 };
        existing.sales += 1;
        existing.revenue += sale.total_amount || 0;
        salesByDateMap.set(date, existing);
      });

      const salesByDate = Array.from(salesByDateMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Sales by payment method
      const paymentMethodMap = new Map<string, { count: number; amount: number }>();
      salesData?.forEach(sale => {
        const method = sale.payment_method || 'cash';
        const existing = paymentMethodMap.get(method) || { count: 0, amount: 0 };
        existing.count += 1;
        existing.amount += sale.total_amount || 0;
        paymentMethodMap.set(method, existing);
      });

      const salesByPaymentMethod = Array.from(paymentMethodMap.entries())
        .map(([method, data]) => ({ method, ...data }));

      // Revenue by category
      const categoryMap = new Map<string, number>();
      saleItemsData.forEach(item => {
        const categoryName = item.products?.categories?.name || 'Sans catégorie';
        const revenue = categoryMap.get(categoryName) || 0;
        categoryMap.set(categoryName, revenue + item.total_price);
      });

      const revenueByCategory = Array.from(categoryMap.entries())
        .map(([category, revenue]) => ({ category, revenue }))
        .sort((a, b) => b.revenue - a.revenue);

      // Monthly comparison (last 6 months)
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(new Date(), i));
        const monthEnd = endOfMonth(subMonths(new Date(), i));
        
        const monthSales = salesData?.filter(sale => {
          const saleDate = new Date(sale.created_at);
          return saleDate >= monthStart && saleDate <= monthEnd;
        }) || [];

        monthlyData.push({
          month: monthStart.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
          sales: monthSales.length,
          revenue: monthSales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0)
        });
      }

      // Daily stats (last 7 days)
      const dailyData = [];
      for (let i = 6; i >= 0; i--) {
        const day = subDays(new Date(), i);
        const dayStart = startOfDay(day);
        const dayEnd = endOfDay(day);
        
        const daySales = salesData?.filter(sale => {
          const saleDate = new Date(sale.created_at);
          return saleDate >= dayStart && saleDate <= dayEnd;
        }) || [];

        dailyData.push({
          day: day.toLocaleDateString('fr-FR', { weekday: 'short' }),
          sales: daySales.length,
          revenue: daySales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0)
        });
      }

      return {
        totalSales,
        totalRevenue,
        totalProducts,
        lowStockProducts,
        topSellingProducts,
        salesByDate,
        salesByPaymentMethod,
        revenueByCategory,
        monthlyComparison: monthlyData,
        dailyStats: dailyData,
        topCustomers,
        averageOrderValue,
        totalProfit,
        profitMargin,
      };
    },
    enabled: !!user,
  });

  return {
    analyticsData,
    isLoading,
    error,
    refetch,
  };
};

export const getDateRange = (period: string, customStart?: Date, customEnd?: Date) => {
  const now = new Date();
  
  switch (period) {
    case 'today':
      return { startDate: startOfDay(now), endDate: endOfDay(now) };
    case 'yesterday':
      const yesterday = subDays(now, 1);
      return { startDate: startOfDay(yesterday), endDate: endOfDay(yesterday) };
    case 'week':
      return { startDate: startOfWeek(now, { weekStartsOn: 1 }), endDate: endOfWeek(now, { weekStartsOn: 1 }) };
    case 'last_week':
      const lastWeek = subWeeks(now, 1);
      return { startDate: startOfWeek(lastWeek, { weekStartsOn: 1 }), endDate: endOfWeek(lastWeek, { weekStartsOn: 1 }) };
    case 'month':
      return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
    case 'last_month':
      const lastMonth = subMonths(now, 1);
      return { startDate: startOfMonth(lastMonth), endDate: endOfMonth(lastMonth) };
    case 'year':
      return { startDate: startOfYear(now), endDate: endOfYear(now) };
    case 'last_year':
      const lastYear = subYears(now, 1);
      return { startDate: startOfYear(lastYear), endDate: endOfYear(lastYear) };
    case 'custom':
      return {
        startDate: customStart || startOfMonth(now),
        endDate: customEnd || endOfMonth(now)
      };
    default:
      return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
  }
};
