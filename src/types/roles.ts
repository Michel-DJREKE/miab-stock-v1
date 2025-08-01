
export type AppRole = 'admin' | 'manager' | 'accountant' | 'sales';

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface UserShopRole {
  id: string;
  user_id: string;
  shop_id: string;
  role: AppRole;
  created_at: string;
  user_email?: string;
  user_name?: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

export interface Shop {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}
