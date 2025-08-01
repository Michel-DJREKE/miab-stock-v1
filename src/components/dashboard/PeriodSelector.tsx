
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronDown, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { DateFilter } from '@/hooks/useDashboardStats';

interface PeriodSelectorProps {
  currentPeriod: DateFilter['period'];
  onPeriodChange: (period: DateFilter['period']) => void;
}

const periods = [
  { value: 'today', label: "Aujourd'hui", icon: '📅' },
  { value: 'week', label: 'Cette semaine', icon: '📊' },
  { value: 'month', label: 'Ce mois', icon: '📈' },
  { value: 'quarter', label: 'Ce trimestre', icon: '📉' },
  { value: 'year', label: 'Cette année', icon: '🗓️' },
  { value: 'last7days', label: '7 derniers jours', icon: '⏰' },
  { value: 'last30days', label: '30 derniers jours', icon: '📆' },
  { value: 'last90days', label: '90 derniers jours', icon: '🗂️' },
];

export const PeriodSelector = ({ currentPeriod, onPeriodChange }: PeriodSelectorProps) => {
  const currentPeriodLabel = periods.find(p => p.value === currentPeriod)?.label || 'Ce mois';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 min-w-[160px]">
          <Calendar className="w-4 h-4" />
          {currentPeriodLabel}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1 text-sm font-medium text-muted-foreground">
          Sélectionner une période
        </div>
        <DropdownMenuSeparator />
        {periods.map((period) => (
          <DropdownMenuItem
            key={period.value}
            onClick={() => onPeriodChange(period.value as DateFilter['period'])}
            className="flex items-center gap-3 cursor-pointer"
          >
            <span className="text-lg">{period.icon}</span>
            <span className={currentPeriod === period.value ? 'font-medium' : ''}>
              {period.label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
