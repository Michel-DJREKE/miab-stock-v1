
import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/lib/i18n';
import { useLocation, NavLink, useNavigate } from 'react-router-dom';
import { useRoles } from '@/hooks/useRoles';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Truck,
  Tags,
  Settings,
  BarChart3,
  Package2,
  Bell,
  History,
  RefreshCcw,
  LogOut,
  UserCog
} from 'lucide-react';
import { toast } from 'sonner';

export const AppSidebar: React.FC = () => {
  const { language, logout } = useApp();
  const { t } = useTranslation(language);
  const { currentUserRole, userShop } = useRoles();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Déconnexion réussie');
    navigate('/');
  };

  const navigationItems = [
    {
      title: t.nav.dashboard,
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: t.nav.products,
      url: '/products',
      icon: Package,
    },
    {
      title: t.nav.inventory,
      url: '/inventory',
      icon: Package2,
    },
    {
      title: t.nav.sales,
      url: '/sales',
      icon: ShoppingCart,
    },
    {
      title: 'Réapprovisionnement',
      url: '/restocking',
      icon: RefreshCcw,
    },
    {
      title: 'Analytics',
      url: '/analytics',
      icon: BarChart3,
    },
  ];

  const managementItems = [
    {
      title: t.nav.customers,
      url: '/customers',
      icon: Users,
    },
    {
      title: t.nav.suppliers,
      url: '/suppliers',
      icon: Truck,
    },
    {
      title: t.nav.categories,
      url: '/categories',
      icon: Tags,
    },
  ];

  const systemItems = [
    {
      title: 'Alertes',
      url: '/alerts',
      icon: Bell,
      badge: 3
    },
    {
      title: 'Historique',
      url: '/history',
      icon: History,
    },
  ];

  const adminItems = [
    {
      title: 'Gestion des utilisateurs',
      url: '/users',
      icon: UserCog,
    },
  ];

  // POUR LE MOMENT, tous les éléments sont visibles
  const filteredNavigationItems = navigationItems;
  const filteredManagementItems = managementItems;
  const filteredSystemItems = systemItems;
  const filteredAdminItems = adminItems;

  return (
    <Sidebar className="border-r border-border bg-card">
      <SidebarContent className="bg-card">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 miabe-gradient rounded-lg flex items-center justify-center shadow-lg">
              <Package className="w-5 h-5 text-miabe-black-900" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground">
                {userShop?.shop.name || 'Miabé Stock'}
              </h1>
              <p className="text-xs text-muted-foreground">
                {currentUserRole?.role === 'admin' && userShop?.shop.owner_id === currentUserRole.user_id 
                  ? 'Propriétaire' 
                  : currentUserRole?.role === 'admin' 
                    ? 'Administrateur'
                    : currentUserRole?.role === 'manager'
                      ? 'Gérant'
                      : currentUserRole?.role === 'accountant'
                        ? 'Comptable'
                        : 'Commercial'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground px-4 py-2 text-xs font-medium uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {filteredNavigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                          isActive
                            ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                            : 'text-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-sm'
                        }`
                      }
                    >
                      <item.icon className="w-4 h-4 transition-colors" />
                      <span className="font-medium text-sm">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground px-4 py-2 text-xs font-medium uppercase tracking-wider">
            Gestion
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {filteredManagementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                          isActive
                            ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                            : 'text-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-sm'
                        }`
                      }
                    >
                      <item.icon className="w-4 h-4 transition-colors" />
                      <span className="font-medium text-sm">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Administration Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground px-4 py-2 text-xs font-medium uppercase tracking-wider">
            Administration
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {filteredAdminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                          isActive
                            ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                            : 'text-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-sm'
                        }`
                      }
                    >
                      <item.icon className="w-4 h-4 transition-colors" />
                      <span className="font-medium text-sm">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground px-4 py-2 text-xs font-medium uppercase tracking-wider">
            Système
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {filteredSystemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group ${
                          isActive
                            ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                            : 'text-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-sm'
                        }`
                      }
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="w-4 h-4 transition-colors" />
                        <span className="font-medium text-sm">{item.title}</span>
                      </div>
                      {item.badge && (
                        <span className="bg-destructive text-destructive-foreground text-xs rounded-full px-2 py-0.5 min-w-5 text-center font-medium shadow-sm">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with Settings and Logout */}
      <SidebarFooter className="p-2 border-t border-border bg-card">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === '/settings'}>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 mb-2 group ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-sm'
                  }`
                }
              >
                <Settings className="w-4 h-4 transition-colors" />
                <span className="font-medium text-sm">{t.nav.settings}</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:shadow-sm"
            >
              <LogOut className="w-4 h-4 mr-3 transition-colors" />
              <span className="font-medium text-sm">Déconnexion</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
