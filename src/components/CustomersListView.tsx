
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Eye,
  Edit,
  Trash,
  User,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  status: string;
  registrationDate: string;
  avatar?: string;
}

interface CustomersListViewProps {
  customers: Customer[];
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

const CustomersListView = ({ customers, onView, onEdit, onDelete }: CustomersListViewProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Actif</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-500 text-white">Inactif</Badge>;
      case 'blocked':
        return <Badge className="bg-red-500 text-white">Bloqué</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Commandes</TableHead>
            <TableHead>Total dépensé</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Dernière commande</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={customer.avatar} />
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">
                    {customer.firstName} {customer.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    {customer.address || 'Adresse non renseignée'}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {customer.phone && (
                    <p className="text-sm flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      {customer.phone}
                    </p>
                  )}
                  {customer.email && (
                    <p className="text-sm flex items-center">
                      <Mail className="w-3 h-3 mr-1" />
                      {customer.email}
                    </p>
                  )}
                  {!customer.phone && !customer.email && (
                    <p className="text-sm text-muted-foreground">Contact non renseigné</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="font-medium">{customer.totalOrders}</span>
              </TableCell>
              <TableCell>
                <span className="font-medium">₣{customer.totalSpent.toLocaleString()}</span>
              </TableCell>
              <TableCell>
                {getStatusBadge(customer.status)}
              </TableCell>
              <TableCell>
                {new Date(customer.lastOrder).toLocaleDateString('fr-FR')}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(customer)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(customer)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                    onClick={() => onDelete(customer)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomersListView;
