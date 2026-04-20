'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { LayoutDashboard, CarFront, Users, Bell, SlidersHorizontal } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/vehicles',  label: 'Vehicles',  Icon: CarFront },
  { href: '/clients',   label: 'Members',   Icon: Users },
  { href: '/notifications', label: 'Alerts', Icon: Bell },
  { href: '/more',      label: 'More',      Icon: SlidersHorizontal },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 glass-dark border-t border-x border-white/[0.06] rounded-t-2xl overflow-hidden shadow-[0_-8px_30px_rgb(0,0,0,0.12)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-[68px] max-w-2xl mx-auto px-1">
        {navItems.map(({ href, label, Icon }) => {
          const isActive = pathname?.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center flex-1 h-full group transition-all duration-200 ease-out active:scale-95"
            >
              {/* Icon with golden active circle */}
              <div className="relative">
                <div
                  className={`flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 ease-out ${
                    isActive
                      ? 'bg-gold shadow-lg shadow-[hsl(var(--gold-accent))]/25'
                      : 'bg-transparent group-hover:bg-white/[0.06]'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-background' : 'text-gray-500 group-hover:text-gray-300'
                    }`}
                  />
                </div>
              </div>

              {/* Label */}
              <span
                className={`text-[10px] mt-0.5 font-medium tracking-wide transition-all duration-300 ${
                  isActive
                    ? 'text-[hsl(var(--gold-accent))]'
                    : 'text-gray-600 group-hover:text-gray-400'
                }`}
              >
                {label}
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
