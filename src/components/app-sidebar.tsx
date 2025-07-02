'use client'

import Link from 'next/link';
import { Home, UserPlus, LogOut, LayoutGrid } from 'lucide-react';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/actions';

export function AppSidebar() {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/new', label: 'New Customer', icon: UserPlus },
  ];

  return (
    <aside className="hidden md:flex w-64 bg-card border-r flex-col shadow-md">
      <div className="p-6 border-b flex items-center gap-2">
         <LayoutGrid className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-headline text-primary font-bold">Style Gallery</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
            <Button
              key={item.label}
              variant={pathname === item.href ? 'secondary' : 'ghost'}
              className="w-full justify-start text-base"
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            </Button>
        ))}
      </nav>
      <div className="p-4 mt-auto border-t">
        <form action={logout}>
          <Button variant="outline" className="w-full justify-start" type="submit">
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </form>
      </div>
    </aside>
  );
}
