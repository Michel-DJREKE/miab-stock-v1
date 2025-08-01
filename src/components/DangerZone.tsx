
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ResetType = 'sales' | 'customers' | 'products' | 'all';

export const DangerZone: React.FC = () => {
  const [confirmationText, setConfirmationText] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [activeReset, setActiveReset] = useState<ResetType | null>(null);
  const { toast } = useToast();

  const resetActions = [
    {
      type: 'sales' as ResetType,
      title: 'Réinitialiser les ventes',
      description: 'Supprime toutes les données de ventes et l\'historique des transactions.',
      confirmText: 'SUPPRIMER VENTES',
      buttonClass: 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
    },
    {
      type: 'customers' as ResetType,
      title: 'Réinitialiser les clients',
      description: 'Supprime tous les clients et leurs informations associées.',
      confirmText: 'SUPPRIMER CLIENTS',
      buttonClass: 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
    },
    {
      type: 'products' as ResetType,
      title: 'Réinitialiser les produits',
      description: 'Supprime tous les produits, catégories et données d\'inventaire.',
      confirmText: 'SUPPRIMER PRODUITS',
      buttonClass: 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
    },
    {
      type: 'all' as ResetType,
      title: 'Réinitialiser tout',
      description: 'Supprime TOUTES les données et remet l\'application à zéro. Cette action est IRRÉVERSIBLE.',
      confirmText: 'TOUT SUPPRIMER',
      buttonClass: 'text-red-600 hover:text-red-700 hover:bg-red-50'
    }
  ];

  const handleReset = async (type: ResetType) => {
    if (confirmationText !== getConfirmText(type)) {
      toast({
        title: "Erreur de confirmation",
        description: "Le texte de confirmation ne correspond pas.",
        variant: "destructive"
      });
      return;
    }

    setIsResetting(true);
    try {
      // Simulate API call for reset
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset localStorage data based on type
      switch (type) {
        case 'sales':
          localStorage.removeItem('miabe-sales');
          localStorage.removeItem('miabe-transactions');
          break;
        case 'customers':
          localStorage.removeItem('miabe-customers');
          break;
        case 'products':
          localStorage.removeItem('miabe-products');
          localStorage.removeItem('miabe-categories');
          localStorage.removeItem('miabe-inventory');
          break;
        case 'all':
          // Clear all app data except user session
          const keysToKeep = ['miabe-user', 'miabe-language', 'miabe-theme'];
          const allKeys = Object.keys(localStorage);
          allKeys.forEach(key => {
            if (key.startsWith('miabe-') && !keysToKeep.includes(key)) {
              localStorage.removeItem(key);
            }
          });
          break;
      }

      toast({
        title: "Réinitialisation terminée",
        description: `${getResetTitle(type)} effectuée avec succès.`
      });

      // Reload page for changes to take effect
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'effectuer la réinitialisation.",
        variant: "destructive"
      });
    } finally {
      setIsResetting(false);
      setConfirmationText('');
      setActiveReset(null);
    }
  };

  const getConfirmText = (type: ResetType) => {
    return resetActions.find(action => action.type === type)?.confirmText || '';
  };

  const getResetTitle = (type: ResetType) => {
    return resetActions.find(action => action.type === type)?.title || '';
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="w-5 h-5" />
          Zone de danger
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">
            <strong>Attention :</strong> Ces actions sont irréversibles. Assurez-vous d'avoir effectué une sauvegarde avant de procéder.
          </p>
        </div>

        <div className="space-y-3">
          {resetActions.map((action) => (
            <AlertDialog key={action.type}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start ${action.buttonClass}`}
                  onClick={() => setActiveReset(action.type)}
                >
                  {action.type === 'all' && <Trash2 className="w-4 h-4 mr-2" />}
                  {action.title}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    Confirmer la réinitialisation
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-4">
                    <p>{action.description}</p>
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <p className="text-sm text-red-800 font-medium">
                        Pour confirmer cette action, tapez : <code className="bg-red-100 px-1 rounded">{action.confirmText}</code>
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmInput">Confirmation</Label>
                      <Input
                        id="confirmInput"
                        value={confirmationText}
                        onChange={(e) => setConfirmationText(e.target.value)}
                        placeholder={`Tapez "${action.confirmText}" pour confirmer`}
                      />
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setConfirmationText('')}>
                    Annuler
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleReset(action.type)}
                    disabled={confirmationText !== action.confirmText || isResetting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isResetting ? 'Réinitialisation...' : 'Confirmer'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
