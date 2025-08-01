
import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/lib/i18n';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  TrendingUp,
  ShoppingCart, 
  User
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { language } = useApp();
  const { t } = useTranslation(language);
  const location = useLocation();

  const navItems = [
    {
      title: t.nav.home,
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: t.nav.products,
      url: '/products',
      icon: Package,
    },
    {
      title: t.nav.movements,
      url: '/inventory',
      icon: TrendingUp,
    },
    {
      title: t.nav.sales,
      url: '/sales',
      icon: ShoppingCart,
    },
    {
      title: t.nav.profile,
      url: '/profile',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-miabe-black-900 border-t border-border">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.url;
          
          return (
            <NavLink
              key={item.url}
              to={item.url}
              className={`flex flex-col items-center justify-center px-3 py-2 transition-colors ${
                isActive
                  ? 'text-miabe-yellow-500'
                  : 'text-miabe-black-400 hover:text-miabe-black-600 dark:text-miabe-black-400 dark:hover:text-miabe-black-200'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.title}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-miabe-yellow-500 rounded-b-full"></div>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
