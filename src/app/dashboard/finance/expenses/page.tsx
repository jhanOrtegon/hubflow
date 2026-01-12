'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { paymentsApi } from '@/features/payments/api/payments-api';
import { PaymentsTable } from '@/features/payments/components/payments-table/payments-table';
import { buttonVariants } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { IconPlus, IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { Card, CardHeader, CardDescription, CardTitle, CardAction, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Payment, PaymentStats } from '@/types/payment';
import { PaymentDetailsDialog } from '@/features/payments/components/payment-details-dialog';
import { DeletePaymentDialog } from '@/features/payments/components/delete-payment-dialog';
import { CreatePaymentDialog } from '@/features/payments/components/create-payment-dialog';
import { EditPaymentDialog } from '@/features/payments/components/edit-payment-dialog';
import { StatsCardsSkeleton, PaymentsTableSkeleton } from '@/features/payments/components/skeletons';

export default function ExpensesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
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
            type: 'gasto',
            category: searchParams.get('category') || undefined,
            search: searchParams.get('search') || undefined
          }),
          paymentsApi.getStats()
        ]);

        setPayments(paymentsData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [searchParams]);

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
          type: 'gasto',
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
        type: 'gasto',
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
      <PageContainer scrollable pageTitle="Gastos" pageDescription="Rastrea y gestiona tus transacciones de gasto">
        <div className="space-y-4">
          <StatsCardsSkeleton />
          <PaymentsTableSkeleton />
        </div>
      </PageContainer>
    );
  }

  const completedCount = payments.filter(p => p.status === 'completed').length;
  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const completedAmount = payments
    .filter(p => p.status === 'completed')
    .reduce((acc, p) => acc + p.amount, 0);

  return (
    <PageContainer
      scrollable
      pageTitle="Gastos"
      pageDescription="Rastrea y gestiona tus transacciones de gasto"
      pageHeaderAction={
        <div className="flex gap-2">
          <Link
            href="/dashboard/finance"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
          <Button
            size="sm"
            onClick={() => setShowCreate(true)}
          >
            <IconPlus className="mr-2 h-4 w-4" /> Nuevo Gasto
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs md:grid-cols-3'>
          
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Total Gastos</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 0
                }).format(stats.totalGastos)}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  Todo el tiempo
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Total gastado
              </div>
              <div className='text-muted-foreground'>
                {payments.length} transacciones
              </div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Completados</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 0
                }).format(completedAmount)}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  {completedCount} elementos
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Gastos pagados
              </div>
              <div className='text-muted-foreground'>
                Procesados exitosamente
              </div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Pendientes</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 0
                }).format(stats.gastoPendiente)}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  {pendingCount} elementos
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                En espera de pago
              </div>
              <div className='text-muted-foreground'>
                Acción requerida
              </div>
            </CardFooter>
          </Card>

        </div>

        <PaymentsTable 
          data={payments} 
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
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
        defaultType="gasto"
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
