import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Payment, PaymentStats } from '@/types/payment';
import { auth } from '@clerk/nextjs/server';

const DATA_DIR = path.join(process.cwd(), 'data', 'users');

function getUserDataFile(userId: string): string {
  return path.join(DATA_DIR, `${userId}.json`);
}

async function readPayments(userId: string): Promise<Payment[]> {
  try {
    const userFile = getUserDataFile(userId);
    const data = await fs.readFile(userFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    const payments = await readPayments(userId);
    
    const completed = payments.filter(p => p.status === 'completed');
    const totalIngresos = completed
      .filter(p => p.type === 'ingreso')
      .reduce((sum, p) => sum + p.amount, 0);
    const totalGastos = completed
      .filter(p => p.type === 'gasto')
      .reduce((sum, p) => sum + p.amount, 0);
    const gastoPendiente = payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const stats: PaymentStats = {
      totalIngresos: Math.round(totalIngresos),
      totalGastos: Math.round(totalGastos),
      balance: Math.round(totalIngresos - totalGastos),
      gastoPendiente: Math.round(gastoPendiente),
      transaccionesCompletadas: completed.length
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error calculating stats:', error);
    return NextResponse.json({ error: 'Error al calcular estadísticas' }, { status: 500 });
  }
}
