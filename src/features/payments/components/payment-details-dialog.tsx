'use client';

import { Payment } from '@/types/payment';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PaymentDetailsDialogProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper para formatear moneda
function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Configuración de estados
const statusConfig = {
  pending: { 
    label: 'Pendiente', 
    className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400'
  },
  completed: { 
    label: 'Completado', 
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400'
  }
};

// Configuración de tipos
const typeConfig = {
  ingreso: { 
    label: 'Ingreso', 
    className: 'border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
  },
  gasto: { 
    label: 'Gasto', 
    className: 'border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400'
  }
};

// Configuración de métodos
const methodConfig: Record<string, { label: string; icon: string }> = {
  efectivo: { label: 'Efectivo', icon: '💵' },
  tarjeta_debito: { label: 'Tarjeta Débito', icon: '💳' },
  tarjeta_credito: { label: 'Tarjeta Crédito', icon: '💳' },
  transferencia: { label: 'Transferencia', icon: '🔄' },
  nequi: { label: 'Nequi', icon: '📱' },
  daviplata: { label: 'Daviplata', icon: '📱' },
  otro: { label: 'Otro', icon: '📋' }
};

// Configuración de categorías
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
  otro: { label: 'Otro', icon: '📦' }
};

export function PaymentDetailsDialog({ payment, open, onOpenChange }: PaymentDetailsDialogProps) {
  if (!payment) return null;

  const status = statusConfig[payment.status];
  const type = typeConfig[payment.type];
  const method = methodConfig[payment.method];
  const category = payment.category ? categoryConfig[payment.category] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalles del Pago</DialogTitle>
          <DialogDescription>
            ID: {payment.id}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Monto */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Monto</label>
            <div className="text-2xl font-bold">{formatCurrency(payment.amount)}</div>
          </div>

          {/* Tipo y Estado */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Tipo</label>
              <div>
                <Badge variant="outline" className={type.className}>
                  {type.label}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Estado</label>
              <div>
                <Badge variant="outline" className={status.className}>
                  {status.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Método de Pago */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Método de Pago</label>
            <div className="flex items-center gap-2">
              <span className="text-lg">{method.icon}</span>
              <span>{method.label}</span>
            </div>
          </div>

          {/* Categoría */}
          {category && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Categoría</label>
              <div className="flex items-center gap-2">
                <span className="text-lg">{category.icon}</span>
                <span>{category.label}</span>
              </div>
            </div>
          )}

          {/* Descripción */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Descripción</label>
            <p className="text-sm">{payment.description}</p>
          </div>

          {/* Notas */}
          {payment.notes && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Notas</label>
              <p className="text-sm text-muted-foreground">{payment.notes}</p>
            </div>
          )}

          {/* Fechas */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Creado:</span>
              <span>{format(new Date(payment.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
            </div>
            {payment.completedAt && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completado:</span>
                <span>{format(new Date(payment.completedAt), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
