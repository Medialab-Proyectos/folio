'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Car, Users, Bell, MoreHorizontal } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/vehicles', label: 'Vehicles', icon: Car },
  { href: '/clients', label: 'Members', icon: Users },
  { href: '/notifications', label: 'Alerts', icon: Bell },
  { href: '/more', label: 'More', icon: MoreHorizontal },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-dark border-t border-white/[0.06]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around h-[68px] max-w-2xl mx-auto px-1">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 h-full group transition-all duration-200 ease-out active:scale-95"
            >
              {/* Ícono con círculo dorado cuando activo */}
              <div className="relative">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ease-out ${
                    isActive 
                      ? 'bg-gold shadow-lg shadow-[hsl(var(--gold-accent))]/25' 
                      : 'bg-transparent group-hover:bg-white/[0.06]'
                  }`}
                >
                  <Icon
                    className={`w-[20px] h-[20px] transition-all duration-300 ${
                      isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'
                    }`}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                </div>
                {/* Active dot indicator */}
                {isActive && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[hsl(var(--gold-accent))] animate-scale-in" />
                )}
              </div>
              
              {/* Label con transición suave */}
              <span
                className={`text-[10px] mt-0.5 font-medium tracking-wide transition-all duration-300 ${
                  isActive ? 'text-[hsl(var(--gold-accent))]' : 'text-gray-600 group-hover:text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Named export for compatibility
export { BottomNav };
