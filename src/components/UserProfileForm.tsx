
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, Upload, Save, LogOut, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
}

interface UserProfileFormProps {
  initialProfile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

export const UserProfileForm: React.FC<UserProfileFormProps> = ({
  initialProfile,
  onSave
}) => {
  const [profile, setProfile] = useState(initialProfile);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { logout, setUser } = useApp();

  const handleChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user in context
      setUser({
        id: '1',
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        avatar: profile.avatar
      });
      
      onSave(profile);
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès."
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le profil.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setProfile(prev => ({ ...prev, avatar: e.target?.result as string }));
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès."
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Profil utilisateur
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center overflow-hidden">
            {profile.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-primary-foreground" />
            )}
          </div>
          <Button variant="outline" onClick={handleAvatarUpload} className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Changer l'avatar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              value={profile.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input
              id="lastName"
              value={profile.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="userEmail">Email</Label>
          <Input
            id="userEmail"
            type="email"
            value={profile.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="userPhone">Téléphone</Label>
          <Input
            id="userPhone"
            value={profile.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>

        <Button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>

        <Separator />

        <div className="space-y-3">
          <Button variant="outline" className="w-full flex items-center gap-2">
            <Key className="w-4 h-4" />
            Changer le mot de passe
          </Button>

          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
