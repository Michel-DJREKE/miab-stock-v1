
-- Créer une table pour l'historique des actions
CREATE TABLE public.action_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'create', 'update', 'delete'
  entity_type TEXT NOT NULL, -- 'product', 'sale', 'restocking', 'customer', 'supplier', 'category'
  entity_id UUID NOT NULL,
  entity_name TEXT,
  old_data JSONB,
  new_data JSONB,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.action_history ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour l'historique des actions
CREATE POLICY "Users can view their own action history" 
  ON public.action_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own action history" 
  ON public.action_history 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Ajouter un champ status aux fournisseurs s'il n'existe pas
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_action_history_user_id ON public.action_history(user_id);
CREATE INDEX IF NOT EXISTS idx_action_history_entity_type ON public.action_history(entity_type);
CREATE INDEX IF NOT EXISTS idx_action_history_created_at ON public.action_history(created_at);
