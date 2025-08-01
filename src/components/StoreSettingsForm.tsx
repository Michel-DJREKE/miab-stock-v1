
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Store, Upload, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StoreSettings {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  description: string;
  hours: string;
  logo?: string;
}

interface StoreSettingsFormProps {
  initialSettings: StoreSettings;
  onSave: (settings: StoreSettings) => void;
}

export const StoreSettingsForm: React.FC<StoreSettingsFormProps> = ({
  initialSettings,
  onSave
}) => {
  const [settings, setSettings] = useState(initialSettings);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (field: keyof StoreSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSave(settings);
      toast({
        title: "Paramètres sauvegardés",
        description: "Les paramètres de la boutique ont été mis à jour avec succès."
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

  const handleLogoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setSettings(prev => ({ ...prev, logo: e.target?.result as string }));
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="w-5 h-5" />
          Paramètres de la boutique
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="storeName">Nom de la boutique</Label>
            <Input
              id="storeName"
              value={settings.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="storeEmail">Email</Label>
            <Input
              id="storeEmail"
              type="email"
              value={settings.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="storePhone">Téléphone</Label>
            <Input
              id="storePhone"
              value={settings.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="storeWhatsapp">WhatsApp</Label>
            <Input
              id="storeWhatsapp"
              value={settings.whatsapp}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="storeAddress">Adresse</Label>
          <Input
            id="storeAddress"
            value={settings.address}
            onChange={(e) => handleChange('address', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="storeDescription">Description</Label>
          <Textarea
            id="storeDescription"
            value={settings.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="storeHours">Horaires</Label>
          <Input
            id="storeHours"
            value={settings.hours}
            onChange={(e) => handleChange('hours', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Logo de la boutique</Label>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center overflow-hidden">
              {settings.logo ? (
                <img src={settings.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-8 h-8 text-primary-foreground" />
              )}
            </div>
            <Button variant="outline" onClick={handleLogoUpload} className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Changer le logo
            </Button>
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
