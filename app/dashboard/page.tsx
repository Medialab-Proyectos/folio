'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/app-context';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, Package, LogIn, LogOut, Grid3x3, ChevronRight, Loader2 } from 'lucide-react';
import { DashboardKPIs } from '@/lib/types';
import { GarageFolioLogo } from '@/components/shared/garagefolio-logo';
import Link from 'next/link';
import Image from 'next/image';

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser, store, currentFacility } = useApp();
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    // Calculate KPIs
    const facility = store.facilities.find(f => f.id === currentFacility);
    const facilityVehicles = store.vehicles.filter(
      v => v.facilityId === currentFacility && v.status !== 'archived'
    );
    
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // If currentFacility is empty (mismatch on first load), show all events
    const matchesFacility = (facilityId: string) =>
      !currentFacility || facilityId === currentFacility;

    const checkIns24h = store.vehicleEvents.filter(
      e => matchesFacility(e.facilityId) &&
           e.eventType === 'arrival_after_use' &&
           new Date(e.timestamp) > yesterday
    ).length;

    const checkOuts24h = store.vehicleEvents.filter(
      e => matchesFacility(e.facilityId) &&
           e.eventType === 'departure_after_use' &&
           new Date(e.timestamp) > yesterday
    ).length;

    const occupancy = facilityVehicles.filter(v => v.status === 'in_storage').length;
    const capacity = facility ? facility.capacity.floorSpaces + (facility.capacity.liftSpaces * 2) : 0;

    setKpis({
      totalInventory: facilityVehicles.length,
      totalOccupancy: occupancy,
      checkIns24h,
      checkOuts24h,
      availableSpace: capacity - occupancy,
      facilityCapacity: capacity,
    });
  }, [currentUser, store, currentFacility, router]);

  if (!currentUser || !kpis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const facility = store.facilities.find(f => f.id === currentFacility);
  const recentEvents = store.vehicleEvents
    .filter(e => !currentFacility || e.facilityId === currentFacility)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const occupancyPercent = kpis.facilityCapacity > 0
    ? Math.round((kpis.totalOccupancy / kpis.facilityCapacity) * 100)
    : 0;

  return (
    <div className="min-h-screen pb-safe bg-background">
      {/* Premium Header */}
      <div className="header-gradient border-b border-border/60 sticky top-0 z-30">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-1">
            <GarageFolioLogo variant="dark" size="sm" showText={true} />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {facility?.name === 'string' ? 'Main Garage Facility' : (facility?.name || 'Main Garage Facility')} 
            <span className="text-border mx-1.5">•</span> 
            {currentUser.firstName === 'string' ? "Ing. John" : currentUser.firstName} {currentUser.lastName === 'string' ? "Chapid" : currentUser.lastName}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-5 max-w-2xl mx-auto">
        {/* KPIs Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card-premium p-4 space-y-2 animate-fade-in-up delay-75">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <Package className="w-4 h-4 text-accent" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Inventory</span>
            </div>
            <p className="text-3xl font-bold animate-count-up">{kpis.totalInventory}</p>
            <p className="text-xs text-muted-foreground">Registered & active</p>
          </div>

          <div className="card-premium p-4 space-y-2 animate-fade-in-up delay-150">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <Grid3x3 className="w-4 h-4 text-accent" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Occupancy</span>
            </div>
            <p className="text-3xl font-bold animate-count-up">{kpis.totalOccupancy}</p>
            <p className="text-xs text-muted-foreground">In storage now</p>
          </div>

          <div className="card-premium p-4 space-y-2 animate-fade-in-up delay-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <LogIn className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Check-ins</span>
            </div>
            <p className="text-3xl font-bold animate-count-up">{kpis.checkIns24h}</p>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </div>

          <div className="card-premium p-4 space-y-2 animate-fade-in-up delay-300">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <LogOut className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Check-outs</span>
            </div>
            <p className="text-3xl font-bold animate-count-up">{kpis.checkOuts24h}</p>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </div>
        </div>

        {/* Available Space — with progress bar */}
        <div className="card-premium p-5 animate-fade-in-up delay-400">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-accent" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Available Space</span>
          </div>
          <div className="flex items-end justify-between mb-3">
            <p className="text-4xl font-bold">{kpis.availableSpace}</p>
            <p className="text-sm text-muted-foreground">
              of {kpis.facilityCapacity} total
            </p>
          </div>
          {/* Occupancy bar */}
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${occupancyPercent}%`,
                background: `linear-gradient(90deg, hsl(var(--gold-accent)), hsl(var(--accent)))`,
                animation: 'progressBar 1.2s ease-out',
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">{occupancyPercent}% occupied</p>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3 animate-fade-in-up delay-500">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
            Quick Actions
          </h3>
          
          <div className="space-y-2.5">
            <Link href="/vehicles/register" className="block">
              <Button className="w-full h-14 btn-dark justify-between text-left text-base font-medium rounded-xl group">
                <span className="flex items-center">
                  <Plus className="w-5 h-5 mr-3" />
                  New Vehicle Registration
                </span>
                <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>

            <div className="grid grid-cols-2 gap-2.5">
              <Link href="/check-in" className="block">
                <Button variant="outline" className="w-full h-14 text-sm font-semibold border-2 rounded-xl hover:bg-accent/5 hover:border-accent/50 transition-all duration-300 group">
                  <LogIn className="w-5 h-5 mr-2 text-accent group-hover:scale-110 transition-transform" />
                  Check-in
                </Button>
              </Link>
              <Link href="/check-out" className="block">
                <Button variant="outline" className="w-full h-14 text-sm font-semibold border-2 rounded-xl hover:bg-accent/5 hover:border-accent/50 transition-all duration-300 group">
                  <LogOut className="w-5 h-5 mr-2 text-accent group-hover:scale-110 transition-transform" />
                  Check-out
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
            Recent Activity
          </h3>
          
          <div className="card-premium divide-y divide-border/60 overflow-hidden">
            {recentEvents.length === 0 ? (
              <div className="p-10 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]">
                  <Image src="/empty-garage.png" alt="Empty Garage" fill className="object-cover transition-transform duration-1000 hover:scale-105" />
                </div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-muted/90 backdrop-blur-sm mx-auto mb-3 flex items-center justify-center border border-border/50 shadow-inner">
                    <TrendingUp className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-foreground/80">No recent activity</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Events will appear here as they happen</p>
                </div>
              </div>
            ) : (
              recentEvents.map((event, idx) => {
                const vehicle = store.vehicles.find(v => v.id === event.vehicleId);
                const staff = store.staffUsers.find(s => s.id === event.staffUserId);
                
                return (
                  <div
                    key={event.id}
                    className="p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      event.eventType === 'arrival_after_use' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-blue-500/10 text-blue-600'
                    }`}>
                      {event.eventType === 'arrival_after_use' ? (
                        <LogIn className="w-4 h-4" />
                      ) : (
                        <LogOut className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {vehicle?.make} {vehicle?.model}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.eventType === 'arrival_after_use' ? 'Checked in' : 'Checked out'} by {staff?.firstName}
                      </p>
                    </div>
                    <div className="text-[11px] text-muted-foreground/70 text-right flex-shrink-0">
                      {new Date(event.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
