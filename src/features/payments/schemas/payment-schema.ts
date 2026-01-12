import { z } from 'zod';

export const paymentFormSchema = z.object({
  amount: z
    .number({ message: 'El monto debe ser un número' })
    .positive('El monto debe ser mayor a 0')
    .max(999999999, 'El monto es demasiado alto'),
  
  status: z.enum(['completed', 'pending'], {
    message: 'El estado es requerido'
  }),
  
  method: z.enum(
    ['efectivo', 'tarjeta_debito', 'tarjeta_credito', 'transferencia', 'nequi', 'daviplata', 'otro'],
    {
      message: 'El método de pago es requerido'
    }
  ),
  
  type: z.enum(['ingreso', 'gasto'], {
    message: 'El tipo de transacción es requerido'
  }),
  
  description: z
    .string({ message: 'La descripción es requerida' })
    .min(3, 'La descripción debe tener al menos 3 caracteres')
    .max(200, 'La descripción es demasiado larga'),
  
  category: z.enum(
    [
      'alimentacion',
      'transporte',
      'servicios',
      'salud',
      'entretenimiento',
      'educacion',
      'vivienda',
      'ropa',
      'tecnologia',
      'deporte',
      'mascotas',
      'ahorro',
      'otro'
    ],
    {
      message: 'La categoría es requerida'
    }
  ),
  
  notes: z
    .string()
    .max(500, 'Las notas son demasiado largas')
    .optional()
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;

