
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package, TrendingDown, RefreshCw } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useExpiryAlerts } from '@/hooks/useExpiryAlerts';
import { Link } from 'react-router-dom';

const Alerts = () => {
  const { products, isLoading: productsLoading } = useProducts();
  const { alerts: expiryAlerts, isLoading: expiryLoading } = useExpiryAlerts();

  const isLoading = productsLoading || expiryLoading;

  const outOfStockProducts = products?.filter(p => p.quantity === 0) || [];
  const lowStockProducts = products?.filter(p => 
    p.quantity > 0 && p.quantity <= (p.min_quantity || 5)
  ) || [];

  const criticalAlerts = outOfStockProducts.length + expiryAlerts.filter(a => a.alert_level === 'critical').length;
  const warningAlerts = lowStockProducts.length + expiryAlerts.filter(a => a.alert_level === 'warning').length;
  const totalAlerts = criticalAlerts + warningAlerts + expiryAlerts.filter(a => a.alert_level === 'info').length;

  const handleRefresh = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Chargement des alertes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Alertes</h1>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Résumé des alertes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alertes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAlerts}</div>
            <p className="text-xs text-muted-foreground">Alertes actives</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes critiques</CardTitle>
            <Package className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalAlerts}</div>
            <p className="text-xs text-muted-foreground">Intervention immédiate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes modérées</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{warningAlerts}</div>
            <p className="text-xs text-muted-foreground">À surveiller</p>
          </CardContent>
        </Card>
      </div>

      {totalAlerts === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-green-700 mb-2">
              Aucune alerte !
            </h3>
            <p className="text-muted-foreground">
              Tous vos produits ont des niveaux de stock suffisants.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Ruptures de stock */}
          {outOfStockProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Ruptures de stock ({outOfStockProducts.length})
                </CardTitle>
                <CardDescription>
                  Ces produits sont épuisés et nécessitent un réapprovisionnement immédiat
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {outOfStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex items-center space-x-3">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {product.categories?.name || 'Sans catégorie'}
                          </p>
                          <Badge variant="destructive" className="mt-1">
                            Stock épuisé
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Prix: {product.price.toLocaleString()} F</p>
                        <Link to="/restocking">
                          <Button size="sm" className="mt-2">
                            Réapprovisionner
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stock faible */}
          {lowStockProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <TrendingDown className="h-5 w-5" />
                  Stock faible ({lowStockProducts.length})
                </CardTitle>
                <CardDescription>
                  Ces produits approchent du seuil d'alerte et nécessitent un réapprovisionnement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50">
                      <div className="flex items-center space-x-3">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {product.categories?.name || 'Sans catégorie'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">
                              Stock: {product.quantity}
                            </Badge>
                            <Badge variant="outline">
                              Seuil: {product.min_quantity || 5}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Prix: {product.price.toLocaleString()} F</p>
                        <Link to="/restocking">
                          <Button size="sm" variant="outline" className="mt-2">
                            Réapprovisionner
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alertes d'expiration */}
          {expiryAlerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-600">
                  <AlertTriangle className="h-5 w-5" />
                  Dates d'expiration ({expiryAlerts.length})
                </CardTitle>
                <CardDescription>
                  Ces produits approchent de leur date d'expiration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expiryAlerts.map((alert) => (
                    <div key={alert.id} className={`flex items-center justify-between p-4 border rounded-lg ${
                      alert.alert_level === 'critical' ? 'border-red-200 bg-red-50' :
                      alert.alert_level === 'warning' ? 'border-orange-200 bg-orange-50' :
                      'border-yellow-200 bg-yellow-50'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-medium">{alert.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Expire le: {new Date(alert.expiry_date).toLocaleDateString('fr-FR')}
                          </p>
                          <Badge variant={
                            alert.alert_level === 'critical' ? 'destructive' :
                            alert.alert_level === 'warning' ? 'secondary' :
                            'outline'
                          } className="mt-1">
                            {alert.days_until_expiry <= 0 ? 'Expiré' : `${alert.days_until_expiry} jours restants`}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Stock: {alert.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Alerts;
