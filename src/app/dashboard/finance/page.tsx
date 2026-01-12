'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { paymentsApi } from '@/features/payments/api/payments-api';
import { PaymentsTable } from '@/features/payments/components/payments-table/payments-table';
import { Button } from '@/components/ui/button';
import { IconPlus, IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import Link from 'next/link';
import { Card, CardHeader, CardDescription, CardTitle, CardAction, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Payment, PaymentStats } from '@/types/payment';
import { PaymentDetailsDialog } from '@/features/payments/components/payment-details-dialog';
import { DeletePaymentDialog } from '@/features/payments/components/delete-payment-dialog';
import { CreatePaymentDialog } from '@/features/payments/components/create-payment-dialog';
import { EditPaymentDialog } from '@/features/payments/components/edit-payment-dialog';
import { StatsCardsSkeleton, PaymentsTableSkeleton } from '@/features/payments/components/skeletons';

export default function FinancePage() {
  const searchParams = useSearchParams();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para los diálogos
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [paymentsData, statsData] = await Promise.all([
          paymentsApi.getAll({
            status: searchParams.get('status') || undefined,
            method: searchParams.get('method') || undefined,
            type: searchParams.get('type') || undefined,
            category: searchParams.get('category') || undefined,
            search: searchParams.get('search') || undefined
          }),
          paymentsApi.getStats()
        ]);

        setPayments(paymentsData);
        setFilteredPayments(paymentsData); // Inicialmente mostrar todos
        setStats(statsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [searchParams]);

  // Calcular estadísticas de los datos filtrados
  const filteredStats = useMemo(() => {
    const ingresos = filteredPayments
      .filter(p => p.type === 'ingreso')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const gastos = filteredPayments
      .filter(p => p.type === 'gasto')
      .reduce((sum, p) => sum + p.amount, 0);
    
    return {
      totalIncome: ingresos,
      totalExpenses: gastos,
      balance: ingresos - gastos,
      transactionCount: filteredPayments.length
    };
  }, [filteredPayments]);

  // Handlers para las acciones
  const handleView = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetails(true);
  };

  const handleEdit = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowEdit(true);
  };

  const handleDelete = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPayment) return;

    setIsDeleting(true);
    try {
      await paymentsApi.deletePayment(selectedPayment.id);
      setShowDelete(false);
      setSelectedPayment(null);
      
      // Recargar datos
      const [paymentsData, statsData] = await Promise.all([
        paymentsApi.getAll({
          status: searchParams.get('status') || undefined,
          method: searchParams.get('method') || undefined,
          type: searchParams.get('type') || undefined,
          category: searchParams.get('category') || undefined,
          search: searchParams.get('search') || undefined
        }),
        paymentsApi.getStats()
      ]);

      setPayments(paymentsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar el pago');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateSuccess = async () => {
    // Recargar datos después de crear
    const [paymentsData, statsData] = await Promise.all([
      paymentsApi.getAll({
        status: searchParams.get('status') || undefined,
        method: searchParams.get('method') || undefined,
        type: searchParams.get('type') || undefined,
        category: searchParams.get('category') || undefined,
        search: searchParams.get('search') || undefined
      }),
      paymentsApi.getStats()
    ]);

    setPayments(paymentsData);
    setStats(statsData);
  };

  if (isLoading || !stats) {
    return (
      <PageContainer scrollable pageTitle="Resumen Financiero" pageDescription="Vista general de ingresos y gastos">
        <div className="space-y-4">
          <StatsCardsSkeleton />
          <PaymentsTableSkeleton />
        </div>
      </PageContainer>
    );
  }

  // Calculate trends usando filteredStats
  const balanceTrend = filteredStats.balance >= 0;
  const ingresosPendientes = filteredPayments.filter(p => p.type === 'ingreso' && p.status === 'pending').length;
  const gastosPendientes = filteredPayments.filter(p => p.type === 'gasto' && p.status === 'pending').length;

  return (
    <PageContainer
      scrollable
      pageTitle="Resumen Financiero"
      pageDescription="Vista general de ingresos y gastos"
      pageHeaderAction={
        <Button
          size="sm"
          onClick={() => setShowCreate(true)}
        >
          <IconPlus className="mr-2 h-4 w-4" /> Nueva Transacción
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Stats Cards - Minimalist Design */}
        <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
          
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Total Balance</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(filteredStats.balance)}
              </CardTitle>
              <CardAction>
                <Badge 
                  variant='outline' 
                  className={balanceTrend ? 'border-green-500 text-green-700 dark:text-green-400' : 'border-red-500 text-red-700 dark:text-red-400'}
                >
                  {balanceTrend ? <IconTrendingUp /> : <IconTrendingDown />}
                  {balanceTrend ? 'Positivo' : 'Negativo'}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Estado financiero actual
              </div>
              <div className='text-muted-foreground'>
                {balanceTrend ? 'Los ingresos superan los gastos' : 'Revisa tus gastos'}
              </div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Total Ingresos</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(filteredStats.totalIncome)}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  {ingresosPendientes} pendiente(s)
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                <Link href="/dashboard/finance/income" className="hover:underline">
                  Ver detalles →
                </Link>
              </div>
              <div className='text-muted-foreground'>
                Todas las transacciones de ingreso
              </div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Total Gastos</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(filteredStats.totalExpenses)}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  {gastosPendientes} pendiente(s)
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                <Link href="/dashboard/finance/expenses" className="hover:underline">
                  Ver detalles →
                </Link>
              </div>
              <div className='text-muted-foreground'>
                Todas las transacciones de gasto
              </div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Total Transacciones</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {payments.length}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  {stats.transaccionesCompletadas} completada(s)
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Actividad general
              </div>
              <div className='text-muted-foreground'>
                {ingresosPendientes + gastosPendientes} pendiente(s) de revisión
              </div>
            </CardFooter>
          </Card>

        </div>

        <PaymentsTable 
          data={payments} 
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onFilteredDataChange={setFilteredPayments}
        />
      </div>

      {/* Diálogo de detalles */}
      <PaymentDetailsDialog
        payment={selectedPayment}
        open={showDetails}
        onOpenChange={setShowDetails}
      />

      {/* Diálogo de confirmación de eliminación */}
      <DeletePaymentDialog
        payment={selectedPayment}
        open={showDelete}
        onOpenChange={setShowDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* Diálogo de creación */}
      <CreatePaymentDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSuccess={handleCreateSuccess}
      />

      {/* Diálogo de edición */}
      <EditPaymentDialog
        payment={selectedPayment}
        open={showEdit}
        onOpenChange={setShowEdit}
        onSuccess={handleCreateSuccess}
      />
    </PageContainer>
  );
}
