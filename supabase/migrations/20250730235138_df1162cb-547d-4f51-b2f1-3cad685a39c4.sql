
-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'accountant', 'sales');

-- Create shops/boutiques table
CREATE TABLE public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user roles table (linking users to shops with specific roles)
CREATE TABLE public.user_shop_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, shop_id)
);

-- Create permissions table
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  resource TEXT NOT NULL, -- 'products', 'sales', 'inventory', etc.
  action TEXT NOT NULL, -- 'read', 'write', 'delete'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create role permissions table
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role, permission_id)
);

-- Update profiles table to include shop relationship
ALTER TABLE public.profiles ADD COLUMN current_shop_id UUID REFERENCES public.shops(id);

-- Enable RLS on all new tables
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_shop_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for shops
CREATE POLICY "Users can view shops they belong to" ON public.shops
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_shop_roles 
      WHERE user_id = auth.uid() AND shop_id = shops.id
    ) OR owner_id = auth.uid()
  );

CREATE POLICY "Shop owners can manage their shops" ON public.shops
  FOR ALL USING (owner_id = auth.uid());

-- Create RLS policies for user_shop_roles
CREATE POLICY "Users can view their shop roles" ON public.user_shop_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins and managers can manage user roles in their shops" ON public.user_shop_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_shop_roles usr 
      WHERE usr.user_id = auth.uid() 
        AND usr.shop_id = user_shop_roles.shop_id 
        AND usr.role IN ('admin', 'manager')
    )
  );

-- Create RLS policies for permissions (read-only for most users)
CREATE POLICY "All authenticated users can view permissions" ON public.permissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can manage permissions" ON public.permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_shop_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for role_permissions
CREATE POLICY "All authenticated users can view role permissions" ON public.role_permissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can manage role permissions" ON public.role_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_shop_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create helper functions
CREATE OR REPLACE FUNCTION public.get_user_role_in_shop(user_id UUID, shop_id UUID)
RETURNS public.app_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.user_shop_roles 
  WHERE user_shop_roles.user_id = $1 AND user_shop_roles.shop_id = $2;
$$;

CREATE OR REPLACE FUNCTION public.user_has_permission(user_id UUID, shop_id UUID, resource TEXT, action TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_shop_roles usr
    JOIN public.role_permissions rp ON rp.role = usr.role
    JOIN public.permissions p ON p.id = rp.permission_id
    WHERE usr.user_id = $1 
      AND usr.shop_id = $2 
      AND p.resource = $3 
      AND p.action = $4
  );
$$;

-- Insert default permissions
INSERT INTO public.permissions (name, description, resource, action) VALUES
-- Products permissions
('view_products', 'Voir les produits', 'products', 'read'),
('create_products', 'Créer des produits', 'products', 'write'),
('edit_products', 'Modifier des produits', 'products', 'write'),
('delete_products', 'Supprimer des produits', 'products', 'delete'),

-- Sales permissions
('view_sales', 'Voir les ventes', 'sales', 'read'),
('create_sales', 'Créer des ventes', 'sales', 'write'),
('edit_sales', 'Modifier des ventes', 'sales', 'write'),
('delete_sales', 'Supprimer des ventes', 'sales', 'delete'),

-- Categories permissions
('view_categories', 'Voir les catégories', 'categories', 'read'),
('create_categories', 'Créer des catégories', 'categories', 'write'),
('edit_categories', 'Modifier des catégories', 'categories', 'write'),
('delete_categories', 'Supprimer des catégories', 'categories', 'delete'),

-- Customers permissions
('view_customers', 'Voir les clients', 'customers', 'read'),
('create_customers', 'Créer des clients', 'customers', 'write'),
('edit_customers', 'Modifier des clients', 'customers', 'write'),
('delete_customers', 'Supprimer des clients', 'customers', 'delete'),

-- Suppliers permissions
('view_suppliers', 'Voir les fournisseurs', 'suppliers', 'read'),
('create_suppliers', 'Créer des fournisseurs', 'suppliers', 'write'),
('edit_suppliers', 'Modifier des fournisseurs', 'suppliers', 'write'),
('delete_suppliers', 'Supprimer des fournisseurs', 'suppliers', 'delete'),

-- Inventory permissions
('view_inventory', 'Voir l\'inventaire', 'inventory', 'read'),
('manage_inventory', 'Gérer l\'inventaire', 'inventory', 'write'),

-- Restocking permissions
('view_restocking', 'Voir les réapprovisionnements', 'restocking', 'read'),
('create_restocking', 'Créer des réapprovisionnements', 'restocking', 'write'),
('edit_restocking', 'Modifier des réapprovisionnements', 'restocking', 'write'),
('delete_restocking', 'Supprimer des réapprovisionnements', 'restocking', 'delete'),

-- Analytics permissions
('view_analytics', 'Voir les analyses', 'analytics', 'read'),
('view_reports', 'Voir les rapports', 'reports', 'read'),

-- User management permissions
('view_users', 'Voir les utilisateurs', 'users', 'read'),
('create_users', 'Créer des utilisateurs', 'users', 'write'),
('edit_users', 'Modifier des utilisateurs', 'users', 'write'),
('delete_users', 'Supprimer des utilisateurs', 'users', 'delete'),

-- Settings permissions
('view_settings', 'Voir les paramètres', 'settings', 'read'),
('edit_settings', 'Modifier les paramètres', 'settings', 'write');

-- Define role permissions
-- Sales role permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'sales', id FROM public.permissions 
WHERE name IN (
  'view_products', 'create_products', 'edit_products',
  'view_sales', 'create_sales',
  'view_categories', 
  'view_customers', 'create_customers', 'edit_customers'
);

-- Manager role permissions  
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'manager', id FROM public.permissions 
WHERE name IN (
  'view_products', 'create_products', 'edit_products', 'delete_products',
  'view_sales', 'create_sales', 'edit_sales',
  'view_categories', 'create_categories', 'edit_categories',
  'view_customers', 'create_customers', 'edit_customers', 'delete_customers',
  'view_suppliers', 'create_suppliers', 'edit_suppliers', 'delete_suppliers',
  'view_inventory', 'manage_inventory',
  'view_restocking', 'create_restocking', 'edit_restocking', 'delete_restocking',
  'view_analytics', 'view_reports'
);

-- Accountant role permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'accountant', id FROM public.permissions 
WHERE name IN (
  'view_products', 'view_sales', 'view_categories', 'view_customers',
  'view_suppliers', 'view_inventory', 'view_restocking',
  'view_analytics', 'view_reports'
);

-- Admin role permissions (all permissions)
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin', id FROM public.permissions;

-- Update existing tables to include shop_id where needed
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id);
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id);
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id);
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id);
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id);
ALTER TABLE public.restockings ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id);
ALTER TABLE public.action_history ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shops_updated_at BEFORE UPDATE ON public.shops
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER user_shop_roles_updated_at BEFORE UPDATE ON public.user_shop_roles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
