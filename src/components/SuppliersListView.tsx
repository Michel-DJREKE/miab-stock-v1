
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { Supplier } from '@/hooks/useSuppliers';

interface SuppliersListViewProps {
  suppliers: Supplier[];
  onView: (supplier: Supplier) => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplierId: string) => void;
}

const SuppliersListView: React.FC<SuppliersListViewProps> = ({
  suppliers,
  onView,
  onEdit,
  onDelete
}) => {
  const getStatusBadge = (supplier: Supplier) => {
    const hasProducts = supplier.productCount && supplier.productCount > 0;
    return hasProducts ? (
      <Badge className="bg-green-100 text-green-800">Actif</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Inactif</Badge>
    );
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fournisseur</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Performance</TableHead>
            <TableHead>Créé le</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow key={supplier.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{supplier.name}</div>
                  {supplier.contact_person && (
                    <div className="text-sm text-blue-600">{supplier.contact_person}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1 text-sm">
                  {supplier.email && (
                    <div className="flex items-center">
                      <Mail className="w-3 h-3 mr-1" />
                      {supplier.email}
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      {supplier.phone}
                    </div>
                  )}
                  {supplier.address && (
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {supplier.address}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {getStatusBadge(supplier)}
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{supplier.productCount || 0} produits</div>
                  <div className="text-muted-foreground">
                    {(supplier.totalValue || 0).toLocaleString()} F
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {new Date(supplier.created_at).toLocaleDateString('fr-FR')}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => onView(supplier)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(supplier)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600"
                    onClick={() => onDelete(supplier.id)}
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

export default SuppliersListView;
