
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package, Users, Eye, Clock } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'sale' | 'stock' | 'customer' | 'product';
  title: string;
  description: string;
  time: string;
  amount?: number;
  status?: string;
}

interface RecentActivityFeedProps {
  activities: ActivityItem[];
}

const activityConfig = {
  sale: { icon: ShoppingCart, color: 'text-green-600', bg: 'bg-green-50' },
  stock: { icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
  customer: { icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  product: { icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' }
};

export const RecentActivityFeed = ({ activities }: RecentActivityFeedProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Activité Récente
          </CardTitle>
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Voir tout
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Aucune activité récente</p>
            </div>
          ) : (
            activities.slice(0, 5).map((activity) => {
              const config = activityConfig[activity.type];
              const Icon = config.icon;
              
              return (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border bg-background/50 hover:bg-background/80 transition-colors">
                  <div className={`p-2 rounded-lg ${config.bg} ${config.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <div className="flex items-center space-x-2">
                        {activity.amount && (
                          <span className="text-green-600 font-semibold text-xs">
                            {formatCurrency(activity.amount)}
                          </span>
                        )}
                        {activity.status && (
                          <Badge variant="secondary" className="text-xs">
                            {activity.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
