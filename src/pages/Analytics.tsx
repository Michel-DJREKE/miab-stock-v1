
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  Calendar as CalendarIcon,
  Download,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Users,
  CreditCard,
  Target,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { useAnalytics, getDateRange } from '@/hooks/useAnalytics';
import { toast } from 'sonner';

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  const dateRange = getDateRange(selectedPeriod, customStartDate, customEndDate);
  const { analyticsData, isLoading, refetch } = useAnalytics({
    ...dateRange,
    period: selectedPeriod as any
  });

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    if (value !== 'custom') {
      setShowCustomDatePicker(false);
    } else {
      setShowCustomDatePicker(true);
    }
  };

  const exportData = () => {
    if (!analyticsData) return;
    
    const data = {
      period: selectedPeriod,
      dateRange: `${format(dateRange.startDate, 'dd/MM/yyyy')} - ${format(dateRange.endDate, 'dd/MM/yyyy')}`,
      summary: {
        totalSales: analyticsData.totalSales,
        totalRevenue: analyticsData.totalRevenue,
        totalProducts: analyticsData.totalProducts,
        lowStockProducts: analyticsData.lowStockProducts
      },
      topSellingProducts: analyticsData.topSellingProducts,
      salesByDate: analyticsData.salesByDate,
      salesByPaymentMethod: analyticsData.salesByPaymentMethod,
      revenueByCategory: analyticsData.revenueByCategory
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Données exportées avec succès');
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Chargement des statistiques...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  const revenueChange = analyticsData.monthlyComparison.length >= 2 ? 
    ((analyticsData.monthlyComparison[analyticsData.monthlyComparison.length - 1].revenue - 
      analyticsData.monthlyComparison[analyticsData.monthlyComparison.length - 2].revenue) / 
     analyticsData.monthlyComparison[analyticsData.monthlyComparison.length - 2].revenue) * 100 : 0;

  const salesChange = analyticsData.monthlyComparison.length >= 2 ? 
    ((analyticsData.monthlyComparison[analyticsData.monthlyComparison.length - 1].sales - 
      analyticsData.monthlyComparison[analyticsData.monthlyComparison.length - 2].sales) / 
     analyticsData.monthlyComparison[analyticsData.monthlyComparison.length - 2].sales) * 100 : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Statistiques & Analyses</h1>
          <p className="text-muted-foreground">
            Période: {format(dateRange.startDate, 'dd MMM yyyy')} - {format(dateRange.endDate, 'dd MMM yyyy')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sélectionner une période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="yesterday">Hier</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="last_week">Semaine dernière</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="last_month">Mois dernier</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
              <SelectItem value="last_year">Année dernière</SelectItem>
              <SelectItem value="custom">Personnalisée</SelectItem>
            </SelectContent>
          </Select>
          
          {showCustomDatePicker && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Dates
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="p-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Date de début</p>
                    <Calendar
                      mode="single"
                      selected={customStartDate}
                      onSelect={setCustomStartDate}
                      disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                      initialFocus
                    />
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-2">Date de fin</p>
                    <Calendar
                      mode="single"
                      selected={customEndDate}
                      onSelect={setCustomEndDate}
                      disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                      initialFocus
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
          
          <Button onClick={exportData} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenus Totaux</p>
                <p className="text-3xl font-bold text-foreground">{analyticsData.totalRevenue.toLocaleString()} F</p>
                <div className="flex items-center mt-2">
                  {revenueChange >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(revenueChange).toFixed(1)}%
                  </span>
                </div>
              </div>
              <DollarSign className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ventes Totales</p>
                <p className="text-3xl font-bold text-foreground">{analyticsData.totalSales}</p>
                <div className="flex items-center mt-2">
                  {salesChange >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-blue-600 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm ${salesChange >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {Math.abs(salesChange).toFixed(1)}%
                  </span>
                </div>
              </div>
              <ShoppingCart className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Produits Total</p>
                <p className="text-3xl font-bold text-foreground">{analyticsData.totalProducts}</p>
                <p className="text-sm text-muted-foreground mt-2">Inventaire complet</p>
              </div>
              <Package className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stock Faible</p>
                <p className="text-3xl font-bold text-foreground">{analyticsData.lowStockProducts}</p>
                <Badge variant={analyticsData.lowStockProducts > 0 ? "destructive" : "secondary"} className="mt-2">
                  {analyticsData.lowStockProducts > 0 ? 'Attention requise' : 'Tout va bien'}
                </Badge>
              </div>
              <AlertTriangle className="w-12 h-12 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Évolution des Ventes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.salesByDate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'sales' ? `${value} ventes` : `${value} F`,
                    name === 'sales' ? 'Ventes' : 'Revenus'
                  ]}
                />
                <Area type="monotone" dataKey="sales" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                <Area type="monotone" dataKey="revenue" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Modes de Paiement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.salesByPaymentMethod}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ method, count }) => `${method}: ${count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analyticsData.salesByPaymentMethod.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} ventes`, 'Nombre']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Revenus par Catégorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.revenueByCategory.slice(0, 8)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={80} />
                <Tooltip formatter={(value) => [`${value} F`, 'Revenus']} />
                <Bar dataKey="revenue" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Comparaison Mensuelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="sales" fill="#3B82F6" />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Top 10 des Produits les Plus Vendus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.topSellingProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.quantity} unités vendues</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{product.revenue.toLocaleString()} F</p>
                  <p className="text-sm text-muted-foreground">Revenus</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Statistiques des 7 Derniers Jours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analyticsData.dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#3B82F6" />
              <Bar dataKey="revenue" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
