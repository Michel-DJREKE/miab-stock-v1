
-- Créer un enum pour les rôles d'application
CREATE TYPE app_role AS ENUM ('admin', 'manager', 'accountant', 'sales');

-- Créer la table des boutiques
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Créer la table des rôles utilisateur par boutique
CREATE TABLE user_shop_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, shop_id)
);

-- Créer la table des permissions
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Créer la table de liaison rôle-permissions
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Créer la table des invitations utilisateur
CREATE TABLE user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role app_role NOT NULL,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_shop_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour shops
CREATE POLICY "Shop owners can manage their shops" ON shops
FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Users can view shops they belong to" ON shops
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_shop_roles 
    WHERE user_id = auth.uid() AND shop_id = shops.id
  )
);

-- Politiques RLS pour user_shop_roles
CREATE POLICY "Users can view roles in their shops" ON user_shop_roles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_shop_roles usr
    WHERE usr.user_id = auth.uid() AND usr.shop_id = user_shop_roles.shop_id
  )
);

CREATE POLICY "Admins and managers can manage user roles" ON user_shop_roles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_shop_roles usr
    WHERE usr.user_id = auth.uid() 
    AND usr.shop_id = user_shop_roles.shop_id 
    AND usr.role IN ('admin', 'manager')
  )
);

-- Politiques RLS pour permissions
CREATE POLICY "Authenticated users can view permissions" ON permissions
FOR SELECT TO authenticated USING (true);

-- Politiques RLS pour role_permissions
CREATE POLICY "Authenticated users can view role permissions" ON role_permissions
FOR SELECT TO authenticated USING (true);

-- Politiques RLS pour user_invitations
CREATE POLICY "Shop admins can manage invitations" ON user_invitations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_shop_roles usr
    WHERE usr.user_id = auth.uid() 
    AND usr.shop_id = user_invitations.shop_id 
    AND usr.role IN ('admin', 'manager')
  )
);

CREATE POLICY "Admins and managers can view shop invitations" ON user_invitations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_shop_roles usr
    WHERE usr.user_id = auth.uid() 
    AND usr.shop_id = user_invitations.shop_id 
    AND usr.role IN ('admin', 'manager')
  )
);

CREATE POLICY "Admins and managers can create invitations" ON user_invitations
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_shop_roles usr
    WHERE usr.user_id = auth.uid() 
    AND usr.shop_id = user_invitations.shop_id 
    AND usr.role IN ('admin', 'manager')
  )
);

CREATE POLICY "Admins and managers can update invitations" ON user_invitations
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_shop_roles usr
    WHERE usr.user_id = auth.uid() 
    AND usr.shop_id = user_invitations.shop_id 
    AND usr.role IN ('admin', 'manager')
  )
);

CREATE POLICY "Admins and managers can delete invitations" ON user_invitations
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM user_shop_roles usr
    WHERE usr.user_id = auth.uid() 
    AND usr.shop_id = user_invitations.shop_id 
    AND usr.role IN ('admin', 'manager')
  )
);

-- Fonction pour créer une boutique par défaut et assigner le rôle admin
CREATE OR REPLACE FUNCTION create_default_shop_and_role()
RETURNS TRIGGER AS $$
DECLARE
    shop_id UUID;
BEGIN
    -- Créer une boutique par défaut
    INSERT INTO public.shops (name, owner_id, description)
    VALUES (
        COALESCE(NEW.raw_user_meta_data->>'shopName', 'Ma Boutique'),
        NEW.id,
        'Boutique créée automatiquement'
    )
    RETURNING id INTO shop_id;
    
    -- Assigner le rôle admin à l'utilisateur
    INSERT INTO public.user_shop_roles (user_id, shop_id, role)
    VALUES (NEW.id, shop_id, 'admin');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement une boutique et un rôle admin
CREATE TRIGGER on_auth_user_created_shop
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION create_default_shop_and_role();

-- Fonction pour obtenir les permissions d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_permissions(user_uuid UUID)
RETURNS TABLE(permission_name TEXT, resource TEXT, action TEXT)
LANGUAGE SQL STABLE SECURITY DEFINER AS $$
    SELECT DISTINCT p.name, p.resource, p.action
    FROM public.permissions p
    JOIN public.role_permissions rp ON p.id = rp.permission_id
    JOIN public.user_shop_roles usr ON usr.role = rp.role
    WHERE usr.user_id = user_uuid;
$$;

-- Fonction pour inviter un utilisateur
CREATE OR REPLACE FUNCTION invite_user(
    p_email TEXT,
    p_first_name TEXT,
    p_last_name TEXT,
    p_role app_role,
    p_shop_id UUID
) RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_invitation_id UUID;
  v_token TEXT;
