import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Filter,
  ShoppingCart,
  Eye,
  Download,
  Printer,
  Calendar,
  User,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useSales } from '@/hooks/useSales';
import DateFilter from '@/components/DateFilter';
import Receipt from '@/components/Receipt';

interface DateFilterType {
  type: string;
  startDate?: string;
  endDate?: string;
  month?: string;
  year?: number;
}

const Sales = () => {
  const { sales, isLoading, getSaleById } = useSales();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilterType>({ 
    type: 'all',
    startDate: '',
    endDate: '',
    month: '',
    year: new Date().getFullYear()
  });
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Safe currency formatting function
  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0';
    }
    return value.toLocaleString();
  };

  // Filter sales based on search, status, and date
  const filteredSales = sales.filter(sale => {
    // Text search
    const matchesSearch = sale.sale_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (sale.customers?.name && sale.customers.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Status filter
    const matchesStatus = selectedStatus === 'all' || sale.status === selectedStatus;
    
    // Date filter
    let matchesDate = true;
    if (dateFilter.type !== 'all') {
      const saleDate = new Date(sale.created_at);
      
      switch (dateFilter.type) {
        case 'today':
          matchesDate = saleDate.toDateString() === new Date().toDateString();
          break;
        case 'week':
          if (dateFilter.startDate && dateFilter.endDate) {
            const weekStart = new Date(dateFilter.startDate);
            const weekEnd = new Date(dateFilter.endDate);
            matchesDate = saleDate >= weekStart && saleDate <= weekEnd;
          }
          break;
        case 'month':
          if (dateFilter.month && dateFilter.year) {
            matchesDate = saleDate.getMonth() + 1 === parseInt(dateFilter.month) &&
                         saleDate.getFullYear() === dateFilter.year;
          }
          break;
        case 'year':
          if (dateFilter.year) {
            matchesDate = saleDate.getFullYear() === dateFilter.year;
          }
          break;
        case 'custom':
          if (dateFilter.startDate && dateFilter.endDate) {
            const customStart = new Date(dateFilter.startDate);
            const customEnd = new Date(dateFilter.endDate);
            matchesDate = saleDate >= customStart && saleDate <= customEnd;
          }
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 text-white">Terminée</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-black">En attente</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 text-white">Annulée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return '💵';
      case 'card':
        return '💳';
      case 'mobile':
        return '📱';
      case 'credit':
        return '🏦';
      default:
        return '💰';
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Espèces';
      case 'card':
        return 'Carte';
      case 'mobile':
        return 'Mobile Money';
      case 'credit':
        return 'Crédit';
      default:
        return method;
    }
  };

  const handleDownloadReceipt = async (sale: any) => {
    try {
      const saleData = await getSaleById(sale.id);
      const receiptData = {
        id: saleData.id,
        sale_number: saleData.sale_number,
        date: saleData.created_at,
        customer: {
          name: saleData.customers?.name || 'Client anonyme',
          phone: saleData.customers?.phone || '',
          email: saleData.customers?.email || '',
          address: saleData.customers?.address || ''
        },
        items: saleData.sale_items?.map(item => ({
          name: item.products?.name || 'Produit inconnu',
          quantity: item.quantity || 0,
          price: item.unit_price || 0,
          total: item.total_price || 0
        })) || [],
        subtotal: (saleData.total_amount || 0) + (saleData.discount_amount || 0),
        discount: saleData.discount_amount || 0,
        tax: saleData.tax_amount || 0,
        total: saleData.total_amount || 0,
        paymentMethod: saleData.payment_method || 'cash',
        notes: saleData.notes || '',
        status: saleData.status
      };
      
      setSelectedSale(receiptData);
      setShowReceipt(true);
    } catch (error) {
      toast.error('Erreur lors du chargement du reçu');
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleExportAllSales = () => {
    if (filteredSales.length === 0) {
      toast.error('Aucune vente à exporter');
      return;
    }

    const csvContent = [
      'ID,Date,Client,Articles,Total,Mode de paiement,Statut',
      ...filteredSales.map(sale => 
        `${sale.sale_number || sale.id},${new Date(sale.created_at).toLocaleDateString()},${sale.customers?.name || 'Client anonyme'},"${sale.sale_items?.map(item => item.products?.name).join(', ') || 'Aucun'}",${formatCurrency(sale.total_amount)},${getPaymentMethodLabel(sale.payment_method || 'cash')},${sale.status || 'completed'}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ventes_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Export des ventes réalisé avec succès');
  };

  const getDateFilterLabel = () => {
    switch (dateFilter.type) {
      case 'today':
        return 'Aujourd\'hui';
      case 'week':
        return 'Cette semaine';
      case 'month':
        return dateFilter.month && dateFilter.year ? `${dateFilter.month}/${dateFilter.year}` : 'Ce mois';
      case 'year':
        return dateFilter.year ? `${dateFilter.year}` : 'Cette année';
      case 'custom':
        return dateFilter.startDate && dateFilter.endDate ? `${dateFilter.startDate} - ${dateFilter.endDate}` : 'Période personnalisée';
      default:
        return 'Toutes les dates';
    }
  };

  const stats = {
    totalSales: filteredSales.length,
    todaySales: sales.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length,
    totalRevenue: filteredSales.reduce((sum, s) => sum + (s.total_amount || 0), 0),
    completedSales: filteredSales.filter(s => s.status === 'completed').length
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Chargement des ventes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ventes</h1>
          <p className="text-muted-foreground">Gérez toutes vos ventes</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportAllSales}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Link to="/sales/new">
            <Button className="bg-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle vente
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{stats.totalSales}</p>
              <p className="text-sm text-muted-foreground">Ventes (filtrées)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.todaySales}</p>
              <p className="text-sm text-muted-foreground">Aujourd'hui</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalRevenue)} F</p>
              <p className="text-sm text-muted-foreground">CA (filtré)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.completedSales}</p>
              <p className="text-sm text-muted-foreground">Terminées</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par numéro ou client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value="completed">Terminées</option>
                <option value="pending">En attente</option>
                <option value="cancelled">Annulées</option>
              </select>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowDateFilter(true)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {getDateFilterLabel()}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sales List */}
      <div className="space-y-4">
        {filteredSales.map((sale) => (
          <Card key={sale.id}>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="space-y-2">
                  <div className="flex items-center space-x-4">
                    <h3 className="font-semibold text-foreground">{sale.sale_number || sale.id}</h3>
                    {getStatusBadge(sale.status || 'completed')}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(sale.created_at).toLocaleDateString('fr-FR')} à {new Date(sale.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{sale.customers?.name || 'Client anonyme'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>{getPaymentMethodIcon(sale.payment_method || 'cash')}</span>
                      <span>{getPaymentMethodLabel(sale.payment_method || 'cash')}</span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Articles: </span>
                    <span className="text-foreground">
                      {sale.sale_items?.map(item => item.products?.name).filter(Boolean).join(', ') || 'Aucun article'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(sale.total_amount)} F CFA
                    </p>
                    {sale.discount_amount && sale.discount_amount > 0 && (
                      <p className="text-sm text-muted-foreground">
                        -{formatCurrency(sale.discount_amount)} F remise
                      </p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedSale(sale)}>
                      <Eye className="w-4 h-4" />
                      <span className="ml-1 hidden sm:inline">Voir</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDownloadReceipt(sale)}>
                      <Download className="w-4 h-4" />
                      <span className="ml-1 hidden sm:inline">Reçu</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No sales found */}
      {filteredSales.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Aucune vente trouvée
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || selectedStatus !== 'all' || dateFilter.type !== 'all' 
                ? 'Aucune vente ne correspond à vos critères de recherche.' 
                : 'Aucune vente enregistrée pour le moment.'}
            </p>
            <div className="flex justify-center space-x-2">
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setSelectedStatus('all');
                setDateFilter({ type: 'all', startDate: '', endDate: '', month: '', year: new Date().getFullYear() });
              }}>
                Réinitialiser les filtres
              </Button>
              <Link to="/sales/new">
                <Button className="bg-primary text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle vente
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sale Detail Modal */}
      <Dialog open={!!selectedSale && !showReceipt} onOpenChange={() => setSelectedSale(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Détails de la vente {selectedSale?.sale_number || selectedSale?.id}
            </DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-6">
              {/* Sale Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <p className="font-medium">{new Date(selectedSale.created_at).toLocaleDateString('fr-FR')} à {new Date(selectedSale.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Statut:</span>
                  <div className="mt-1">{getStatusBadge(selectedSale.status || 'completed')}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Client:</span>
                  <p className="font-medium">{selectedSale.customers?.name || 'Client anonyme'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Paiement:</span>
                  <p className="font-medium flex items-center gap-1">
                    {getPaymentMethodIcon(selectedSale.payment_method || 'cash')}
                    {getPaymentMethodLabel(selectedSale.payment_method || 'cash')}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold mb-3">Articles vendus</h4>
                <div className="space-y-2">
                  {selectedSale.sale_items?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-accent/50 rounded">
                      <div>
                        <span className="font-medium">{item.products?.name || 'Produit inconnu'}</span>
                        <span className="text-sm text-muted-foreground ml-2">x{item.quantity || 0}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(item.total_price)} F CFA</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total:</span>
                  <span>{formatCurrency((selectedSale.total_amount || 0) + (selectedSale.discount_amount || 0))} F CFA</span>
                </div>
                {selectedSale.discount_amount && selectedSale.discount_amount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Remise:</span>
                    <span>-{formatCurrency(selectedSale.discount_amount)} F CFA</span>
                  </div>
                )}
                {selectedSale.tax_amount && selectedSale.tax_amount > 0 && (
                  <div className="flex justify-between">
                    <span>TVA:</span>
                    <span>{formatCurrency(selectedSale.tax_amount)} F CFA</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(selectedSale.total_amount)} F CFA</span>
                </div>
              </div>

              {/* Notes */}
              {selectedSale.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground bg-accent/50 p-2 rounded">
                    {selectedSale.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => handleDownloadReceipt(selectedSale)}>
                  <Download className="w-4 h-4 mr-2" />
                  Reçu
                </Button>
                <Button onClick={() => setSelectedSale(null)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Reçu de vente</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <Receipt
              sale={selectedSale}
              onPrint={handlePrintReceipt}
              onDownload={() => toast.success('Téléchargement en cours...')}
              showActions={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Date Filter Dialog */}
      <DateFilter
        open={showDateFilter}
        onOpenChange={setShowDateFilter}
        onApplyFilter={setDateFilter}
        currentFilter={dateFilter}
      />
    </div>
  );
};

export default Sales;
