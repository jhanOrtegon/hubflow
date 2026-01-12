'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { paymentsApi } from '@/features/payments/api/payments-api';
import type { Payment, ExpenseCategory } from '@/types/payment';

interface EditPaymentDialogProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditPaymentDialog({ 
  payment,
  open, 
  onOpenChange, 
  onSuccess
}: EditPaymentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: 0,
    status: 'completed' as 'pending' | 'completed',
    method: 'efectivo' as Payment['method'],
    type: 'gasto' as 'ingreso' | 'gasto',
    description: '',
    category: 'otro' as ExpenseCategory,
    notes: '',
  });

  // Actualizar formData cuando cambia el payment
  useEffect(() => {
    if (payment) {
      setFormData({
        amount: payment.amount,
        status: payment.status,
        method: payment.method,
        type: payment.type,
        description: payment.description,
        category: payment.category || 'otro',
        notes: payment.notes || '',
      });
    }
  }, [payment]);

  const formatNumber = (value: number) => {
    if (!value) return '';
    return new Intl.NumberFormat('es-CO').format(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!payment) return;
    
    if (formData.amount <= 0) {
      alert('El monto debe ser mayor a 0');
      return;
    }
    if (!formData.description) {
      alert('La descripción es requerida');
      return;
    }

    setIsSubmitting(true);
    try {
      await paymentsApi.updatePayment(payment.id, {
        ...formData,
        currency: 'COP',
      });
      
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error al actualizar el pago:', error);
      alert('Error al actualizar el pago');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Transacción</DialogTitle>
          <DialogDescription>
            Modifica la información de la transacción
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5 w-full">
              <Label htmlFor="type">Tipo</Label>
              <Select 
                value={formData.type}
                onValueChange={(value: 'ingreso' | 'gasto') => 
                  setFormData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ingreso">Ingreso</SelectItem>
                  <SelectItem value="gasto">Gasto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 w-full">
              <Label htmlFor="category">Categoría</Label>
              <Select 
                value={formData.category}
                onValueChange={(value: ExpenseCategory) => 
                  setFormData(prev => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alimentacion">🍽️ Alimentación</SelectItem>
                  <SelectItem value="transporte">🚗 Transporte</SelectItem>
                  <SelectItem value="servicios">⚡ Servicios</SelectItem>
                  <SelectItem value="salud">🏥 Salud</SelectItem>
                  <SelectItem value="entretenimiento">🎬 Entretenimiento</SelectItem>
                  <SelectItem value="educacion">📚 Educación</SelectItem>
                  <SelectItem value="vivienda">🏠 Vivienda</SelectItem>
                  <SelectItem value="ropa">👕 Ropa</SelectItem>
                  <SelectItem value="tecnologia">💻 Tecnología</SelectItem>
                  <SelectItem value="deporte">⚽ Deporte</SelectItem>
                  <SelectItem value="mascotas">🐾 Mascotas</SelectItem>
                  <SelectItem value="ahorro">💰 Ahorro</SelectItem>
                  <SelectItem value="prestamo">🤝 Préstamo</SelectItem>
                  <SelectItem value="otro">📦 Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 w-full">
              <Label htmlFor="method">Método</Label>
              <Select 
                value={formData.method}
                onValueChange={(value: any) => 
                  setFormData(prev => ({ ...prev, method: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">💵 Efectivo</SelectItem>
                  <SelectItem value="tarjeta_debito">💳 Tarjeta Débito</SelectItem>
                  <SelectItem value="tarjeta_credito">💳 Tarjeta Crédito</SelectItem>
                  <SelectItem value="transferencia">🔄 Transferencia</SelectItem>
                  <SelectItem value="nequi">📱 Nequi</SelectItem>
                  <SelectItem value="daviplata">📱 Daviplata</SelectItem>
                  <SelectItem value="otro">📋 Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 w-full">
              <Label htmlFor="status">Estado</Label>
              <Select 
                value={formData.status}
                onValueChange={(value: 'pending' | 'completed') => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amount">Monto (COP)</Label>
            <Input
              id="amount"
              placeholder="0"
              value={formData.amount ? formatNumber(formData.amount) : ''}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '');
                setFormData(prev => ({ ...prev, amount: raw ? parseFloat(raw) : 0 }));
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descripción</Label>
            <Textarea 
              id="description"
              placeholder="Ej: Almuerzo en restaurante, Pago de servicios, etc."
              rows={3}
              className="resize-none"
              value={formData.description}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, description: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notas adicionales (opcional)</Label>
            <Textarea 
              id="notes"
              placeholder="Información extra..."
              rows={2}
              className="resize-none"
              value={formData.notes}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, notes: e.target.value }))
              }
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
