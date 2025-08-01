
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Eye, Edit, Trash, Image as ImageIcon } from 'lucide-react';
import { Category } from '@/hooks/useCategories';

interface CategoriesListViewProps {
  categories: Category[];
  onView: (category: Category) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const CategoriesListView = ({ categories, onView, onEdit, onDelete }: CategoriesListViewProps) => {
  return (
    <Card className="miabe-card">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Produits</TableHead>
              <TableHead>Valeur totale</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <div className="w-12 h-12 bg-miabe-yellow-100 dark:bg-miabe-black-800 rounded-lg flex items-center justify-center">
                    {category.image ? (
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-miabe-yellow-600" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{category.name}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground max-w-xs truncate">
                    {category.description || 'Aucune description'}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={(category.productCount || 0) > 0 ? "default" : "secondary"}>
                    {category.productCount || 0}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-medium">₣{(category.totalValue || 0).toLocaleString()}</span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onView(category)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onEdit(category)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600"
                      onClick={() => onDelete(category)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CategoriesListView;
