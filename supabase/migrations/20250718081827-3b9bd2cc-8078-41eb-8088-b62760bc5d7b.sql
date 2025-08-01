
-- Créer une fonction pour mettre à jour la quantité des produits
CREATE OR REPLACE FUNCTION public.update_product_quantity(
  product_id UUID,
  quantity_change INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.products 
  SET quantity = quantity + quantity_change,
      updated_at = timezone('utc'::text, now())
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Accorder les permissions nécessaires
GRANT EXECUTE ON FUNCTION public.update_product_quantity(UUID, INTEGER) TO authenticated;