BEGIN
  -- Vérifier que l'utilisateur qui invite a les permissions
  IF NOT EXISTS (
    SELECT 1 FROM public.user_shop_roles usr
    WHERE usr.user_id = auth.uid()
    AND usr.shop_id = p_shop_id
    AND usr.role IN ('admin', 'manager')
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Permission denied');
  END IF;

  -- Vérifier si l'utilisateur existe déjà
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    RETURN json_build_object('success', false, 'error', 'User already exists');
  END IF;

  -- Créer l'invitation
  INSERT INTO public.user_invitations (
    email, first_name, last_name, role, shop_id, invited_by
  ) VALUES (
    p_email, p_first_name, p_last_name, p_role, p_shop_id, auth.uid()
  ) RETURNING id, token INTO v_invitation_id, v_token;

  RETURN json_build_object(
    'success', true,
    'invitation_id', v_invitation_id,
    'token', v_token
  );
END;
$$;

-- Fonction pour obtenir les utilisateurs d'une boutique
CREATE OR REPLACE FUNCTION get_shop_users_and_invitations(p_shop_id UUID)
RETURNS TABLE(
  id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  role app_role,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Vérifier les permissions
  IF NOT EXISTS (
    SELECT 1 FROM public.user_shop_roles usr
    WHERE usr.user_id = auth.uid()
    AND usr.shop_id = p_shop_id
    AND usr.role IN ('admin', 'manager')
  ) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  -- Retourner les utilisateurs existants
  RETURN QUERY
  SELECT
    usr.user_id as id,
    au.email,
    p.first_name,
    p.last_name,
    usr.role,
    'active'::TEXT as status,
    usr.created_at,
    NULL::TIMESTAMP WITH TIME ZONE as expires_at
  FROM public.user_shop_roles usr
  LEFT JOIN auth.users au ON au.id = usr.user_id
  LEFT JOIN public.profiles p ON p.id = usr.user_id
  WHERE usr.shop_id = p_shop_id

  UNION ALL

  -- Retourner les invitations en attente
  SELECT
    inv.id,
    inv.email,
    inv.first_name,
    inv.last_name,
    inv.role,
    CASE 
      WHEN inv.used THEN 'used'
      WHEN inv.expires_at < now() THEN 'expired'
      ELSE 'pending'
    END::TEXT as status,
    inv.created_at,
    inv.expires_at
  FROM public.user_invitations inv
  WHERE inv.shop_id = p_shop_id;
END;
$$;

-- Insérer les permissions de base
INSERT INTO permissions (name, description, resource, action) VALUES
('dashboard_read', 'Voir le tableau de bord', 'dashboard', 'read'),
('products_read', 'Voir les produits', 'products', 'read'),
('products_write', 'Gérer les produits', 'products', 'write'),
('sales_read', 'Voir les ventes', 'sales', 'read'),
('sales_write', 'Gérer les ventes', 'sales', 'write'),
('inventory_read', 'Voir l''inventaire', 'inventory', 'read'),
('inventory_write', 'Gérer l''inventaire', 'inventory', 'write'),
('restocking_read', 'Voir les réapprovisionnements', 'restocking', 'read'),
('restocking_write', 'Gérer les réapprovisionnements', 'restocking', 'write'),
('analytics_read', 'Voir les analyses', 'analytics', 'read'),
('customers_read', 'Voir les clients', 'customers', 'read'),
('customers_write', 'Gérer les clients', 'customers', 'write'),
('suppliers_read', 'Voir les fournisseurs', 'suppliers', 'read'),
('suppliers_write', 'Gérer les fournisseurs', 'suppliers', 'write'),
('categories_read', 'Voir les catégories', 'categories', 'read'),
('categories_write', 'Gérer les catégories', 'categories', 'write'),
('users_read', 'Voir les utilisateurs', 'users', 'read'),
('users_write', 'Gérer les utilisateurs', 'users', 'write'),
('settings_read', 'Voir les paramètres', 'settings', 'read'),
('settings_write', 'Gérer les paramètres', 'settings', 'write'),
('alerts_read', 'Voir les alertes', 'alerts', 'read'),
('history_read', 'Voir l''historique', 'history', 'read');

-- Assigner les permissions aux rôles
-- Admin - Toutes les permissions
INSERT INTO role_permissions (role, permission_id)
SELECT 'admin'::app_role, id FROM permissions;

-- Manager - Toutes sauf gestion des utilisateurs
INSERT INTO role_permissions (role, permission_id)
SELECT 'manager'::app_role, id FROM permissions 
WHERE name NOT IN ('users_write', 'settings_write');

-- Accountant - Lecture seule pour analyses
INSERT INTO role_permissions (role, permission_id)
SELECT 'accountant'::app_role, id FROM permissions 
WHERE name IN (
  'dashboard_read', 'products_read', 'sales_read', 'inventory_read',
  'analytics_read', 'customers_read', 'suppliers_read'
);

-- Sales - Gestion des ventes et produits
INSERT INTO role_permissions (role, permission_id)
SELECT 'sales'::app_role, id FROM permissions 
WHERE name IN (
  'dashboard_read', 'products_read', 'products_write', 
  'sales_read', 'sales_write', 'categories_read', 'customers_read', 'customers_write'
);
