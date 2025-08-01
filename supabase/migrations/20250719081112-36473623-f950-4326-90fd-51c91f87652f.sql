
-- Ajouter le champ date de péremption aux produits
ALTER TABLE public.products 
ADD COLUMN expiry_date DATE;

-- Ajouter un index pour optimiser les requêtes de vérification de péremption
CREATE INDEX idx_products_expiry_date ON public.products(expiry_date);

-- Fonction pour générer un code-barres automatique
CREATE OR REPLACE FUNCTION generate_barcode()
RETURNS TEXT AS $$
DECLARE
  new_barcode TEXT;
  counter INTEGER := 1;
BEGIN
  LOOP
    -- Générer un code-barres avec timestamp + compteur
    new_barcode := '2' || LPAD(EXTRACT(epoch FROM NOW())::BIGINT::TEXT, 10, '0') || LPAD(counter::TEXT, 3, '0');
    
    -- Vérifier si le code-barres existe déjà
    IF NOT EXISTS (SELECT 1 FROM products WHERE barcode = new_barcode) THEN
      RETURN new_barcode;
    END IF;
    
    counter := counter + 1;
    IF counter > 999 THEN
      counter := 1;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement le code-barres si non fourni
CREATE OR REPLACE FUNCTION auto_generate_barcode()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.barcode IS NULL OR NEW.barcode = '' THEN
    NEW.barcode := generate_barcode();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_generate_barcode
  BEFORE INSERT ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_barcode();
