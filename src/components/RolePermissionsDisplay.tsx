
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { AppRole } from '@/hooks/useRoles';

interface RolePermissionsDisplayProps {
  role: AppRole;
}

export const RolePermissionsDisplay: React.FC<RolePermissionsDisplayProps> = ({ role }) => {
  const rolePermissions: Record<AppRole, {
    label: string;
    color: string;
    permissions: string[];
    description: string;
  }> = {
    admin: {
      label: 'Administrateur',
      color: 'bg-red-500',
      description: 'Accès complet à toutes les fonctionnalités',
      permissions: [
        'Gestion complète des produits',
        'Gestion complète des ventes',
        'Gestion des réapprovisionnements',
        'Gestion de l\'inventaire',
        'Analyses et rapports',
        'Gestion des utilisateurs',
        'Gestion des paramètres',
        'Gestion des clients et fournisseurs'
      ]
    },
    manager: {
      label: 'Gérant',
      color: 'bg-blue-500',
      description: 'Gestion opérationnelle complète sauf utilisateurs',
      permissions: [
        'Gestion complète des produits',
        'Gestion des ventes et modifications',
        'Gestion des réapprovisionnements',
        'Gestion de l\'inventaire',
        'Analyses et rapports',
        'Gestion des clients et fournisseurs',
        'Gestion des catégories'
      ]
    },
    accountant: {
      label: 'Comptable',
      color: 'bg-green-500',
      description: 'Accès en lecture pour analyses financières',
      permissions: [
        'Consultation des produits',
        'Consultation des ventes',
        'Consultation des réapprovisionnements',
        'Consultation de l\'inventaire',
        'Analyses et rapports complets',
        'Consultation des clients et fournisseurs'
      ]
    },
    sales: {
      label: 'Commercial',
      color: 'bg-orange-500',
      description: 'Gestion des ventes et produits',
      permissions: [
        'Gestion des produits (créer, modifier)',
        'Création et gestion des ventes',
        'Consultation des catégories',
        'Gestion des clients'
      ]
    }
  };

  const roleInfo = rolePermissions[role];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Permissions - {roleInfo.label}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {roleInfo.description}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {roleInfo.permissions.map((permission, index) => (
            <div key={index} className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {permission}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
