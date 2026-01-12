'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Payment } from '@/types/payment';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, ArrowUpDown, Eye, Edit, Trash, TrendingUp, TrendingDown } from 'lucide-react';
import { format, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipos para las acciones
export type PaymentActions = {
  onView?: (payment: Payment) => void;
  onEdit?: (payment: Payment) => void;
  onDelete?: (payment: Payment) => void;
};

// Helper para formatear moneda en COP
function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Helper para formatear fecha
function formatDate(date: Date) {
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: es });
}

// Configuración de badges por estado (con colores sutiles)
const statusConfig = {
  pending: { 
    label: 'Pendiente', 
    variant: 'secondary' as const,
    className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800'
  },
  completed: { 
    label: 'Completado', 
    variant: 'outline' as const,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
  }
};

// Configuración de métodos (con iconos)
const methodConfig = {
  efectivo: { label: 'Efectivo', icon: '💵' },
  tarjeta_debito: { label: 'Tarjeta Débito', icon: '💳' },
  tarjeta_credito: { label: 'Tarjeta Crédito', icon: '💳' },
  transferencia: { label: 'Transferencia', icon: '🔄' },
  nequi: { label: 'Nequi', icon: '📱' },
  daviplata: { label: 'Daviplata', icon: '📱' },
  otro: { label: 'Otro', icon: '📋' }
};

// Configuración de tipos (con dot indicators e iconos de tendencia)
const typeConfig = {
  ingreso: { 
    label: 'Ingreso', 
    variant: 'outline' as const,
    dotColor: 'bg-emerald-500',
    className: 'border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400',
    icon: TrendingUp
  },
  gasto: { 
    label: 'Gasto', 
    variant: 'outline' as const,
    dotColor: 'bg-rose-500',
    className: 'border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400',
    icon: TrendingDown
  }
};

// Categorías (con iconos)
const categoryConfig: Record<string, { label: string; icon: string }> = {
  alimentacion: { label: 'Alimentación', icon: '🍽️' },
  transporte: { label: 'Transporte', icon: '🚗' },
  servicios: { label: 'Servicios', icon: '⚡' },
  salud: { label: 'Salud', icon: '🏥' },
  entretenimiento: { label: 'Entretenimiento', icon: '🎬' },
  educacion: { label: 'Educación', icon: '📚' },
  vivienda: { label: 'Vivienda', icon: '🏠' },
  ropa: { label: 'Ropa', icon: '👕' },
  tecnologia: { label: 'Tecnología', icon: '💻' },
  deporte: { label: 'Deporte', icon: '⚽' },
  mascotas: { label: 'Mascotas', icon: '🐾' },
  ahorro: { label: 'Ahorro', icon: '💰' },
  prestamo: { label: 'Préstamo', icon: '🤝' },
  otro: { label: 'Otro', icon: '📦' }
};

export function createColumns(actions?: PaymentActions): ColumnDef<Payment>[] {
  return [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => (
      <div className="font-mono text-xs">{row.getValue('id')}</div>
    )
  },
  {
    accessorKey: 'type',
    header: 'Tipo',
    cell: ({ row }) => {
      const type = row.getValue('type') as 'ingreso' | 'gasto';
      const config = typeConfig[type];
      const IconComponent = config.icon;
      return (
        <Badge variant={config.variant} className={config.className}>
          <IconComponent className="mr-1.5 h-3.5 w-3.5" />
          {config.label}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Monto
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = row.getValue('amount') as number;
      return (
        <div className="font-semibold tabular-nums">
          {formatCurrency(amount)}
        </div>
      );
    }
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => {
      const status = row.getValue('status') as keyof typeof statusConfig;
      const config = statusConfig[status];
      return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
  },
  {
    accessorKey: 'method',
    header: 'Método',
    cell: ({ row }) => {
      const method = row.getValue('method') as keyof typeof methodConfig;
      const config = methodConfig[method];
      return (
        <div className="text-sm flex items-center gap-1.5">
          <span className="text-base">{config.icon}</span>
          <span>{config.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
  },
  {
    accessorKey: 'category',
    header: 'Categoría',
    cell: ({ row }) => {
      const category = row.getValue('category') as string;
      const config = categoryConfig[category];
      if (config) {
        return (
          <div className="text-sm flex items-center gap-1.5">
            <span className="text-base">{config.icon}</span>
            <span>{config.label}</span>
          </div>
        );
      }
      return <div className="text-sm">{category}</div>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
  },
  {
    accessorKey: 'description',
    header: 'Descripción',
    cell: ({ row }) => {
      return (
        <div className="max-w-[300px] truncate text-muted-foreground text-sm">
          {row.getValue('description')}
        </div>
      );
    }
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Fecha
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date;
      return <div className="text-sm">{formatDate(date)}</div>;
    },
    filterFn: (row, id, value) => {
      // Si no hay valor de filtro, mostrar todas las filas
      if (!value) return true;
      
      // Si value es un objeto con start y end (rango de fechas)
      if (typeof value === 'object' && value.start && value.end) {
        const rowDate = row.getValue(id);
        let dateObj: Date;
        
        if (typeof rowDate === 'string') {
          dateObj = new Date(rowDate);
        } else if (rowDate instanceof Date) {
          dateObj = rowDate;
        } else {
          dateObj = new Date(rowDate as string | number);
        }
        
        // Validar que la fecha sea válida
        if (isNaN(dateObj.getTime())) {
          return false;
        }
        
        return isWithinInterval(dateObj, { start: value.start, end: value.end });
      }
      
      return true;
    }
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => actions?.onView?.(payment)}>
              <Eye className="mr-2 h-4 w-4" />
              Ver detalles
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => actions?.onEdit?.(payment)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => actions?.onDelete?.(payment)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];
}

// Mantener exportación legacy para compatibilidad
export const columns = createColumns();
