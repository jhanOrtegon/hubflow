'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Payment } from '@/types/payment';

interface DeletePaymentDialogProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
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

export function DeletePaymentDialog({ 
  payment, 
  open, 
  onOpenChange, 
  onConfirm,
  isDeleting 
}: DeletePaymentDialogProps) {
  if (!payment) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el siguiente pago:
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="my-4 rounded-lg border p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">ID:</span>
            <span className="text-sm font-mono">{payment.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Descripción:</span>
            <span className="text-sm font-medium">{payment.description}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Monto:</span>
            <span className="text-sm font-bold">{formatCurrency(payment.amount)}</span>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
