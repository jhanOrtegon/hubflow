import { NavItem } from '@/types';

/**
 * Navigation configuration with RBAC support
 *
 * This configuration is used for both the sidebar navigation and Cmd+K bar.
 *
 * RBAC Access Control:
 * Each navigation item can have an `access` property that controls visibility
 * based on permissions, plans, features, roles, and organization context.
 *
 * Examples:
 *
 * 1. Require organization:
 *    access: { requireOrg: true }
 *
 * 2. Require specific permission:
 *    access: { requireOrg: true, permission: 'org:teams:manage' }
 *
 * 3. Require specific plan:
 *    access: { plan: 'pro' }
 *
 * 4. Require specific feature:
 *    access: { feature: 'premium_access' }
 *
 * 5. Require specific role:
 *    access: { role: 'admin' }
 *
 * 6. Multiple conditions (all must be true):
 *    access: { requireOrg: true, permission: 'org:teams:manage', plan: 'pro' }
 *
 * Note: The `visible` function is deprecated but still supported for backward compatibility.
 * Use the `access` property for new items.
 */
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: []
  },
  {
    title: 'Finanzas',
    url: '/dashboard/finance',
    icon: 'finance',
    shortcut: ['f', 'f'],
    isActive: false,
    items: [
      {
        title: 'Resumen',
        url: '/dashboard/finance',
        shortcut: ['f', 'r']
      },
      {
        title: 'Ingresos',
        url: '/dashboard/finance/income',
        shortcut: ['f', 'i']
      },
      {
        title: 'Gastos',
        url: '/dashboard/finance/expenses',
        shortcut: ['f', 'g']
      },
      {
        title: 'Presupuestos',
        url: '/dashboard/finance/budgets',
        shortcut: ['f', 'b']
      },
      {
        title: 'Gastos Recurrentes',
        url: '/dashboard/finance/recurring',
        shortcut: ['f', 'e']
      },
      {
        title: 'Metas Financieras',
        url: '/dashboard/finance/goals',
        shortcut: ['f', 'm']
      },
      {
        title: 'Cuentas',
        url: '/dashboard/finance/accounts',
        shortcut: ['f', 'c']
      },
      {
        title: 'Reportes',
        url: '/dashboard/finance/reports',
        shortcut: ['f', 'p']
      }
    ]
  },
  {
    title: 'Productividad',
    url: '/dashboard/productivity',
    icon: 'productivity',
    shortcut: ['p', 'p'],
    isActive: false,
    items: [
      {
        title: 'Agenda',
        url: '/dashboard/productivity/calendar',
        shortcut: ['p', 'a']
      },
      {
        title: 'Tareas',
        url: '/dashboard/productivity/tasks',
        shortcut: ['p', 't']
      }
    ]
  },
  {
    title: 'Estudio',
    url: '/dashboard/learning',
    icon: 'learning',
    shortcut: ['e', 'e'],
    isActive: false,
    items: [
      {
        title: 'Seguimiento',
        url: '/dashboard/learning/tracking',
        shortcut: ['e', 's']
      },
      {
        title: 'Planes',
        url: '/dashboard/learning/plans',
        shortcut: ['e', 'p']
      },
      {
        title: 'Recursos',
        url: '/dashboard/learning/resources',
        shortcut: ['e', 'r']
      }
    ]
  },
  {
    title: 'Viajes',
    url: '/dashboard/travel',
    icon: 'travel',
    shortcut: ['v', 'v'],
    isActive: false,
    items: [
      {
        title: 'Mis Viajes',
        url: '/dashboard/travel/trips',
        shortcut: ['v', 't']
      },
      {
        title: 'Planes en Pareja',
        url: '/dashboard/travel/couple',
        shortcut: ['v', 'p']
      },
      {
        title: 'Kilometraje',
        url: '/dashboard/travel/mileage',
        shortcut: ['v', 'k']
      }
    ]
  },
  {
    title: 'Bienestar',
    url: '/dashboard/wellness',
    icon: 'wellness',
    shortcut: ['b', 'b'],
    isActive: false,
    items: [
      {
        title: 'Registro Diario',
        url: '/dashboard/wellness/daily',
        shortcut: ['b', 'd']
      },
      {
        title: 'Métricas',
        url: '/dashboard/wellness/metrics',
        shortcut: ['b', 'm']
      }
    ]
  },
  {
    title: 'Documentos',
    url: '/dashboard/documents',
    icon: 'documents',
    shortcut: ['o', 'o'],
    isActive: false,
    items: [
      {
        title: 'Mis Documentos',
        url: '/dashboard/documents/personal',
        shortcut: ['o', 'd']
      },
      {
        title: 'Vencimientos',
        url: '/dashboard/documents/expiry',
        shortcut: ['o', 'v']
      },
      {
        title: 'Notas',
        url: '/dashboard/documents/notes',
        shortcut: ['o', 'n']
      }
    ]
  },
  {
    title: 'Hogar',
    url: '/dashboard/home',
    icon: 'home',
    shortcut: ['h', 'h'],
    isActive: false,
    items: [
      {
        title: 'Mantenimiento',
        url: '/dashboard/home/maintenance',
        shortcut: ['h', 'm']
      },
      {
        title: 'Vehículos',
        url: '/dashboard/home/vehicles',
        shortcut: ['h', 'v']
      },
      {
        title: 'Inventario',
        url: '/dashboard/home/inventory',
        shortcut: ['h', 'i']
      }
    ]
  },
  {
    title: 'Proyectos',
    url: '/dashboard/projects',
    icon: 'projects',
    shortcut: ['r', 'r'],
    isActive: false,
    items: [
      {
        title: 'Mis Proyectos',
        url: '/dashboard/projects/list',
        shortcut: ['r', 'p']
      },
      {
        title: 'Ideas',
        url: '/dashboard/projects/ideas',
        shortcut: ['r', 'i']
      },
      {
        title: 'Tiempo',
        url: '/dashboard/projects/time',
        shortcut: ['r', 't']
      }
    ]
  },
  {
    title: 'Hábitos',
    url: '/dashboard/habits',
    icon: 'habits',
    shortcut: ['q', 'q'],
    isActive: false,
    items: [
      {
        title: 'Mis Hábitos',
        url: '/dashboard/habits/tracker',
        shortcut: ['q', 'h']
      },
      {
        title: 'Rutinas',
        url: '/dashboard/habits/routines',
        shortcut: ['q', 'r']
      },
      {
        title: 'Estadísticas',
        url: '/dashboard/habits/stats',
        shortcut: ['q', 's']
      }
    ]
  },
  {
    title: 'Compras',
    url: '/dashboard/shopping',
    icon: 'shopping',
    shortcut: ['c', 'c'],
    isActive: false,
    items: [
      {
        title: 'Wishlist',
        url: '/dashboard/shopping/wishlist',
        shortcut: ['c', 'w']
      },
      {
        title: 'Comparador',
        url: '/dashboard/shopping/compare',
        shortcut: ['c', 'c']
      },
      {
        title: 'Historial',
        url: '/dashboard/shopping/history',
        shortcut: ['c', 'h']
      }
    ]
  },
  {
    title: 'Contactos',
    url: '/dashboard/contacts',
    icon: 'contacts',
    shortcut: ['t', 't'],
    isActive: false,
    items: [
      {
        title: 'Personas',
        url: '/dashboard/contacts/people',
        shortcut: ['t', 'p']
      },
      {
        title: 'Eventos',
        url: '/dashboard/contacts/events',
        shortcut: ['t', 'e']
      },
      {
        title: 'Networking',
        url: '/dashboard/contacts/network',
        shortcut: ['t', 'n']
      }
    ]
  }
];
