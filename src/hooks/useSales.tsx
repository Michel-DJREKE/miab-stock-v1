import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Sale {
  id: string;
  sale_number: string;
  customer_id?: string;
  total_amount: number;
  tax_amount?: number;
  discount_amount?: number;
  payment_method?: string;
  status?: string;
  notes?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  customers?: { name: string; phone?: string; email?: string; address?: string } | null;
  sale_items?: SaleItem[];
  itemCount?: number;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  products?: { name: string } | null;
}

export const useSales = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: sales = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching sales...');
      
      // Fetch sales first
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (salesError) {
        console.error('Sales query error:', salesError);
        throw salesError;
      }

      if (!salesData || salesData.length === 0) return [];

      // Fetch customers separately
      const customerIds = salesData.map(s => s.customer_id).filter(Boolean);
      let customersData: any[] = [];
      
      if (customerIds.length > 0) {
        const { data: customers, error: customersError } = await supabase
          .from('customers')
          .select('id, name, phone, email, address')
          .in('id', customerIds);

        if (customersError) {
          console.error('Customers query error:', customersError);
        } else {
          customersData = customers || [];
        }
      }

      // Fetch sale items with products
      const saleIds = salesData.map(s => s.id);
      let itemsData: any[] = [];
      
      if (saleIds.length > 0) {
        const { data: items, error: itemsError } = await supabase
          .from('sale_items')
          .select(`
            *,
            products!sale_items_product_id_fkey (
              name
            )
          `)
          .in('sale_id', saleIds);

        if (itemsError) {
          console.error('Sale items query error:', itemsError);
        } else {
          itemsData = items || [];
        }
      }

      const processedSales = salesData.map(sale => ({
        ...sale,
        customers: customerIds.includes(sale.customer_id) 
          ? customersData.find(c => c.id === sale.customer_id) 
          : null,
        sale_items: itemsData
          .filter(item => item.sale_id === sale.id)
          .map(item => ({
            ...item,
            products: item.products
          })),
        itemCount: itemsData.filter(item => item.sale_id === sale.id).length
      })) as Sale[];

      console.log('Processed sales:', processedSales);
      return processedSales;
    },
    enabled: !!user,
  });

  const createSale = useMutation({
    mutationFn: async (saleData: {
      sale: Omit<Sale, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'customers' | 'sale_items' | 'itemCount'>;
      items: Omit<SaleItem, 'id' | 'sale_id' | 'products'>[];
    }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating sale:', saleData);

      if (!saleData.items || saleData.items.length === 0) {
        throw new Error('Au moins un article est requis');
      }

      const saleToInsert = {
        ...saleData.sale,
        user_id: user.id,
      };

      console.log('Inserting sale:', saleToInsert);

      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert(saleToInsert)
        .select()
        .single();

      if (saleError) {
        console.error('Sale insert error:', saleError);
        throw saleError;
      }

      console.log('Sale created:', sale);

      const saleItems = saleData.items.map(item => ({
        sale_id: sale.id,
        product_id: item.product_id,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        total_price: Number(item.total_price),
      }));

      console.log('Inserting sale items:', saleItems);

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) {
        console.error('Sale items insert error:', itemsError);
        await supabase.from('sales').delete().eq('id', sale.id);
        throw itemsError;
      }

      for (const item of saleItems) {
        try {
          const { error: updateError } = await supabase.rpc('update_product_quantity', {
            product_id: item.product_id,
            quantity_change: -item.quantity
          });
          
          if (updateError) {
            console.error('Error updating product quantity:', updateError);
          }
        } catch (error) {
          console.error('Error in product quantity update:', error);
        }
      }

      // Return the complete sale with related data
      const { data: completeSale, error: fetchError } = await supabase
        .from('sales')
        .select('*')
        .eq('id', sale.id)
        .single();

      if (fetchError) {
        console.error('Error fetching complete sale:', fetchError);
        return sale;
      }

      // Fetch customer data if exists
      let customerData = null;
      if (completeSale.customer_id) {
        const { data: customer } = await supabase
          .from('customers')
          .select('id, name, phone, email, address')
          .eq('id', completeSale.customer_id)
          .single();
        customerData = customer;
      }

      // Fetch sale items with products
      const { data: saleItemsComplete } = await supabase
        .from('sale_items')
        .select(`
          *,
          products!sale_items_product_id_fkey (
            name
          )
        `)
        .eq('sale_id', sale.id);

      return {
        ...completeSale,
        customers: customerData,
        sale_items: (saleItemsComplete || []).map(item => ({
          ...item,
          products: item.products
        }))
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Vente créée avec succès');
    },
    onError: (error) => {
      console.error('Create sale error:', error);
      toast.error(`Erreur lors de la création: ${error.message}`);
    },
  });

  const getSaleById = async (id: string) => {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Fetch customer data if exists
    let customerData = null;
    if (data.customer_id) {
      const { data: customer } = await supabase
        .from('customers')
        .select('id, name, phone, email, address')
        .eq('id', data.customer_id)
        .single();
      customerData = customer;
    }

    const { data: saleItems, error: itemsError } = await supabase
      .from('sale_items')
      .select(`
        *,
        products!sale_items_product_id_fkey (
          name
        )
      `)
      .eq('sale_id', id);

    if (itemsError) throw itemsError;
    
    return {
      ...data,
      customers: customerData,
      sale_items: (saleItems || []).map(item => ({
        ...item,
        products: item.products
      }))
    };
  };

  return {
    sales,
    isLoading,
    error,
    createSale,
    getSaleById,
  };
};
