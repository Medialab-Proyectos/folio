'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useApp } from '@/lib/context/app-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, AlertCircle, Car, User, ClipboardList, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Vehicle, VehicleEvent, Damage } from '@/lib/types';
import { carsApi } from '@/lib/api/cars';
import { vehicleToCarUpdate } from '@/lib/api/mappers';

// ─── Compact vehicle summary shown throughout check-out ───────────────────────
function VehicleSummary({ vehicle, ownerName }: { vehicle: Vehicle; ownerName: string }) {
  const photo = vehicle.initialDocumentation?.frontExterior?.[0];
  const hasPhoto = photo && photo !== 'string';

  return (
    <div className="card-premium p-3 flex items-center gap-3">
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-muted/40 border border-border/40 flex items-center justify-center">
        {hasPhoto ? (
          <img
            src={photo.startsWith('/') || photo.startsWith('http') || photo.startsWith('data:')
              ? photo
              : `data:image/jpeg;base64,${photo}`}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <Car className="w-6 h-6 text-muted-foreground/40" strokeWidth={1.5} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm leading-tight truncate">
          {vehicle.make} {vehicle.model} <span className="text-muted-foreground font-normal">{vehicle.year}</span>
        </p>
        <p className="text-xs text-accent font-semibold mt-0.5">{vehicle.licensePlate}</p>
        {ownerName && (
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 truncate">
            <User className="w-3 h-3 flex-shrink-0" />
            {ownerName}
          </p>
        )}
      </div>

      {vehicle.color && (
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <div className="w-4 h-4 rounded-full border border-border/60 bg-muted-foreground/20" />
          <span className="text-[10px] text-muted-foreground capitalize">{vehicle.color}</span>
        </div>
      )}
    </div>
  );
}

export default function CheckOutPage() {
  const router = useRouter();
  const params = useParams();
  const { store, currentUser, setVehicleEvents, refreshVehicles, showToast } = useApp();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'validation' | 'success'>('validation');
  const [showCheckInSummary, setShowCheckInSummary] = useState(false);

  useEffect(() => {
    const vehicleData = store.vehicles.find(v => v.id === params.id);
    setVehicle(vehicleData || null);
  }, [params.id, store.vehicles]);

  const handleComplete = async () => {
    if (!vehicle || !currentUser) return;

    setLoading(true);

    try {
      const timestamp = new Date().toISOString();

      // Update vehicle status via API
      await carsApi.update(vehicle.id, vehicleToCarUpdate({ status: 'checked_out', statusUpdatedAt: timestamp }, undefined));

      // Create vehicle event
      const newEvent: VehicleEvent = {
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        eventType: 'departure_after_use',
        vehicleId: vehicle.id,
        facilityId: vehicle.facilityId,
        staffUserId: currentUser.id,
        timestamp: timestamp,
        damagesCaptured: [],
        notes: '',
      };
      setVehicleEvents([...store.vehicleEvents, newEvent]);

      await refreshVehicles();
      setStep('success');
    } catch (error) {
      console.error('[v0] Check-out error:', error);
      showToast('Failed to check out vehicle', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Vehicle not found</p>
      </div>
    );
  }

  const client = store.clients.find(c => c.id === vehicle.clientId);
  const ownerName = client
    ? `${client.firstName === 'string' ? 'Client' : client.firstName} ${client.lastName === 'string' ? '' : client.lastName}`.trim()
    : '';

  // Allow check-out for vehicles with partial registration (same policy as vehicle detail page)
  const canCheckOut = vehicle.status === 'in_storage';

  // ── STEP: success ────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-6">
          <Check className="w-10 h-10 text-success" />
        </div>

        <h1 className="text-2xl font-bold mb-2">Check-Out Complete</h1>
        <p className="text-muted-foreground mb-4 text-balance">
          {vehicle.make} {vehicle.model} has been successfully checked out.
        </p>

        <div className="w-full max-w-sm mb-6">
          <VehicleSummary vehicle={vehicle} ownerName={ownerName} />
        </div>

        <div className="w-full max-w-sm space-y-3">
          <Button className="w-full btn-dark h-12 text-base" onClick={() => router.push('/check-out')}>
            Return to Check-Out List
          </Button>
          <Button variant="ghost" className="w-full h-12" onClick={() => router.push(`/vehicles/${vehicle.id}`)}>
            View Vehicle Details
          </Button>
        </div>
      </div>
    );
  }

  // ── STEP: validation ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-[hsl(var(--surface-dark))] text-white p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-semibold">Check-Out Vehicle</h1>
            <p className="text-sm text-white/70">Confirm departure</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <VehicleSummary vehicle={vehicle} ownerName={ownerName} />

        {/* Last Check-In Summary — visible BEFORE confirming check-out */}
        {(() => {
          const lastCheckIn = [...store.vehicleEvents]
            .filter(e => e.vehicleId === vehicle.id && e.eventType === 'arrival_after_use')
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

          if (!lastCheckIn) return null;

          const checkInDamages: Damage[] = store.damages.filter(
            d => d.vehicleId === vehicle.id && d.eventId === lastCheckIn.id
          );
          const staff = store.staffUsers.find(s => s.id === lastCheckIn.staffUserId);
          const staffName = staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown';
          const checkInDate = new Date(lastCheckIn.timestamp);

          return (
            <div className="card-premium overflow-hidden">
              <button
                onClick={() => setShowCheckInSummary(v => !v)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/20 transition-colors"
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <ClipboardList className="w-4 h-4 text-accent" />
                  Last Check-In Summary
                  {checkInDamages.length > 0 ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                      {checkInDamages.length} damage{checkInDamages.length !== 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
                      No damages
                    </span>
                  )}
                </span>
                {showCheckInSummary
                  ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                }
              </button>

              {showCheckInSummary && (
                <div className="border-t border-border/40 p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Date</p>
                      <p className="text-sm font-medium">{checkInDate.toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">{checkInDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Checked In By</p>
                      <p className="text-sm font-medium">{staffName}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Condition at Check-In</p>
                    {checkInDamages.length === 0 ? (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-success/5 border border-success/20">
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                        <p className="text-sm text-success font-medium">No damages recorded</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {checkInDamages.map(damage => (
                          <div key={damage.id} className="flex items-center justify-between p-3 rounded-xl bg-destructive/[0.04] border border-destructive/10">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                              <p className="text-sm font-medium capitalize">{damage.carPart.replace(/_/g, ' ')}</p>
                            </div>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                              damage.severity === 'high'
                                ? 'bg-destructive/10 text-destructive'
                                : damage.severity === 'medium'
                                ? 'bg-yellow-500/10 text-yellow-700'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {damage.severity}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Confirm check-out */}
        <div className={`card-premium p-6 space-y-4 ${!canCheckOut ? 'border-destructive' : 'border-success'}`}>
          <div className="flex items-start gap-3">
            {canCheckOut ? (
              <Check className="w-6 h-6 text-success flex-shrink-0 mt-1" />
            ) : (
              <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
            )}
            <div className="flex-1">
              <h3 className="font-semibold mb-2">
                {canCheckOut ? 'Ready for Check-Out' : 'Cannot Check Out'}
              </h3>

              {!vehicle.registrationCompleted && canCheckOut && (
                <p className="text-sm text-amber-600 mb-3">
                  Note: Registration is incomplete, but check-out is still allowed.
                </p>
              )}

              {vehicle.status === 'checked_out' && (
                <p className="text-sm text-destructive mb-3">
                  Vehicle is already checked out. Please check in first.
                </p>
              )}

              {vehicle.status === 'archived' && (
                <p className="text-sm text-destructive mb-3">
                  Vehicle is archived. Please unarchive first.
                </p>
              )}

              {canCheckOut && (
                <p className="text-sm text-muted-foreground">
                  The vehicle will be marked as checked out and removed from storage inventory.
                </p>
              )}
            </div>
          </div>

          {canCheckOut ? (
            <Button onClick={handleComplete} disabled={loading} className="w-full btn-dark">
              {loading ? 'Processing...' : 'Complete Check-Out'}
            </Button>
          ) : (
            <Button onClick={() => router.push(`/vehicles/${vehicle.id}`)} variant="outline" className="w-full">
              Go to Vehicle Details
            </Button>
          )}
        </div>

        {/* Additional vehicle details */}
        {canCheckOut && (
          <div className="card-premium p-4 space-y-3">
            <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">VIN</p>
                <p className="font-medium font-mono text-xs">{vehicle.vin}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Odometer</p>
                <p className="font-medium">{vehicle.odometer?.toLocaleString() ?? '—'} mi</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
