'use client';

import { Table } from '@tanstack/react-table';
import { X, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTableViewOptions } from './data-table-view-options';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, subMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const now = new Date();
  const currentMonth = (now.getMonth() + 1).toString();
  const currentYearStr = now.getFullYear().toString();
  const [dateRange, setDateRange] = useState('custom');
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<string>(currentYearStr);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleQuickDateFilter = (value: string) => {
    setDateRange(value);
    let start: Date;
    let end: Date;
    if (value === 'all') {
      table.getColumn('createdAt')?.setFilterValue(undefined);
      return;
    }
    if (value === 'this-week') {
      start = startOfWeek(now, { weekStartsOn: 1 });
      end = endOfWeek(now, { weekStartsOn: 1 });
    } else if (value === 'this-month') {
      start = startOfMonth(now);
      end = endOfMonth(now);
    } else if (value === 'last-month') {
      const lastMonth = subMonths(now, 1);
      start = startOfMonth(lastMonth);
      end = endOfMonth(lastMonth);
    } else if (value === 'custom') {
      const year = parseInt(selectedYear);
      const month = parseInt(selectedMonth);
      start = new Date(year, month - 1, 1);
      end = endOfMonth(start);
    } else {
      return;
    }
    table.getColumn('createdAt')?.setFilterValue({ 
      start, 
      end,
      timestamp: Date.now()
    });
  };
  
  // Set default filter to current month on mount
  useEffect(() => {
    const year = parseInt(currentYearStr);
    const month = parseInt(currentMonth);
    const start = new Date(year, month - 1, 1);
    const end = endOfMonth(start);
    table.getColumn('createdAt')?.setFilterValue({ start, end, timestamp: Date.now() });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCustomMonthFilter = () => {
    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth);
    const start = new Date(year, month - 1, 1);
    const end = endOfMonth(start);
    
    setDateRange('custom');
    table.getColumn('createdAt')?.setFilterValue({ 
      start, 
      end,
      timestamp: Date.now()
    });
    setIsPopoverOpen(false);
  };

  const handleResetFilters = () => {
    table.resetColumnFilters();
    setDateRange('all');
  };

  const getDateLabel = () => {
    if (dateRange === 'all') return 'Todos los periodos';
    if (dateRange === 'this-week') return 'Esta semana';
    if (dateRange === 'this-month') return 'Este mes';
    if (dateRange === 'last-month') return 'Mes anterior';
    if (dateRange === 'custom') {
      const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                         'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      return `${monthNames[parseInt(selectedMonth) - 1]} ${selectedYear}`;
    }
    return 'Seleccionar periodo';
  };

  // Generate years array (from 5 years ago to 2 years in the future)
  const yearNow = new Date().getFullYear();
  const years = Array.from({ length: 8 }, (_, i) => (yearNow - 5 + i).toString());

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Buscar por descripción, categoría..."
            value={(table.getColumn('description')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('description')?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
          {table.getColumn('status') && (
            <DataTableFacetedFilter
              column={table.getColumn('status')}
              title="Estado"
              options={[
                { label: 'Completado', value: 'completed' },
                { label: 'Pendiente', value: 'pending' }
              ]}
            />
          )}
          {table.getColumn('type') && (
            <DataTableFacetedFilter
              column={table.getColumn('type')}
              title="Tipo"
              options={[
                { label: 'Ingreso', value: 'ingreso' },
                { label: 'Gasto', value: 'gasto' }
              ]}
            />
          )}
          {table.getColumn('method') && (
            <DataTableFacetedFilter
              column={table.getColumn('method')}
              title="Método"
              options={[
                { label: 'Efectivo', value: 'efectivo' },
                { label: 'Tarjeta Débito', value: 'tarjeta_debito' },
                { label: 'Tarjeta Crédito', value: 'tarjeta_credito' },
                { label: 'Transferencia', value: 'transferencia' },
                { label: 'Nequi', value: 'nequi' },
                { label: 'Daviplata', value: 'daviplata' },
                { label: 'Otro', value: 'otro' }
              ]}
            />
          )}
          {table.getColumn('category') && (
            <DataTableFacetedFilter
              column={table.getColumn('category')}
              title="Categoría"
              options={[
                { label: 'Alimentación', value: 'alimentacion' },
                { label: 'Transporte', value: 'transporte' },
                { label: 'Servicios', value: 'servicios' },
                { label: 'Salud', value: 'salud' },
                { label: 'Entretenimiento', value: 'entretenimiento' },
                { label: 'Educación', value: 'educacion' },
                { label: 'Vivienda', value: 'vivienda' },
                { label: 'Ropa', value: 'ropa' },
                { label: 'Tecnología', value: 'tecnologia' },
                { label: 'Deporte', value: 'deporte' },
                { label: 'Mascotas', value: 'mascotas' },
                { label: 'Ahorro', value: 'ahorro' },
                { label: 'Préstamo', value: 'prestamo' },
                { label: 'Otro', value: 'otro' }
              ]}
            />
          )}
          
          {/* Quick date filters */}
          <div className="flex items-center space-x-1">
            <Button
              variant={dateRange === 'this-week' ? 'secondary' : 'outline'}
              size="sm"
              className="h-8"
              onClick={() => handleQuickDateFilter('this-week')}
            >
              Esta semana
            </Button>
            <Button
              variant={dateRange === 'this-month' ? 'secondary' : 'outline'}
              size="sm"
              className="h-8"
              onClick={() => handleQuickDateFilter('this-month')}
            >
              Este mes
            </Button>
            <Button
              variant={dateRange === 'last-month' ? 'secondary' : 'outline'}
              size="sm"
              className="h-8"
              onClick={() => handleQuickDateFilter('last-month')}
            >
              Mes anterior
            </Button>
          </div>

          {/* Custom month/year picker */}
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={dateRange === 'custom' ? 'secondary' : 'outline'}
                size="sm"
                className="h-8 w-[180px] justify-start"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {getDateLabel() === 'Seleccionar periodo' ? 'Otro periodo' : getDateLabel()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-4" align="start">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mes</label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar mes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Enero</SelectItem>
                      <SelectItem value="2">Febrero</SelectItem>
                      <SelectItem value="3">Marzo</SelectItem>
                      <SelectItem value="4">Abril</SelectItem>
                      <SelectItem value="5">Mayo</SelectItem>
                      <SelectItem value="6">Junio</SelectItem>
                      <SelectItem value="7">Julio</SelectItem>
                      <SelectItem value="8">Agosto</SelectItem>
                      <SelectItem value="9">Septiembre</SelectItem>
                      <SelectItem value="10">Octubre</SelectItem>
                      <SelectItem value="11">Noviembre</SelectItem>
                      <SelectItem value="12">Diciembre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Año</label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar año" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleQuickDateFilter('all');
                      setIsPopoverOpen(false);
                    }}
                  >
                    Limpiar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCustomMonthFilter}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {isFiltered && (
            <Button
              variant="ghost"
              onClick={handleResetFilters}
              className="h-8 px-2 lg:px-3"
            >
              Limpiar
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}