import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: Package
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 z-50 flex w-72 flex-col bg-white transition-transform duration-300 lg:static lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Package className="h-6 w-6" />
            <span>Store Admin</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <nav className="flex flex-col gap-1">
            {navigation.map((item) => {
              const isActive = location === item.href;

              return (
                <Link key={item.name} href={item.href}>
                  <a
                    className={cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100',
                      isActive ? 'bg-slate-100 text-primary' : 'text-slate-700'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'h-5 w-5',
                        isActive ? 'text-primary' : 'text-slate-400'
                      )}
                    />
                    {item.name}
                  </a>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex h-16 items-center gap-4 border-b bg-white px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>

          {/* <div className="flex flex-1 items-center justify-end gap-4">
            <Button variant="ghost" size="sm">
              Account <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div> */}
        </div>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}