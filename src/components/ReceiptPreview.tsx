
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Printer, Check, Edit } from 'lucide-react';
import Receipt from '@/components/Receipt';

interface ReceiptPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  saleData: {
    id: string;
    sale_number?: string;
    date: string;
    customer: {
      name?: string;
      phone?: string;
      email?: string;
      address?: string;
    } | null;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      total: number;
    }>;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paymentMethod: string;
    notes?: string;
    status?: string;
  };
  onValidate: () => void;
  onEdit: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
}

const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({
  isOpen,
  onClose,
  saleData,
  onValidate,
  onEdit,
  onPrint,
  onDownload
}) => {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      const printContent = document.getElementById('receipt-content');
      if (printContent) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Reçu - ${saleData.sale_number || saleData.id}</title>
                <style>
                  body { 
                    font-family: Arial, sans-serif; 
                    margin: 0; 
                    padding: 20px;
                    background: white;
                  }
                  @media print {
                    body { margin: 0; padding: 10px; }
                    .no-print { display: none !important; }
                  }
                  .receipt-content {
                    max-width: 400px;
                    margin: 0 auto;
                  }
                </style>
              </head>
              <body>
                <div class="receipt-content">
                  ${printContent.innerHTML}
                </div>
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
          printWindow.close();
        }
      }
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      const receiptContent = document.getElementById('receipt-content');
      if (receiptContent) {
        const blob = new Blob([`
          <html>
            <head>
              <title>Reçu - ${saleData.sale_number || saleData.id}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 20px;
                  background: white;
                }
                .receipt-content {
                  max-width: 400px;
                  margin: 0 auto;
                }
              </style>
            </head>
            <body>
              <div class="receipt-content">
                ${receiptContent.innerHTML}
              </div>
            </body>
          </html>
        `], { type: 'text/html' });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recu-${saleData.sale_number || saleData.id}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Reçu de vente
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-1" />
                Modifier
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-1" />
                Imprimer
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-1" />
                Télécharger
              </Button>
              <Button onClick={onValidate} className="bg-green-600 hover:bg-green-700">
                <Check className="w-4 h-4 mr-1" />
                Valider
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div id="receipt-content" className="mt-6">
          <Receipt
            sale={saleData}
            showActions={false}
            className="border border-gray-200"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptPreview;
