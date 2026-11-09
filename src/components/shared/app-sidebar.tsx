'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  ClipboardList,
  FileText,
  FolderTree,
  LayoutDashboard,
  Package,
  UserCog,
  Users,
  Wrench,
} from 'lucide-react';

import { cn } from '@/lib/utils';

interface MenuItem {
  href: string;
  label: string;
  icon: React.ElementType;
  /** Permiso requerido para ver este item. Si falta, se muestra siempre. */
  permission?: string;
}

const MENU_ITEMS: MenuItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clientes', label: 'Clientes', icon: Users, permission: 'clientes:ver' },
  { href: '/usuarios', label: 'Usuarios', icon: UserCog, permission: 'usuarios:ver' },
  {
    href: '/catalogos',
    label: 'Catálogos',
    icon: FolderTree,
    permission: 'catalogos:marcas:ver',
  },
  { href: '/ordenes', label: 'Órdenes', icon: ClipboardList, permission: 'ordenes:ver' },
  { href: '/reparaciones', label: 'Reparaciones', icon: Wrench, permission: 'reparaciones:ver' },
  { href: '/inventario', label: 'Inventario', icon: Package, permission: 'inventario:ver' },
  { href: '/facturacion', label: 'Facturación', icon: FileText, permission: 'facturacion:ver' },
];

interface AppSidebarProps {
  permisos: string[];
}

export function AppSidebar({ permisos }: AppSidebarProps) {
  const pathname = usePathname();

  const itemsVisibles = MENU_ITEMS.filter(
    (item) => !item.permission || permisos.includes(item.permission),
  );

  return (
    <aside className="hidden w-64 flex-col border-r bg-background md:flex">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Building2 className="h-5 w-5" />
          <span>Gestión Servicios</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {itemsVisibles.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3 text-xs text-muted-foreground">v0.1.0</div>
    </aside>
  );
}
