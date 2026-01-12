// API para finanzas personales usando archivos locales

import { Payment, PaymentStats, type ExpenseCategory } from '@/types/payment';

// Generar datos mock de gastos personales (solo para referencia/testing)
export function generateMockPayments(count: number = 50): Payment[] {
  const statuses = ['completed', 'pending'] as const;
  const methods = ['efectivo', 'tarjeta_debito', 'tarjeta_credito', 'transferencia', 'nequi', 'daviplata', 'otro'] as const;
  const types = ['ingreso', 'gasto'] as const;
  const categories: ExpenseCategory[] = [
    'alimentacion', 'transporte', 'servicios', 'salud', 'entretenimiento', 
    'educacion', 'vivienda', 'ropa', 'tecnologia', 'deporte', 'mascotas', 'ahorro', 'prestamo', 'otro'
  ];
  
  const descriptions = {
    alimentacion: ['Almuerzo', 'Supermercado Éxito', 'Domicilio restaurante', 'Desayuno', 'Mercado'],
    transporte: ['Uber', 'Gasolina', 'Parqueadero', 'Peaje', 'Bus'],
    servicios: ['Luz', 'Agua', 'Internet', 'Netflix', 'Spotify', 'Gas'],
    salud: ['Farmacia', 'Médico', 'EPS', 'Gym'],
    entretenimiento: ['Cine', 'Bar', 'Concierto', 'Videojuegos'],
    educacion: ['Curso online', 'Libros', 'Udemy'],
    vivienda: ['Arriendo', 'Administración', 'Reparaciones'],
    ropa: ['Ropa nueva', 'Zapatos', 'Ropa deportiva'],
    tecnologia: ['Celular', 'Audífonos', 'Accesorios'],
    deporte: ['Gym', 'Deportes', 'Suplementos'],
    mascotas: ['Veterinario', 'Comida para mascota'],
    ahorro: ['Ahorro mensual', 'Inversión'],
    prestamo: ['Préstamo personal', 'Cuota préstamo', 'Pago deuda'],
    otro: ['Varios', 'Otros gastos']
  };

  return Array.from({ length: count }, (_, i) => {
    const createdAt = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const type = Math.random() > 0.25 ? 'gasto' : 'ingreso' as const; // 75% gastos, 25% ingresos
    const category = categories[Math.floor(Math.random() * categories.length)];
    const descOptions = descriptions[category] || ['Otro'];
    
    return {
      id: `TRX-${String(i + 1).padStart(6, '0')}`,
      amount: type === 'gasto' 
        ? Math.round((Math.random() * 500000 + 5000)) // $5,000 - $505,000 COP para gastos
        : Math.round((Math.random() * 5000000 + 100000)), // $100,000 - $5,100,000 COP para ingresos
      currency: 'COP' as const,
      status,
      method: methods[Math.floor(Math.random() * methods.length)],
      type,
      description: type === 'ingreso' 
        ? `Salario/Ingreso ${i + 1}` 
        : descOptions[Math.floor(Math.random() * descOptions.length)],
      category,
      notes: Math.random() > 0.7 ? 'Notas adicionales' : undefined,
      createdAt,
      updatedAt: createdAt,
      completedAt: status === 'completed' ? new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000) : undefined
    };
  });
}

// API functions usando endpoints REST
export const paymentsApi = {
  // Obtener todos los pagos con filtros
  async getPayments(params?: {
    page?: number;
    perPage?: number;
    sort?: string;
    status?: string;
    method?: string;
    type?: string;
    category?: string;
    search?: string;
  }): Promise<{ data: Payment[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.method) queryParams.append('method', params.method);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    
    const response = await fetch(`/api/payments?${queryParams.toString()}`);
    const data: Payment[] = await response.json();
    
    const total = data.length;
    
    // Aplicar paginación en el cliente
    const page = params?.page || 1;
    const perPage = params?.perPage || 10;
    const start = (page - 1) * perPage;
    const end = start + perPage;
    
    return { data: data.slice(start, end), total };
  },

  // Obtener todos sin paginación
  async getAll(params?: {
    status?: string;
    method?: string;
    type?: string;
    category?: string;
    search?: string;
  }): Promise<Payment[]> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.method) queryParams.append('method', params.method);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    
    const response = await fetch(`/api/payments?${queryParams.toString()}`);
    return await response.json();
  },

  // Obtener un pago por ID
  async getPaymentById(id: string): Promise<Payment | null> {
    const response = await fetch(`/api/payments?id=${id}`);
    const payments: Payment[] = await response.json();
    return payments.find(p => p.id === id) || null;
  },

  // Crear nuevo pago
  async createPayment(data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const response = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Error al crear el pago');
    }
    
    return await response.json();
  },

  // Actualizar pago
  async updatePayment(id: string, data: Partial<Payment>): Promise<Payment> {
    const response = await fetch('/api/payments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data })
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar el pago');
    }
    
    return await response.json();
  },

  // Eliminar pago
  async deletePayment(id: string): Promise<void> {
    const response = await fetch(`/api/payments?id=${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar el pago');
    }
  },

  // Obtener estadísticas
  async getStats(): Promise<PaymentStats> {
    const response = await fetch('/api/payments/stats');
    
    if (!response.ok) {
      throw new Error('Error al obtener estadísticas');
    }
    
    return await response.json();
  }
};
