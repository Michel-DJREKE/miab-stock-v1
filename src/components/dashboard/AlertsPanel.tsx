
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package, Calendar, Eye } from 'lucide-react';

interface Alert {
  id: string;
  type: 'stock' | 'expiry' | 'rupture';
  title: string;
  description: string;
  count?: number;
  severity: 'low' | 'medium' | 'high';
}

interface AlertsPanelProps {
  alerts: Alert[];
}

const alertConfig = {
  stock: { icon: Package, color: 'bg-orange-50 text-orange-600', badge: 'secondary' },
  expiry: { icon: Calendar, color: 'bg-red-50 text-red-600', badge: 'destructive' },
  rupture: { icon: AlertTriangle, color: 'bg-yellow-50 text-yellow-600', badge: 'default' }
};

export const AlertsPanel = ({ alerts }: AlertsPanelProps) => {
  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Alertes
          </CardTitle>
          <Badge variant="secondary">{alerts.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-green-500 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">Aucune alerte active</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const config = alertConfig[alert.type];
            const Icon = config.icon;
            
            return (
              <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg border bg-background/50 hover:bg-background/80 transition-colors">
                <div className={`p-2 rounded-lg ${config.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{alert.title}</p>
                    {alert.count && (
                      <Badge variant={config.badge as any} className="text-xs">
                        {alert.count}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{alert.description}</p>
                </div>
              </div>
            );
          })
        )}
        {alerts.length > 0 && (
          <Button variant="ghost" className="w-full mt-4" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Voir toutes les alertes
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
