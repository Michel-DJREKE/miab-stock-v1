
import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, 
  Store, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Save,
  Upload,
  Download,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { toast } = useToast();
  
  // États pour les différentes sections
  const [storeSettings, setStoreSettings] = useState({
    name: 'Miabé Stock',
    email: 'contact@miabestock.com',
    phone: '+225 07 12 34 56 78',
    whatsapp: '+225 07 12 34 56 78',
    address: 'Cocody, Abidjan, Côte d\'Ivoire',
    description: 'Système de gestion de stock professionnel',
    hours: '8h00 - 18h00, Lun - Ven',
    logo: null
  });

  const [userSettings, setUserSettings] = useState({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@miabestock.com',
    phone: '+225 07 12 34 56 78',
    avatar: null
  });

  const [systemSettings, setSystemSettings] = useState({
    currency: 'FCFA',
    language: 'FR',
    tax: 18,
    timezone: 'Africa/Abidjan',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'french'
  });

  const [notifications, setNotifications] = useState({
    lowStock: true,
    expiry: true,
    newSale: false,
    dailyReport: true,
    email: true,
    push: false
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 3
  });

  const [appearance, setAppearance] = useState({
    theme: 'light',
    compactMode: false,
    showTutorial: true,
    defaultPage: 'dashboard'
  });

  const handleSaveSection = (section: string) => {
    toast({
      title: "Paramètres sauvegardés",
      description: `Les paramètres de ${section} ont été mis à jour avec succès.`
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export en cours",
      description: "Vos données sont en cours d'export..."
    });
  };

  const handleImportData = () => {
    toast({
      title: "Import disponible",
      description: "Fonctionnalité d'import bientôt disponible."
    });
  };

  const handleResetData = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.')) {
      toast({
        title: "Réinitialisation",
        description: "Toutes les données ont été réinitialisées.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <SettingsIcon className="w-8 h-8 text-primary" />
            Paramètres
          </h1>
          <p className="text-muted-foreground mt-1">
            Configurez votre système selon vos préférences
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          Version 1.0.0
        </Badge>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="store" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="store" className="flex items-center gap-2">
            <Store className="w-4 h-4" />
            Boutique
          </TabsTrigger>
          <TabsTrigger value="user" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" />
            Système
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Apparence
          </TabsTrigger>
        </TabsList>

        {/* Store Settings */}
        <TabsContent value="store" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                Informations de la boutique
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="store-name">Nom de la boutique</Label>
                  <Input
                    id="store-name"
                    value={storeSettings.name}
                    onChange={(e) => setStoreSettings({...storeSettings, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="store-email">Email</Label>
                  <Input
                    id="store-email"
                    type="email"
                    value={storeSettings.email}
                    onChange={(e) => setStoreSettings({...storeSettings, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="store-phone">Téléphone</Label>
                  <Input
                    id="store-phone"
                    value={storeSettings.phone}
                    onChange={(e) => setStoreSettings({...storeSettings, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="store-whatsapp">WhatsApp</Label>
                  <Input
                    id="store-whatsapp"
                    value={storeSettings.whatsapp}
                    onChange={(e) => setStoreSettings({...storeSettings, whatsapp: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="store-address">Adresse</Label>
                <Textarea
                  id="store-address"
                  value={storeSettings.address}
                  onChange={(e) => setStoreSettings({...storeSettings, address: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="store-description">Description</Label>
                <Textarea
                  id="store-description"
                  value={storeSettings.description}
                  onChange={(e) => setStoreSettings({...storeSettings, description: e.target.value})}
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="store-hours">Heures d'ouverture</Label>
                <Input
                  id="store-hours"
                  value={storeSettings.hours}
                  onChange={(e) => setStoreSettings({...storeSettings, hours: e.target.value})}
                  placeholder="Ex: 8h00 - 18h00, Lun - Ven"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSection('boutique')}>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Settings */}
        <TabsContent value="user" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profil utilisateur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user-firstName">Prénom</Label>
                  <Input
                    id="user-firstName"
                    value={userSettings.firstName}
                    onChange={(e) => setUserSettings({...userSettings, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="user-lastName">Nom</Label>
                  <Input
                    id="user-lastName"
                    value={userSettings.lastName}
                    onChange={(e) => setUserSettings({...userSettings, lastName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="user-email">Email</Label>
                  <Input
                    id="user-email"
                    type="email"
                    value={userSettings.email}
                    onChange={(e) => setUserSettings({...userSettings, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="user-phone">Téléphone</Label>
                  <Input
                    id="user-phone"
                    value={userSettings.phone}
                    onChange={(e) => setUserSettings({...userSettings, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSection('profil')}>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Paramètres système
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Devise</Label>
                  <select
                    id="currency"
                    value={systemSettings.currency}
                    onChange={(e) => setSystemSettings({...systemSettings, currency: e.target.value})}
                    className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="FCFA">FCFA</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="language">Langue</Label>
                  <select
                    id="language"
                    value={systemSettings.language}
                    onChange={(e) => setSystemSettings({...systemSettings, language: e.target.value})}
                    className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="FR">Français</option>
                    <option value="EN">English</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="tax">Taux de TVA (%)</Label>
                  <Input
                    id="tax"
                    type="number"
                    value={systemSettings.tax}
                    onChange={(e) => setSystemSettings({...systemSettings, tax: Number(e.target.value)})}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Fuseau horaire</Label>
                  <select
                    id="timezone"
                    value={systemSettings.timezone}
                    onChange={(e) => setSystemSettings({...systemSettings, timezone: e.target.value})}
                    className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="Africa/Abidjan">Abidjan</option>
                    <option value="Africa/Accra">Accra</option>
                    <option value="Europe/Paris">Paris</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSection('système')}>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Stock faible</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des alertes quand le stock est bas
                    </p>
                  </div>
                  <Switch
                    checked={notifications.lowStock}
                    onCheckedChange={(checked) => setNotifications({...notifications, lowStock: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Expiration des produits</Label>
                    <p className="text-sm text-muted-foreground">
                      Alertes pour les produits qui expirent bientôt
                    </p>
                  </div>
                  <Switch
                    checked={notifications.expiry}
                    onCheckedChange={(checked) => setNotifications({...notifications, expiry: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Nouvelles ventes</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications pour chaque nouvelle vente
                    </p>
                  </div>
                  <Switch
                    checked={notifications.newSale}
                    onCheckedChange={(checked) => setNotifications({...notifications, newSale: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Rapport quotidien</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir un résumé quotidien des activités
                    </p>
                  </div>
                  <Switch
                    checked={notifications.dailyReport}
                    onCheckedChange={(checked) => setNotifications({...notifications, dailyReport: checked})}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSection('notifications')}>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Authentification à deux facteurs</Label>
                    <p className="text-sm text-muted-foreground">
                      Sécurité supplémentaire avec code SMS
                    </p>
                  </div>
                  <Switch
                    checked={security.twoFactor}
                    onCheckedChange={(checked) => setSecurity({...security, twoFactor: checked})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="session-timeout">Timeout de session (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={security.sessionTimeout}
                    onChange={(e) => setSecurity({...security, sessionTimeout: Number(e.target.value)})}
                    min="5"
                    max="120"
                  />
                </div>
                
                <div>
                  <Label htmlFor="password-expiry">Expiration du mot de passe (jours)</Label>
                  <Input
                    id="password-expiry"
                    type="number"
                    value={security.passwordExpiry}
                    onChange={(e) => setSecurity({...security, passwordExpiry: Number(e.target.value)})}
                    min="30"
                    max="365"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSection('sécurité')}>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Apparence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="theme">Thème</Label>
                  <select
                    id="theme"
                    value={appearance.theme}
                    onChange={(e) => setAppearance({...appearance, theme: e.target.value})}
                    className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="light">Clair</option>
                    <option value="dark">Sombre</option>
                    <option value="auto">Automatique</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mode compact</Label>
                    <p className="text-sm text-muted-foreground">
                      Interface plus dense pour plus d'informations
                    </p>
                  </div>
                  <Switch
                    checked={appearance.compactMode}
                    onCheckedChange={(checked) => setAppearance({...appearance, compactMode: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Tutoriel d'aide</Label>
                    <p className="text-sm text-muted-foreground">
                      Afficher les conseils pour les nouvelles fonctionnalités
                    </p>
                  </div>
                  <Switch
                    checked={appearance.showTutorial}
                    onCheckedChange={(checked) => setAppearance({...appearance, showTutorial: checked})}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSection('apparence')}>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Gestion des données
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" onClick={handleExportData}>
              <Download className="w-4 h-4 mr-2" />
              Exporter les données
            </Button>
            <Button variant="outline" onClick={handleImportData}>
              <Upload className="w-4 h-4 mr-2" />
              Importer des données
            </Button>
            <Button variant="destructive" onClick={handleResetData}>
              <Trash2 className="w-4 h-4 mr-2" />
              Réinitialiser tout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
