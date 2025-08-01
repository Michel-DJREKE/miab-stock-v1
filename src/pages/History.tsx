
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Download, 
  Filter, 
  Calendar,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  User,
  RefreshCw,
  Plus,
  Edit,
  Trash,
  Truck,
  Tag,
  Users
} from 'lucide-react';
import { useActionHistory } from '@/hooks/useActionHistory';
import { toast } from 'sonner';

const History = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const { actionHistory, isLoading } = useActionHistory();

  const filteredHistory = actionHistory.filter(action => {
    const matchesSearch = action.entity_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         action.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || action.action_type === actionFilter;
    const matchesEntity = entityFilter === 'all' || action.entity_type === entityFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const actionDate = new Date(action.created_at);
      const today = new Date();
      
      switch (dateFilter) {
        case 'today':
          matchesDate = actionDate.toDateString() === today.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = actionDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = actionDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesAction && matchesEntity && matchesDate;
  });

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'create':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'update':
        return <Edit className="w-4 h-4 text-blue-600" />;
      case 'delete':
        return <Trash className="w-4 h-4 text-red-600" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'product':
        return <Package className="w-4 h-4" />;
      case 'sale':
        return <ShoppingCart className="w-4 h-4" />;
      case 'restocking':
        return <TrendingUp className="w-4 h-4" />;
      case 'customer':
        return <User className="w-4 h-4" />;
      case 'supplier':
        return <Truck className="w-4 h-4" />;
      case 'category':
        return <Tag className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getActionBadge = (actionType: string) => {
    switch (actionType) {
      case 'create':
        return <Badge className="bg-green-100 text-green-800">Création</Badge>;
      case 'update':
        return <Badge className="bg-blue-100 text-blue-800">Modification</Badge>;
      case 'delete':
        return <Badge className="bg-red-100 text-red-800">Suppression</Badge>;
      default:
        return <Badge variant="outline">{actionType}</Badge>;
    }
  };

  const getEntityBadge = (entityType: string) => {
    switch (entityType) {
      case 'product':
        return <Badge variant="outline">Produit</Badge>;
      case 'sale':
        return <Badge variant="outline">Vente</Badge>;
      case 'restocking':
        return <Badge variant="outline">Réapprovisionnement</Badge>;
      case 'customer':
        return <Badge variant="outline">Client</Badge>;
      case 'supplier':
        return <Badge variant="outline">Fournisseur</Badge>;
      case 'category':
        return <Badge variant="outline">Catégorie</Badge>;
      default:
        return <Badge variant="outline">{entityType}</Badge>;
    }
  };

  const handleExport = () => {
    if (filteredHistory.length === 0) {
      toast.error('Aucune action à exporter');
      return;
    }

    const csvContent = [
      'Date,Action,Type,Nom,Description',
      ...filteredHistory.map(action => 
        `${new Date(action.created_at).toLocaleDateString()},${action.action_type},${action.entity_type},${action.entity_name || ''},${action.description || ''}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historique_actions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Historique exporté avec succès');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const stats = {
    totalActions: actionHistory.length,
    todayActions: actionHistory.filter(action => {
      const today = new Date().toDateString();
      return new Date(action.created_at).toDateString() === today;
    }).length,
    creations: actionHistory.filter(action => action.action_type === 'create').length,
    modifications: actionHistory.filter(action => action.action_type === 'update').length,
    suppressions: actionHistory.filter(action => action.action_type === 'delete').length,
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Chargement de l'historique...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Historique des actions</h1>
          <p className="text-muted-foreground">Suivi de toutes les actions effectuées</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{stats.totalActions}</p>
              <p className="text-sm text-muted-foreground">Actions totales</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.todayActions}</p>
              <p className="text-sm text-muted-foreground">Aujourd'hui</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.creations}</p>
              <p className="text-sm text-muted-foreground">Créations</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.modifications}</p>
              <p className="text-sm text-muted-foreground">Modifications</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.suppressions}</p>
              <p className="text-sm text-muted-foreground">Suppressions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">Toutes les actions</option>
                <option value="create">Créations</option>
                <option value="update">Modifications</option>
                <option value="delete">Suppressions</option>
              </select>
            </div>
            <div>
              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">Tous les types</option>
                <option value="product">Produits</option>
                <option value="sale">Ventes</option>
                <option value="restocking">Réapprovisionnements</option>
                <option value="customer">Clients</option>
                <option value="supplier">Fournisseurs</option>
                <option value="category">Catégories</option>
              </select>
            </div>
            <div>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">Toutes les dates</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions List */}
      <div className="space-y-4">
        {filteredHistory.map((action) => (
          <Card key={action.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      {getActionIcon(action.action_type)}
                    </div>
                    <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                      {getEntityIcon(action.entity_type)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-foreground">
                        {action.entity_name || 'Élément'}
                      </h3>
                      {getActionBadge(action.action_type)}
                      {getEntityBadge(action.entity_type)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {action.description || `${action.action_type} ${action.entity_type}`}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {new Date(action.created_at).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(action.created_at).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredHistory.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Aucune action trouvée
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || actionFilter !== 'all' || entityFilter !== 'all' || dateFilter !== 'all'
                  ? 'Aucune action ne correspond à vos critères de recherche.' 
                  : 'Aucune action enregistrée pour le moment.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default History;
