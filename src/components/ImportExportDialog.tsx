
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

interface ImportExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'import' | 'export';
  onImport?: (data: any[]) => void;
  exportData?: any[];
  filename?: string;
}

const ImportExportDialog = ({ open, onOpenChange, type, onImport, exportData, filename }: ImportExportDialogProps) => {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json' | 'xlsx'>('csv');

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        let data;
        if (file.type === 'application/json') {
          data = JSON.parse(event.target?.result as string);
        } else if (file.type === 'text/csv') {
          // Simple CSV parsing - in real app, use a proper CSV library
          const text = event.target?.result as string;
          const lines = text.split('\n');
          const headers = lines[0].split(',');
          data = lines.slice(1).map(line => {
            const values = line.split(',');
            return headers.reduce((obj: any, header, index) => {
              obj[header.trim()] = values[index]?.trim();
              return obj;
            }, {});
          }).filter(item => Object.keys(item).length > 1);
        }
        
        if (onImport && data) {
          onImport(data);
          toast.success(`${data.length} éléments importés avec succès`);
          onOpenChange(false);
        }
      } catch (error) {
        toast.error('Erreur lors de l\'importation du fichier');
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    if (!exportData) return;

    let content: string;
    let mimeType: string;
    let fileExtension: string;

    switch (selectedFormat) {
      case 'json':
        content = JSON.stringify(exportData, null, 2);
        mimeType = 'application/json';
        fileExtension = 'json';
        break;
      case 'csv':
        if (exportData.length > 0) {
          const headers = Object.keys(exportData[0]);
          const csvContent = [
            headers.join(','),
            ...exportData.map(item => headers.map(header => item[header] || '').join(','))
          ].join('\n');
          content = csvContent;
        } else {
          content = '';
        }
        mimeType = 'text/csv';
        fileExtension = 'csv';
        break;
      default:
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename || 'export'}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Export réalisé avec succès');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === 'import' ? 'Importer des données' : 'Exporter les données'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {type === 'export' && (
            <div>
              <label className="text-sm font-medium">Format d'export</label>
              <div className="mt-2 space-y-2">
                <Card className={`cursor-pointer transition-colors ${selectedFormat === 'csv' ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSelectedFormat('csv')}>
                  <CardContent className="p-3 flex items-center space-x-3">
                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">CSV</p>
                      <p className="text-sm text-muted-foreground">Compatible Excel</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className={`cursor-pointer transition-colors ${selectedFormat === 'json' ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSelectedFormat('json')}>
                  <CardContent className="p-3 flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">JSON</p>
                      <p className="text-sm text-muted-foreground">Format de données</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {type === 'import' && (
            <div>
              <label className="text-sm font-medium">Sélectionner un fichier</label>
              <div className="mt-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".csv,.json,.xlsx"
                    onChange={handleImport}
                    className="hidden"
                  />
                  <Card className="border-2 border-dashed border-border hover:border-primary transition-colors">
                    <CardContent className="p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Cliquez pour sélectionner</p>
                      <p className="text-xs text-muted-foreground">CSV, JSON, XLSX acceptés</p>
                    </CardContent>
                  </Card>
                </label>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            {type === 'export' && (
              <Button onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportExportDialog;
