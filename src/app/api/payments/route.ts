import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Payment } from '@/types/payment';
import { auth } from '@clerk/nextjs/server';

// Directorio base para datos de usuarios
const DATA_DIR = path.join(process.cwd(), 'data', 'users');

// Obtener ruta del archivo de un usuario específico
function getUserDataFile(userId: string): string {
  return path.join(DATA_DIR, `${userId}.json`);
}

// Asegurar que el directorio existe
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Leer pagos del archivo del usuario
async function readPayments(userId: string): Promise<Payment[]> {
  try {
    await ensureDataDir();
    const userFile = getUserDataFile(userId);
    const data = await fs.readFile(userFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Si el archivo no existe, retornar array vacío
    return [];
  }
}

// Guardar pagos en el archivo del usuario
async function writePayments(userId: string, payments: Payment[]) {
  await ensureDataDir();
  const userFile = getUserDataFile(userId);
  await fs.writeFile(userFile, JSON.stringify(payments, null, 2), 'utf-8');
}

// GET - Obtener todos los pagos
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    const payments = await readPayments(userId);
    
    // Obtener parámetros de búsqueda
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const method = searchParams.get('method');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    // Filtrar pagos
    let filtered = payments;
    
    if (status) {
      filtered = filtered.filter(p => p.status === status);
    }
    if (type) {
      filtered = filtered.filter(p => p.type === type);
    }
    if (method) {
      filtered = filtered.filter(p => p.method === method);
    }
    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.description.toLowerCase().includes(searchLower) ||
        p.category?.toLowerCase().includes(searchLower)
      );
    }
    
    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Error reading payments:', error);
    return NextResponse.json({ error: 'Error al leer los pagos' }, { status: 500 });
  }
}

// POST - Crear nuevo pago
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    const body = await request.json();
    const payments = await readPayments(userId);
    
    const newPayment: Payment = {
      ...body,
      id: `TRX-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: body.status === 'completed' ? new Date().toISOString() : undefined
    };
    
    // Agregar al inicio del array
    payments.unshift(newPayment);
    
    await writePayments(userId, payments);
    
    return NextResponse.json(newPayment, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Error al crear el pago' }, { status: 500 });
  }
}

// PUT - Actualizar pago
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    const body = await request.json();
    const { id, ...data } = body;
    
    const payments = await readPayments(userId);
    const index = payments.findIndex(p => p.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 });
    }
    
    payments[index] = {
      ...payments[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    await writePayments(userId, payments);
    
    return NextResponse.json(payments[index]);
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json({ error: 'Error al actualizar el pago' }, { status: 500 });
  }
}

// DELETE - Eliminar pago
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }
    
    const payments = await readPayments(userId);
    const filtered = payments.filter(p => p.id !== id);
    
    await writePayments(userId, filtered);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json({ error: 'Error al eliminar el pago' }, { status: 500 });
  }
}
