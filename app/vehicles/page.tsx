'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/context/app-context';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, AlertCircle } from 'lucide-react';
import { Vehicle } from '@/lib/types';
import Link from 'next/link';
import { UltraCarSvg } from '@/components/shared/ultra-car-svg';

export default function VehiclesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, store, currentFacility } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_storage' | 'checked_out' | 'archived'>('all');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    // Show vehicles for this facility. Also include vehicles with no facilityId
    // (API may return cars without facility_id assigned — we still want to show them)
    let filtered = store.vehicles.filter(v =>
      !currentFacility || !v.facilityId || v.facilityId === currentFacility
    );

    if (statusFilter !== 'all') {
      filtered = filtered.filter(v => v.status === statusFilter);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        v =>
          v.licensePlate.toLowerCase().includes(searchLower) ||
          v.make.toLowerCase().includes(searchLower) ||
          v.model.toLowerCase().includes(searchLower) ||
          v.vin.toLowerCase().includes(searchLower)
      );
    }

    setVehicles(filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  }, [currentUser, store, currentFacility, search, statusFilter, router]);

  if (!currentUser) {
    return null;
  }

  const getStatusBadge = (status: Vehicle['status']) => {
    switch (status) {
      case 'in_storage':
        return <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-success/10 text-success border border-success/20 backdrop-blur-sm">In Storage</span>;
      case 'checked_out':
        return <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 backdrop-blur-sm">Checked Out</span>;
      case 'archived':
        return <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-muted text-muted-foreground border border-border/40">Archived</span>;
    }
  };

  const getClient = (clientId: string) => {
    return store.clients.find(c => c.id === clientId);
  };

  const filterOptions = [
    { key: 'all' as const, label: 'All' },
    { key: 'in_storage' as const, label: 'In Storage' },
    { key: 'checked_out' as const, label: 'Checked Out' },
    { key: 'archived' as const, label: 'Archived' },
  ];

  return (
    <div className="min-h-screen pb-safe bg-background">
      {/* Header */}
      <div className="header-gradient border-b border-border/60 sticky top-0 z-30">
        <div className="px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Vehicles</h1>
            <Link href="/vehicles/register">
              <Button size="sm" className="btn-gold rounded-xl h-9 px-4">
                <Plus className="w-4 h-4 mr-1.5" />
                Add
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <Input
              placeholder="Search by plate, make, model, VIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-muted/60 border-border/40 text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            {filterOptions.map(opt => (
              <button
                key={opt.key}
                onClick={() => setStatusFilter(opt.key)}
                className={`px-4 py-1.5 text-[13px] font-semibold rounded-full whitespace-nowrap transition-all duration-300 ${
                  statusFilter === opt.key
                    ? 'bg-foreground text-background shadow-md'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted active:scale-95'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vehicle List */}
      <div className="p-4 space-y-3 max-w-2xl mx-auto">
        {vehicles.length === 0 ? (
          <div className="card-premium relative overflow-hidden p-12 text-center animate-fade-in">
            <div className="absolute inset-0 pointer-events-none flex items-end justify-center overflow-hidden">
              <UltraCarSvg variant="in" opacity={0.09} className="w-full max-w-lg" />
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-muted/80 backdrop-blur-sm mx-auto mb-4 flex items-center justify-center border border-border/50 shadow-inner">
                <Plus className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <p className="text-foreground/90 font-medium text-lg">No vehicles found</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Try adjusting your search or filters</p>
              <Link href="/vehicles/register">
                <Button className="mt-6 btn-gold rounded-xl px-6">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Vehicle
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          vehicles.map((vehicle, idx) => {
            const client = getClient(vehicle.clientId);
            const damages = store.damages.filter(d => d.vehicleId === vehicle.id && d.status === 'open');
            const docs = vehicle.initialDocumentation;
            const mainPhoto = docs?.frontExterior?.find(p => p && p !== 'string')
              || docs?.rearExterior?.find(p => p && p !== 'string')
              || docs?.leftSide?.find(p => p && p !== 'string')
              || docs?.rightSide?.find(p => p && p !== 'string')
              || docs?.interior?.find(p => p && p !== 'string');

            return (
              <Link
                key={vehicle.id}
                href={`/vehicles/${vehicle.id}`}
                className="block card-premium overflow-hidden group animate-fade-in-up"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                {/* Vehicle Image */}
                <div className="relative w-full aspect-[16/9] bg-muted overflow-hidden">
                  {mainPhoto ? (
                    <img
                      src={mainPhoto.startsWith('/') || mainPhoto.startsWith('http') || mainPhoto.startsWith('data:') ? mainPhoto : `data:image/jpeg;base64,${mainPhoto}`}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="relative w-full h-full bg-[#0d0d0d] flex items-center justify-center overflow-hidden">
                      {/* Ultra-detailed SVG car — cinematic placeholder */}
                      <UltraCarSvg
                        variant={vehicle.status === 'in_storage' ? 'in' : 'out'}
                        opacity={0.55}
                        className="absolute inset-0 w-full h-full scale-110 transition-transform duration-700 group-hover:scale-125"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
                    </div>
                  )}
                  
                  {/* Gradient overlay for text readability */}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
                  
                  {!vehicle.registrationCompleted && (
                    <div className="absolute top-3 right-3 bg-destructive/90 text-destructive-foreground px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-sm shadow-lg">
                      <AlertCircle className="w-3 h-3" />
                      Incomplete
                    </div>
                  )}
                  
                  {/* Status on image bottom-left */}
                  <div className="absolute bottom-3 left-3">
                    {getStatusBadge(vehicle.status)}
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="p-4 space-y-2.5">
                  {/* Make (small gold uppercase) */}
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-accent">
                    {vehicle.make}
                  </p>

                  {/* Model + Year (title) */}
                  <h3 className="text-lg font-bold -mt-1 text-balance leading-snug">
                    {vehicle.model} <span className="font-semibold text-foreground/80">{vehicle.year}</span>
                  </h3>

                  {/* Divider */}
                  <div className="divider-gold" />

                  {/* Metadata Row */}
                  <div className="flex items-center justify-between text-sm pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[13px]">{vehicle.licensePlate}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <div className="w-2.5 h-2.5 rounded-full bg-current opacity-40" />
                      <span className="text-xs">{vehicle.color}</span>
                    </div>
                    {damages.length > 0 && (
                      <div className="flex items-center gap-1 text-destructive">
                        <AlertCircle className="w-3 h-3" />
                        <span className="text-xs font-medium">{damages.length} damage{damages.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>

                  {/* Owner */}
                  {client && (
                    <p className="text-xs text-muted-foreground/70">
                      Owner: <span className="font-medium text-muted-foreground">{client.firstName === 'string' ? 'John' : client.firstName} {client.lastName === 'string' ? 'Doe' : client.lastName}</span>
                    </p>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
}
