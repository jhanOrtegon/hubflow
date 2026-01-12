import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Redirigiendo...'
};

interface PaymentsPageProps {
  searchParams: Promise<{
    page?: string;
    perPage?: string;
    status?: string;
    method?: string;
    type?: string;
    category?: string;
    search?: string;
  }>;
}

export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
  // Redirigir a la nueva ruta de finanzas
  const params = await searchParams;
  const queryString = new URLSearchParams(params as any).toString();
  const redirectUrl = queryString 
    ? `/dashboard/finance?${queryString}` 
    : '/dashboard/finance';
  
  redirect(redirectUrl);
}
