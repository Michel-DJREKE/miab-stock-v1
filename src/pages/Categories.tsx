
import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Tags,
  Eye,
  Edit,
  Trash,
  Image as ImageIcon,
  Package,
  Grid3x3,
  List,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import CategoryForm from '@/components/CategoryForm';
import CategoriesListView from '@/components/CategoriesListView';
import ImportExportDialog from '@/components/ImportExportDialog';
import { useCategories, Category } from '@/hooks/useCategories';

const Categories = () => {
  const { language } = useApp();
  const { t } = useTranslation(language);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const { 
    categories, 
    isLoading, 
    createCategory, 
    updateCategory, 
    deleteCategory 
  } = useCategories();

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate real statistics from the categories data
  const stats = {
    totalCategories: categories.length,
    totalProducts: categories.reduce((sum, category) => sum + (category.productCount || 0), 0),
    totalValue: categories.reduce((sum, category) => sum + (category.totalValue || 0), 0),
    emptyCategories: categories.filter(category => (category.productCount || 0) === 0).length
  };

  const handleSaveCategory = async (categoryData: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'productCount' | 'totalValue'>) => {
    try {
      if (selectedCategory) {
        await updateCategory.mutateAsync({ 
          id: selectedCategory.id, 
          ...categoryData 
        });
      } else {
        await createCategory.mutateAsync(categoryData);
      }
      setSelectedCategory(null);
      setShowCategoryForm(false);
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleViewCategory = (category: Category) => {
    toast.info(`Visualisation de la catégorie: ${category.name}`);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (category: Category) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?`)) {
      try {
        await deleteCategory.mutateAsync(category.id);
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleNewCategory = () => {
    setSelectedCategory(null);
    setShowCategoryForm(true);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">Chargement des catégories...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t.nav.categories}
          </h1>
          <p className="text-muted-foreground">
            Organisez vos produits par catégories
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline"
            onClick={() => setShowExportDialog(true)}
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button 
            className="miabe-button-primary"
            onClick={handleNewCategory}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle catégorie
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="miabe-card">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{stats.totalCategories}</p>
              <p className="text-sm text-muted-foreground">Catégories</p>
            </div>
          </CardContent>
        </Card>
        <Card className="miabe-card">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.totalProducts}</p>
              <p className="text-sm text-muted-foreground">Produits</p>
            </div>
          </CardContent>
        </Card>
        <Card className="miabe-card">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">₣{stats.totalValue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Valeur totale</p>
            </div>
          </CardContent>
        </Card>
        <Card className="miabe-card">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{stats.emptyCategories}</p>
              <p className="text-sm text-muted-foreground">Vides</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Card className="miabe-card flex-1">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="miabe-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="miabe-card">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Tags className="w-5 h-5 text-miabe-yellow-600" />
                        <h3 className="font-semibold text-foreground">{category.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {category.description || 'Aucune description'}
                      </p>
                    </div>
                    <div 
                      className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: category.color || '#F59E0B' }}
                    >
                      {category.image ? (
                        <img 
                          src={category.image} 
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-white" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        <Badge variant={(category.productCount || 0) > 0 ? "default" : "secondary"}>
                          {category.productCount || 0} produits
                        </Badge>
                      </div>
                      <div className="text-sm font-medium">
                        ₣{(category.totalValue || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewCategory(category)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600"
                        onClick={() => handleDeleteCategory(category)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <CategoriesListView
          categories={filteredCategories}
          onView={handleViewCategory}
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategory}
        />
      )}

      {filteredCategories.length === 0 && (
        <Card className="miabe-card">
          <CardContent className="p-12 text-center">
            <Tags className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Aucune catégorie trouvée
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? 'Aucune catégorie ne correspond à votre recherche.' : 'Créez votre première catégorie pour organiser vos produits.'}
            </p>
            <Button 
              className="miabe-button-primary"
              onClick={handleNewCategory}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle catégorie
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <CategoryForm
        open={showCategoryForm}
        onOpenChange={setShowCategoryForm}
        category={selectedCategory}
        onSave={handleSaveCategory}
      />

      <ImportExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        type="export"
        exportData={categories}
        filename="categories"
      />
    </div>
  );
};

export default Categories;
