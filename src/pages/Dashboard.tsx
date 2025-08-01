
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  Plus,
  Download,
  RefreshCw,
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import { useDashboardStats, DateFilter } from '@/hooks/useDashboardStats';
import { useRealDashboardData } from '@/hooks/useRealDashboardData';
import { DashboardKPICard } from '@/components/dashboard/DashboardKPICard';
import { DashboardChart } from '@/components/dashboard/DashboardChart';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { TopProductsList } from '@/components/dashboard/TopProductsList';
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed';
import { PeriodSelector } from '@/components/dashboard/PeriodSelector';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [dateFilter, setDateFilter] = useState<DateFilter>({ period: 'month' });
  
  const { dashboardStats, isLoading, refetch } = useDashboardStats(dateFilter);
  const { expiryAlertsCount } = useRealDashboardData();

  const handlePeriodChange = (period: DateFilter['period']) => {
    setDateFilter({ period });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  const getPeriodLabel = () => {
    switch (dateFilter.period) {
      case 'today': return "Aujourd'hui";
      case 'week': return 'Cette semaine';
      case 'month': return 'Ce mois';
      case 'quarter': return 'Ce trimestre';
      case 'year': return 'Cette année';
      case 'last7days': return '7 derniers jours';
      case 'last30days': return '30 derniers jours';
      case 'last90days': return '90 derniers jours';
      default: return 'Période sélectionnée';
    }
  };

  const alerts = [
    {
      id: '1',
      type: 'stock' as const,
      title: 'Stock faible',
      description: `${dashboardStats?.lowStockProducts || 0} produits ont un stock inférieur au seuil`,
      count: dashboardStats?.lowStockProducts || 0,
      severity: 'medium' as const
    },
    {
      id: '2',
      type: 'expiry' as const,
      title: 'Produits à échéance',
      description: `${expiryAlertsCount} produits expirent dans 7 jours`,
      count: expiryAlertsCount,
      severity: 'high' as const
    },
  ].filter(alert => alert.count > 0);

  const recentActivities = dashboardStats?.recentSales?.map((sale, index) => ({
    id: sale.id,
    type: 'sale' as const,
    title: `Vente #${sale.sale_number}`,
    description: `Paiement par ${sale.payment_method === 'cash' ? 'espèces' : 
                                 sale.payment_method === 'mobile_money' ? 'mobile money' :
                                 sale.payment_method === 'card' ? 'carte' :
                                 sale.payment_method === 'credit' ? 'crédit' : sale.payment_method}`,
    time: new Date(sale.created_at).toLocaleString('fr-FR'),
    amount: sale.total_amount,
    status: sale.status === 'completed' ? 'Terminé' : 'En cours'
  })) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
              <p className="text-muted-foreground">
                Vue d'ensemble de votre activité pour {getPeriodLabel().toLowerCase()}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
              
              <PeriodSelector 
                currentPeriod={dateFilter.period}
                onPeriodChange={handlePeriodChange}
              />

              <Button size="sm">
                <Download className="w-4 h-4 mr-2" />
                Rapport
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Link to="/sales/new">
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle vente
            </Button>
          </Link>
          <Link to="/products">
            <Button size="sm" variant="outline">
              <Package className="w-4 h-4 mr-2" />
              Ajouter produit
            </Button>
          </Link>
          <Link to="/restocking">
            <Button size="sm" variant="outline">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Réapprovisionner
            </Button>
          </Link>
          <Link to="/customers">
            <Button size="sm" variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Nouveau client
            </Button>
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardKPICard
            title="Ventes totales"
            value={formatNumber(dashboardStats?.totalSales || 0)}
            change={12.5}
            changeLabel="vs période précédente"
            icon={<ShoppingCart className="w-5 h-5" />}
            color="blue"
          />
          <DashboardKPICard
            title="Chiffre d'affaires"
            value={formatCurrency(dashboardStats?.totalRevenue || 0)}
            change={8.2}
            changeLabel="vs période précédente"
            icon={<DollarSign className="w-5 h-5" />}
            color="green"
          />
          <DashboardKPICard
            title="Produits"
            value={formatNumber(dashboardStats?.totalProducts || 0)}
            change={5.1}
            changeLabel="nouveaux produits"
            icon={<Package className="w-5 h-5" />}
            color="purple"
          />
          <DashboardKPICard
            title="Clients"
            value={formatNumber(dashboardStats?.totalCustomers || 0)}
            change={3.4}
            changeLabel="nouveaux clients"
            icon={<Users className="w-5 h-5" />}
            color="orange"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts Column */}
          <div className="lg:col-span-2 space-y-6">
            <DashboardChart
              title="Évolution des ventes"
              data={dashboardStats?.salesTrend || []}
              type="area"
              dataKeys={['sales', 'revenue']}
              colors={['hsl(var(--primary))', 'hsl(var(--chart-2))']}
              height={350}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TopProductsList products={dashboardStats?.topProducts || []} />
              <RecentActivityFeed activities={recentActivities} />
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Alerts */}
            {alerts.length > 0 && <AlertsPanel alerts={alerts} />}
            
            {/* Quick Stats */}
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="font-semibold mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Statistiques rapides
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Aujourd'hui</span>
                  <div className="text-right">
                    <div className="font-medium">{formatNumber(dashboardStats?.todaysSales || 0)} ventes</div>
                    <div className="text-xs text-muted-foreground">{formatCurrency(dashboardStats?.todaysRevenue || 0)}</div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cette semaine</span>
                  <div className="text-right">
                    <div className="font-medium">{formatNumber(dashboardStats?.weekSales || 0)} ventes</div>
                    <div className="text-xs text-muted-foreground">{formatCurrency(dashboardStats?.weekRevenue || 0)}</div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Ce mois</span>
                  <div className="text-right">
                    <div className="font-medium">{formatNumber(dashboardStats?.monthSales || 0)} ventes</div>
                    <div className="text-xs text-muted-foreground">{formatCurrency(dashboardStats?.monthRevenue || 0)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stock Alerts */}
            {(dashboardStats?.lowStockProducts || 0) > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
                  <div>
                    <p className="font-medium text-amber-800">Stock faible</p>
                    <p className="text-sm text-amber-600">
                      {dashboardStats.lowStockProducts} produit{dashboardStats.lowStockProducts > 1 ? 's' : ''} nécessite{dashboardStats.lowStockProducts > 1 ? 'nt' : ''} un réapprovisionnement
                    </p>
                    <Link to="/inventory" className="text-sm text-amber-700 underline mt-1 inline-block">
                      Voir les détails
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
