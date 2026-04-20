'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/app-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, LogOut, AlertCircle } from 'lucide-react';
import { Vehicle } from '@/lib/types';
import Link from 'next/link';
import { UltraCarSvg } from '@/components/shared/ultra-car-svg';

export default function CheckOutSelectPage() {
  const router = useRouter();
  const { currentUser, store, currentFacility } = useApp();
  const [search, setSearch] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    // Only show vehicles that are in_storage and can be checked out
    // Also include vehicles with no facilityId (API may not return facility_id)
    let filtered = store.vehicles.filter(
      v => (!currentFacility || !v.facilityId || v.facilityId === currentFacility) && v.status === 'in_storage'
    );

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
      `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`)
    ));
  }, [currentUser, store, currentFacility, search, router]);

  if (!currentUser) {
    return null;
  }

  const getClient = (clientId: string) => {
    return store.clients.find(c => c.id === clientId);
  };

  const canCheckOut = (vehicle: Vehicle) => {
    return vehicle.registrationCompleted && vehicle.status === 'in_storage';
  };

  return (
    <div className="min-h-screen pb-safe bg-background">
      {/* Header */}
      <div className="header-dark-gradient text-white sticky top-0 z-30 overflow-hidden">
        {/* Ultra-detail car SVG — cinematic backdrop */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <UltraCarSvg
            variant="out"
            opacity={0.13}
            className="absolute -bottom-8 -right-10 w-[520px] h-auto"
          />
        </div>
        <div className="relative z-10 px-4 py-4 space-y-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="text-white hover:bg-white/10 rounded-xl min-h-0 p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Check-out Vehicle</h1>
              <p className="text-sm text-white/50">Select a vehicle to check out</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              type="text"
              placeholder="Search by plate, make, model, or VIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-white/[0.06] border-white/[0.1] text-white placeholder:text-white/30 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 max-w-2xl mx-auto">
        {vehicles.length === 0 ? (
          <div className="card-premium p-10 text-center animate-fade-in relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none flex items-end justify-center overflow-hidden">
              <UltraCarSvg variant="out" opacity={0.07} className="w-full max-w-md" />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 mx-auto mb-3 flex items-center justify-center">
                <LogOut className="w-7 h-7 text-blue-500/70" />
              </div>
              <h3 className="font-bold mb-1">No Vehicles to Check Out</h3>
              <p className="text-sm text-muted-foreground">
                {search
                  ? 'No vehicles match your search'
                  : 'All vehicles are currently checked out or archived'}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="px-1 py-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{vehicles.length}</span> vehicle{vehicles.length !== 1 ? 's' : ''} available for check-out
              </p>
            </div>

            {vehicles.map((vehicle, idx) => {
              const client = getClient(vehicle.clientId);
              const checkOutAllowed = canCheckOut(vehicle);

              return (
                <div
                  key={vehicle.id}
                  className="card-premium p-4 animate-fade-in-up"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="flex gap-4">
                    {/* Vehicle Image */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                      {vehicle.initialDocumentation?.rearExterior?.[0] && vehicle.initialDocumentation.rearExterior[0] !== 'string' ? (
                        <img
                          src={vehicle.initialDocumentation.rearExterior[0].startsWith('/') || vehicle.initialDocumentation.rearExterior[0].startsWith('http') || vehicle.initialDocumentation.rearExterior[0].startsWith('data:') ? vehicle.initialDocumentation.rearExterior[0] : `data:image/jpeg;base64,${vehicle.initialDocumentation.rearExterior[0]}`}
                          alt={`${vehicle.make} ${vehicle.model}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a] overflow-hidden relative">
                          <UltraCarSvg variant="out" opacity={0.6} className="absolute inset-0 w-full h-full scale-[1.8] translate-y-2" />
                        </div>
                      )}
                    </div>

                    {/* Vehicle Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-accent mb-0.5">
                        {vehicle.make}
                      </p>
                      <h3 className="font-bold text-base mb-1.5">
                        {vehicle.model} {vehicle.year}
                      </h3>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>Plate: <span className="font-semibold text-foreground">{vehicle.licensePlate}</span></span>
                        <span>Color: {vehicle.color}</span>
                      </div>
                      
                      {client && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Owner: {client.firstName === 'string' ? 'John' : client.firstName} {client.lastName === 'string' ? 'Doe' : client.lastName}
                        </p>
                      )}

                      {!checkOutAllowed && (
                        <div className="mt-2 flex items-start gap-2 p-2.5 bg-destructive/[0.06] border border-destructive/10 rounded-lg text-xs text-destructive">
                          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>Registration incomplete. Complete required steps to check out.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4">
                    {checkOutAllowed ? (
                      <Link href={`/vehicles/check-out/${vehicle.id}`} className="block">
                        <Button className="w-full btn-dark h-11 rounded-xl font-semibold text-sm">
                          <LogOut className="w-4 h-4 mr-2" />
                          Check Out This Vehicle
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/vehicles/${vehicle.id}`} className="block">
                        <Button variant="outline" className="w-full h-11 rounded-xl border-2 font-medium text-sm">
                          Complete Registration First
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
