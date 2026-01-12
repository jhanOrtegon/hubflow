'use client';

import { Card } from '@/components/ui/card';
import { PaymentStats } from '@/types/payment';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Clock, 
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentStatsCardsProps {
  stats: PaymentStats;
}

export function PaymentStatsCards({ stats }: PaymentStatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatCompact = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return formatCurrency(amount);
  };

  const statsConfig = [
    {
      title: 'Ingresos',
      value: formatCompact(stats.totalIngresos),
      fullValue: formatCurrency(stats.totalIngresos),
      icon: TrendingUp,
      iconColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100/50 dark:bg-green-950/50',
      borderColor: 'border-green-200 dark:border-green-900'
    },
    {
      title: 'Gastos',
      value: formatCompact(stats.totalGastos),
      fullValue: formatCurrency(stats.totalGastos),
      icon: TrendingDown,
      iconColor: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100/50 dark:bg-red-950/50',
      borderColor: 'border-red-200 dark:border-red-900'
    },
    {
      title: 'Balance',
      value: formatCompact(stats.balance),
      fullValue: formatCurrency(stats.balance),
      icon: Wallet,
      iconColor: stats.balance >= 0 
        ? 'text-emerald-600 dark:text-emerald-400' 
        : 'text-red-600 dark:text-red-400',
      bgColor: stats.balance >= 0 
        ? 'bg-emerald-100/50 dark:bg-emerald-950/50' 
        : 'bg-red-100/50 dark:bg-red-950/50',
      borderColor: stats.balance >= 0 
        ? 'border-emerald-200 dark:border-emerald-900' 
        : 'border-red-200 dark:border-red-900'
    },
    {
      title: 'Pendientes',
      value: formatCompact(stats.gastoPendiente),
      fullValue: formatCurrency(stats.gastoPendiente),
      icon: Clock,
      iconColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100/50 dark:bg-amber-950/50',
      borderColor: 'border-amber-200 dark:border-amber-900'
    },
    {
      title: 'Completadas',
      value: stats.transaccionesCompletadas.toString(),
      fullValue: `${stats.transaccionesCompletadas} transacciones`,
      icon: CheckCircle2,
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100/50 dark:bg-blue-950/50',
      borderColor: 'border-blue-200 dark:border-blue-900'
    }
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
      {statsConfig.map((stat, index) => (
        <Card 
          key={index}
          className={cn(
            'group relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0',
            'bg-linear-to-br from-background to-muted/20'
          )}
          title={stat.fullValue}
        >
          {/* Borde decorativo animado */}
          <div className={cn(
            'absolute top-0 left-0 w-full h-1 transition-all duration-300 group-hover:h-1.5',
            stat.bgColor
          )} />
          
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={cn(
                'rounded-xl p-2.5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3',
                stat.bgColor
              )}>
                <stat.icon className={cn('h-5 w-5', stat.iconColor)} strokeWidth={2.5} />
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground/70">
                  {stat.title}
                </p>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-2xl font-bold tracking-tight bg-linear-to-br from-foreground to-foreground/70 bg-clip-text">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {stat.fullValue}
              </p>
            </div>
          </div>

          {/* Efecto de brillo en hover */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </Card>
      ))}
    </div>
  );
}
