
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Globe, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';

interface SystemSettings {
  currency: string;
  language: string;
  tax: number;
  lowStockAlert: boolean;
  emailNotifications: boolean;
  autoBackup: boolean;
}

interface SystemSettingsFormProps {
  initialSettings: SystemSettings;
  onSave: (settings: SystemSettings) => void;
}

export const SystemSettingsForm: React.FC<SystemSettingsFormProps> = ({
  initialSettings,
  onSave
}) => {
  const [settings, setSettings] = useState(initialSettings);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { setLanguage } = useApp();

  const handleChange = (field: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update app language if changed
      if (settings.language !== initialSettings.language) {
        setLanguage(settings.language.toLowerCase() as any);
      }
      
      onSave(settings);
      toast({
        title: "Paramètres sauvegardés",
        description: "Les paramètres système ont été mis à jour avec succès."
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Paramètres système
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Devise</Label>
            <select
              id="currency"
              value={settings.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="FCFA">Franc CFA (F)</option>
              <option value="EUR">Euro (€)</option>
              <option value="USD">Dollar US ($)</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Langue</Label>
            <select
              id="language"
              value={settings.language}
              onChange={(e) => handleChange('language', e.target.value)}
              className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="FR">Français</option>
              <option value="EN">English</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tax">TVA par défaut (%)</Label>
          <Input
            id="tax"
            type="number"
            value={settings.tax}
            onChange={(e) => handleChange('tax', parseInt(e.target.value))}
            className="max-w-xs"
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="font-medium">Notifications</h4>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label>Alertes stock faible</Label>
              <p className="text-sm text-muted-foreground">Recevoir des alertes quand le stock est bas</p>
            </div>
            <Switch
              checked={settings.lowStockAlert}
              onCheckedChange={(checked) => handleChange('lowStockAlert', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label>Notifications email</Label>
              <p className="text-sm text-muted-foreground">Recevoir des notifications par email</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleChange('emailNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label>Sauvegarde automatique</Label>
              <p className="text-sm text-muted-foreground">Sauvegarde automatique des données</p>
            </div>
            <Switch
              checked={settings.autoBackup}
              onCheckedChange={(checked) => handleChange('autoBackup', checked)}
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </CardContent>
    </Card>
  );
};
