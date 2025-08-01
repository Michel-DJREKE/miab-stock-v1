
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Filter } from 'lucide-react';

interface PeriodFilterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilter: (filter: any) => void;
  currentFilter?: any;
}

const PeriodFilter = ({ open, onOpenChange, onApplyFilter, currentFilter }: PeriodFilterProps) => {
  const [filterType, setFilterType] = useState(currentFilter?.type || 'month');
  const [startDate, setStartDate] = useState(currentFilter?.startDate || '');
  const [endDate, setEndDate] = useState(currentFilter?.endDate || '');
  const [month, setMonth] = useState(currentFilter?.month || new Date().getMonth() + 1);
  const [year, setYear] = useState(currentFilter?.year || new Date().getFullYear());

  const handleApply = () => {
    let filter: any = { type: filterType };

    switch (filterType) {
      case 'today':
        filter.date = new Date().toISOString().split('T')[0];
        break;
      case 'week':
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
        filter.startDate = startOfWeek.toISOString().split('T')[0];
        filter.endDate = endOfWeek.toISOString().split('T')[0];
        break;
      case 'month':
        filter.month = month;
        filter.year = year;
        break;
      case 'year':
        filter.year = year;
        break;
      case 'custom':
        filter.startDate = startDate;
        filter.endDate = endDate;
        break;
      case 'last6months':
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        filter.startDate = sixMonthsAgo.toISOString().split('T')[0];
        filter.endDate = new Date().toISOString().split('T')[0];
        break;
      case 'last12months':
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        filter.startDate = twelveMonthsAgo.toISOString().split('T')[0];
        filter.endDate = new Date().toISOString().split('T')[0];
        break;
    }

    onApplyFilter(filter);
    onOpenChange(false);
  };

  const handleReset = () => {
    setFilterType('month');
    setStartDate('');
    setEndDate('');
    setMonth(new Date().getMonth() + 1);
    setYear(new Date().getFullYear());
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Sélectionner la période
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filter Type Selection */}
          <div>
            <Label className="text-base font-semibold">Type de période</Label>
            <div className="mt-2 space-y-2">
              {[
                { value: 'today', label: 'Aujourd\'hui' },
                { value: 'week', label: 'Cette semaine' },
                { value: 'month', label: 'Ce mois' },
                { value: 'year', label: 'Cette année' },
                { value: 'last6months', label: '6 derniers mois' },
                { value: 'last12months', label: '12 derniers mois' },
                { value: 'custom', label: 'Période personnalisée' }
              ].map((option) => (
                <Card
                  key={option.value}
                  className={`cursor-pointer transition-colors ${
                    filterType === option.value ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setFilterType(option.value)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        checked={filterType === option.value}
                        onChange={() => setFilterType(option.value)}
                        className="w-4 h-4"
                      />
                      <span className="font-medium">{option.label}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Month Selection */}
          {filterType === 'month' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="month">Mois</Label>
                <select
                  id="month"
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="year-month">Année</Label>
                <select
                  id="year-month"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Year Selection */}
          {filterType === 'year' && (
            <div>
              <Label htmlFor="year-only">Année</Label>
              <select
                id="year-only"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}

          {/* Custom Date Range */}
          {filterType === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Date de début</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate">Date de fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleReset}>
              Réinitialiser
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button onClick={handleApply}>
                Appliquer
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PeriodFilter;
