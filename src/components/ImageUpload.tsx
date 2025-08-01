
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload, X } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  value, 
  onChange, 
  label = "Image", 
  className = "" 
}) => {
  const [preview, setPreview] = useState<string | null>(value || null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Le fichier est trop volumineux. Taille maximale : 5MB');
        return;
      }

      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image valide');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onChange(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPreview(null);
    onChange('');
  };

  return (
    <div className={className}>
      <Label className="text-base font-semibold">{label}</Label>
      <div className="mt-2 flex items-center space-x-4">
        <div className="w-24 h-24 bg-accent rounded-lg flex items-center justify-center border-2 border-dashed border-border overflow-hidden">
          {preview ? (
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover rounded-lg" 
            />
          ) : (
            <Camera className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col space-y-2">
          <Label htmlFor="image-upload" className="cursor-pointer">
            <Button type="button" variant="outline" className="flex items-center gap-2" asChild>
              <span>
                <Upload className="w-4 h-4" />
                Choisir une image
              </span>
            </Button>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </Label>
          {preview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeImage}
            >
              <X className="w-4 h-4 mr-1" />
              Supprimer
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Formats acceptés: JPG, PNG, GIF. Taille max: 5MB
      </p>
    </div>
  );
};

export default ImageUpload;
