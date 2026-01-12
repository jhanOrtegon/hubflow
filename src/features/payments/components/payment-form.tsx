// @ts-nocheck
'use client';

import { useForm, type SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentFormSchema, type PaymentFormValues } from '../schemas/payment-schema';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface PaymentFormProps {
  defaultValues?: Partial<PaymentFormValues>;
  onSubmit: (data: PaymentFormValues) => Promise<void>;
  onCancel?: () => void;
}

export function PaymentForm({ defaultValues, onSubmit, onCancel }: PaymentFormProps) {
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      status: 'completed',
      type: 'gasto',
      method: 'efectivo',
      category: 'otro',
      ...defaultValues // Los valores pasados como prop sobrescriben los defaults
    }
  });

  const handleSubmit: SubmitHandler<PaymentFormValues> = async (data) => {
    try {
      await onSubmit(data);
      toast.success('Transacción guardada exitosamente');
      // Resetear al estado inicial con los valores por defecto correctos
      form.reset({
        status: 'completed',
        type: 'gasto',
        method: 'efectivo',
        category: 'otro',
        ...defaultValues // Mantener los valores específicos (ingreso/gasto)
      });
    } catch (error) {
      toast.error('Error al guardar la transacción');
      console.error(error);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        
        {/* Sección Principal - 3 columnas */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <div className="h-8 w-1 bg-primary rounded-full" />
            <h3 className="text-lg font-semibold">Información Principal</h3>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Tipo de Transacción */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={!!defaultValues?.type} // Deshabilitar si viene predefinido
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ingreso">💰 Ingreso</SelectItem>
                      <SelectItem value="gasto">💸 Gasto</SelectItem>
                    </SelectContent>
                  </Select>
                  {defaultValues?.type && (
                    <FormDescription className="text-xs">
                      Tipo predefinido para esta sección
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Monto en COP */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => {
                const formatNumber = (value: number | string) => {
                  if (!value) return '';
                  const numValue = typeof value === 'string' ? parseFloat(value.replace(/\D/g, '')) : value;
                  if (isNaN(numValue)) return '';
                  return new Intl.NumberFormat('es-CO').format(numValue);
                };

                const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                  const rawValue = e.target.value.replace(/\D/g, '');
                  const numValue = rawValue ? parseFloat(rawValue) : 0;
                  field.onChange(numValue);
                };

                return (
                  <FormItem>
                    <FormLabel>Monto (COP)</FormLabel>
                    <FormControl>
                      <Input 
                        type="text"
                        placeholder="0" 
                        className="font-semibold text-lg"
                        value={field.value ? formatNumber(field.value) : ''}
                        onChange={handleChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* Estado */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="completed">✅ Completado</SelectItem>
                      <SelectItem value="pending">⏳ Pendiente</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Sección Detalles del Pago */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <div className="h-8 w-1 bg-primary rounded-full" />
            <h3 className="text-lg font-semibold">Detalles del Pago</h3>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Método de Pago */}
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Pago</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar método" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="efectivo">💵 Efectivo</SelectItem>
                      <SelectItem value="tarjeta_debito">💳 Tarjeta Débito</SelectItem>
                      <SelectItem value="tarjeta_credito">💳 Tarjeta Crédito</SelectItem>
                      <SelectItem value="transferencia">🏦 Transferencia</SelectItem>
                      <SelectItem value="nequi">📱 Nequi</SelectItem>
                      <SelectItem value="daviplata">📱 Daviplata</SelectItem>
                      <SelectItem value="otro">🔄 Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categoría */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="alimentacion">🍔 Alimentación</SelectItem>
                      <SelectItem value="transporte">🚗 Transporte</SelectItem>
                      <SelectItem value="servicios">💡 Servicios</SelectItem>
                      <SelectItem value="salud">🏥 Salud</SelectItem>
                      <SelectItem value="entretenimiento">🎮 Entretenimiento</SelectItem>
                      <SelectItem value="educacion">📚 Educación</SelectItem>
                      <SelectItem value="vivienda">🏠 Vivienda</SelectItem>
                      <SelectItem value="ropa">👔 Ropa</SelectItem>
                      <SelectItem value="tecnologia">💻 Tecnología</SelectItem>
                      <SelectItem value="deporte">⚽ Deporte</SelectItem>
                      <SelectItem value="mascotas">🐕 Mascotas</SelectItem>
                      <SelectItem value="ahorro">💰 Ahorro</SelectItem>
                      <SelectItem value="otro">📦 Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Sección Descripción */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <div className="h-8 w-1 bg-primary rounded-full" />
            <h3 className="text-lg font-semibold">Información Adicional</h3>
          </div>

          {/* Descripción */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Ej: Compra en supermercado, almuerzo, gasolina..." 
                    className="resize-none min-h-20" 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notas */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notas (Opcional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Notas adicionales sobre este gasto/ingreso..." 
                    className="resize-none min-h-20" 
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="min-w-[100px]">
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={form.formState.isSubmitting} className="min-w-[100px]">
            {form.formState.isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
      </div>
      </form>
    </FormProvider>
  );
}
