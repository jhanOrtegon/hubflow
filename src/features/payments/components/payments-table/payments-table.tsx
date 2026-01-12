'use client';

import { Payment } from '@/types/payment';
import { createColumns, PaymentActions } from './columns';
import { DataTable } from './data-table';

interface PaymentsTableProps {
  data: Payment[];
  onView?: (payment: Payment) => void;
  onEdit?: (payment: Payment) => void;
  onDelete?: (payment: Payment) => void;
  onFilteredDataChange?: (filteredData: Payment[]) => void;
}

export function PaymentsTable({ 
  data, 
  onView,
  onEdit,
  onDelete,
  onFilteredDataChange
}: PaymentsTableProps) {
  const actions: PaymentActions = {
    onView,
    onEdit,
    onDelete
  };

  const columns = createColumns(actions);

  return (
    <div className="space-y-4">
      <DataTable 
        columns={columns} 
        data={data} 
        onFilteredDataChange={onFilteredDataChange}
      />
    </div>
  );
}
