
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download, Printer, Edit, Check } from 'lucide-react';

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Customer {
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}

interface StoreInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
}

interface ReceiptProps {
  sale: {
    id: string;
    sale_number?: string;
    date: string;
    customer: Customer | null;
    items: ReceiptItem[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paymentMethod: string;
    notes?: string;
    status?: string;
  };
  storeInfo?: StoreInfo;
  onPrint?: () => void;
  onDownload?: () => void;
  onEdit?: () => void;
  onValidate?: () => void;
  showActions?: boolean;
  className?: string;
}

const Receipt = ({ 
  sale, 
  storeInfo = {
    name: 'Miabé Stock',
    address: 'Abidjan, Côte d\'Ivoire',
    phone: '+225 XX XX XX XX',
    email: 'contact@miabestock.com',
    website: 'www.miabestock.com'
  },
  onPrint, 
  onDownload, 
  onEdit, 
  onValidate,
  showActions = true,
  className = '' 
}: ReceiptProps) => {
  const getCustomerName = () => {
    if (!sale.customer) {
      return 'Client anonyme';
    }
    
    if (sale.customer.firstName && sale.customer.lastName) {
      return `${sale.customer.firstName} ${sale.customer.lastName}`;
    }
    return sale.customer.name || 'Client anonyme';
  };

  const getPaymentMethodLabel = () => {
    switch (sale.paymentMethod) {
      case 'cash': return 'Espèces';
      case 'mobile': return 'Mobile Money';
      case 'card': return 'Carte bancaire';
      case 'credit': return 'Crédit';
      default: return sale.paymentMethod;
    }
  };

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0';
    }
    return value.toLocaleString();
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className={`bg-white text-black max-w-md mx-auto p-6 print:p-4 print:shadow-none ${className}`}>
      {/* En-tête simplifié */}
      <div className="text-center mb-6 border-b border-gray-300 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">{storeInfo.name}</h1>
        <p className="text-sm text-gray-600 mt-1">{storeInfo.address}</p>
        <p className="text-sm text-gray-600">{storeInfo.phone}</p>
      </div>

      {/* Informations de la vente */}
      <div className="mb-4 text-sm space-y-1">
        <div className="flex justify-between">
          <span className="font-medium">N° Vente:</span>
          <span className="font-bold">{sale.sale_number || sale.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Date:</span>
          <span>{new Date(sale.date).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Client:</span>
          <span>{getCustomerName()}</span>
        </div>
        {sale.customer?.phone && (
          <div className="flex justify-between">
            <span className="font-medium">Téléphone:</span>
            <span>{sale.customer.phone}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="font-medium">Paiement:</span>
          <span>{getPaymentMethodLabel()}</span>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Articles */}
      <div className="mb-4">
        <h3 className="font-bold mb-3">Articles</h3>
        <div className="space-y-2">
          {(sale.items || []).map((item, index) => (
            <div key={index} className="text-sm">
              <div className="flex justify-between font-medium">
                <span>{item.name || 'Article inconnu'}</span>
                <span>{formatCurrency(item.total)} F</span>
              </div>
              <div className="flex justify-between text-gray-600 text-xs">
                <span>{item.quantity || 0} x {formatCurrency(item.price)} F</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Totaux */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Sous-total:</span>
          <span>{formatCurrency(sale.subtotal)} F</span>
        </div>
        
        {(sale.discount || 0) > 0 && (
          <div className="flex justify-between text-red-600">
            <span>Remise:</span>
            <span>-{formatCurrency(sale.discount)} F</span>
          </div>
        )}
        
        {(sale.tax || 0) > 0 && (
          <div className="flex justify-between">
            <span>TVA:</span>
            <span>{formatCurrency(sale.tax)} F</span>
          </div>
        )}
        
        <Separator className="my-2" />
        
        <div className="flex justify-between text-lg font-bold">
          <span>TOTAL:</span>
          <span>{formatCurrency(sale.total)} F CFA</span>
        </div>
      </div>

      {/* Notes */}
      {sale.notes && (
        <>
          <Separator className="my-4" />
          <div className="text-sm">
            <span className="font-medium">Notes: </span>
            <span className="text-gray-600">{sale.notes}</span>
          </div>
        </>
      )}

      {/* Pied de page */}
      <Separator className="my-4" />
      <div className="text-center text-xs text-gray-600 space-y-1">
        <p className="font-bold">✨ Merci pour votre confiance ! ✨</p>
        <p>Conservez ce reçu pour toute réclamation</p>
        <p>Généré le {new Date().toLocaleString('fr-FR')}</p>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="print:hidden mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2 justify-center">
            {sale.status === 'pending' && onValidate && (
              <Button onClick={onValidate} size="sm" className="bg-green-600 hover:bg-green-700">
                <Check className="w-4 h-4 mr-1" />
                Valider
              </Button>
            )}
            {onEdit && sale.status !== 'completed' && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-1" />
                Modifier
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-1" />
              Imprimer
            </Button>
            {onDownload && (
              <Button variant="outline" size="sm" onClick={onDownload}>
                <Download className="w-4 h-4 mr-1" />
                PDF
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Receipt;
