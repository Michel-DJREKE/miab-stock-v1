
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Calendar, Package } from 'lucide-react';
import { useExpiryAlerts } from '@/hooks/useExpiryAlerts';

const ExpiryAlerts = () => {
  const { alerts, isLoading } = useExpiryAlerts();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Alertes de péremption
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  const criticalAlerts = alerts.filter(alert => alert.alert_level === 'critical');
  const warningAlerts = alerts.filter(alert => alert.alert_level === 'warning');
  const infoAlerts = alerts.filter(alert => alert.alert_level === 'info');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Alertes de péremption
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Aucune alerte de péremption
          </p>
        ) : (
          <div className="space-y-3">
            {criticalAlerts.map((alert) => (
              <Alert key={alert.id} className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{alert.name}</span>
                      <p className="text-sm">
                        {alert.days_until_expiry <= 0 
                          ? 'Expiré' 
                          : `Expire dans ${alert.days_until_expiry} jour(s)`
                        }
                      </p>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {alert.quantity} en stock
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}

            {warningAlerts.map((alert) => (
              <Alert key={alert.id} className="border-yellow-200 bg-yellow-50">
                <Calendar className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{alert.name}</span>
                      <p className="text-sm">
                        Expire dans {alert.days_until_expiry} jour(s)
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {alert.quantity} en stock
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}

            {infoAlerts.slice(0, 3).map((alert) => (
              <Alert key={alert.id} className="border-blue-200 bg-blue-50">
                <Package className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{alert.name}</span>
                      <p className="text-sm">
                        Expire dans {alert.days_until_expiry} jour(s)
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {alert.quantity} en stock
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}

            {infoAlerts.length > 3 && (
              <p className="text-sm text-muted-foreground text-center">
                +{infoAlerts.length - 3} autre(s) produit(s) à surveiller
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpiryAlerts;
