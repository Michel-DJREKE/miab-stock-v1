
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode, Camera, Type } from 'lucide-react';
import { toast } from 'sonner';

interface BarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBarcodeScanned: (barcode: string) => void;
}

const BarcodeScanner = ({ open, onOpenChange, onBarcodeScanned }: BarcodeScannerProps) => {
  const [manualBarcode, setManualBarcode] = useState('');
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('manual');

  const handleManualSubmit = () => {
    if (manualBarcode.trim()) {
      onBarcodeScanned(manualBarcode.trim());
      onOpenChange(false);
      setManualBarcode('');
      toast.success('Code-barres traité');
    } else {
      toast.error('Veuillez saisir un code-barres');
    }
  };

  const startCameraScanning = () => {
    // Simulation du scan par caméra
    toast.info('Fonctionnalité de scan par caméra à implémenter');
    // Dans une vraie app, utiliser une bibliothèque comme QuaggaJS ou ZXing
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Scanner un code-barres
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mode Selection */}
          <div className="flex space-x-2">
            <Button
              variant={scanMode === 'manual' ? 'default' : 'outline'}
              onClick={() => setScanMode('manual')}
              className="flex-1"
            >
              <Type className="w-4 h-4 mr-2" />
              Manuel
            </Button>
            <Button
              variant={scanMode === 'camera' ? 'default' : 'outline'}
              onClick={() => setScanMode('camera')}
              className="flex-1"
            >
              <Camera className="w-4 h-4 mr-2" />
              Caméra
            </Button>
          </div>

          {scanMode === 'manual' ? (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium">Code-barres</label>
                  <Input
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    placeholder="Saisissez le code-barres"
                    onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                  />
                </div>
                <Button onClick={handleManualSubmit} className="w-full">
                  Valider
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium mb-2">Scan par caméra</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Positionnez le code-barres devant la caméra
                </p>
                <Button onClick={startCameraScanning}>
                  Démarrer le scan
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeScanner;
