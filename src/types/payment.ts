// Types para el módulo de gastos personales

export type PaymentStatus = 'completed' | 'pending';
export type PaymentMethod = 
  | 'efectivo' 
  | 'tarjeta_debito' 
  | 'tarjeta_credito' 
  | 'transferencia' 
  | 'nequi' 
  | 'daviplata' 
  | 'otro';
export type PaymentType = 'ingreso' | 'gasto';

// Categorías comunes de gastos personales en Colombia
export type ExpenseCategory = 
  | 'alimentacion'
  | 'transporte'
  | 'servicios'
  | 'salud'
  | 'entretenimiento'
  | 'educacion'
  | 'vivienda'
  | 'ropa'
  | 'tecnologia'
  | 'deporte'
  | 'mascotas'
  | 'ahorro'
  | 'prestamo'
  | 'otro';

export interface Payment {
  id: string;
  amount: number;
  currency: 'COP'; // Fijo en pesos colombianos
  status: PaymentStatus;
  method: PaymentMethod;
  type: PaymentType;
  description: string;
  category: ExpenseCategory;
  notes?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface PaymentFormData {
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  type: PaymentType;
  description: string;
  category: ExpenseCategory;
  notes?: string;
}

export interface PaymentFilters {
  status?: PaymentStatus[];
  method?: PaymentMethod[];
  type?: PaymentType[];
  category?: ExpenseCategory[];
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export interface PaymentStats {
  totalIngresos: number;
  totalGastos: number;
  balance: number;
  gastoPendiente: number;
  transaccionesCompletadas: number;
}
