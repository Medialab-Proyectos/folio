'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useApp } from '@/lib/context/app-context';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Check, AlertCircle, Car, User, ChevronDown, ChevronUp, Images } from 'lucide-react';
import { Vehicle, Damage, VehicleEvent } from '@/lib/types';
import PhotoCapture from '@/components/shared/photo-capture';
import { carsApi } from '@/lib/api/cars';
import { vehicleToCarUpdate } from '@/lib/api/mappers';

const CAR_PARTS = [
  { id: 'front_bumper', label: 'Front Bumper', x: 50, y: 10 },
  { id: 'hood', label: 'Hood', x: 50, y: 25 },
  { id: 'windshield', label: 'Windshield', x: 50, y: 35 },
  { id: 'roof', label: 'Roof', x: 50, y: 50 },
  { id: 'left_front_door', label: 'Left Front Door', x: 20, y: 50 },
  { id: 'left_rear_door', label: 'Left Rear Door', x: 20, y: 65 },
  { id: 'right_front_door', label: 'Right Front Door', x: 80, y: 50 },
  { id: 'right_rear_door', label: 'Right Rear Door', x: 80, y: 65 },
  { id: 'rear_bumper', label: 'Rear Bumper', x: 50, y: 90 },
  { id: 'trunk', label: 'Trunk', x: 50, y: 80 },
];

// ─── Compact vehicle summary shown on every check-in step ────────────────────
function VehicleSummary({ vehicle, ownerName }: { vehicle: Vehicle; ownerName: string }) {
  const photo = vehicle.initialDocumentation?.frontExterior?.[0];
  const hasPhoto = photo && photo !== 'string';

  return (
    <div className="card-premium p-3 flex items-center gap-3">
      {/* Thumbnail */}
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

      {/* Info */}
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

      {/* Color dot */}
      {vehicle.color && (
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <div className="w-4 h-4 rounded-full border border-border/60 bg-muted-foreground/20" />
          <span className="text-[10px] text-muted-foreground capitalize">{vehicle.color}</span>
        </div>
      )}
    </div>
  );
}

// ─── Reference photo gallery — collapsible 3-col grid ────────────────────────
function PhotoGallery({ vehicle }: { vehicle: Vehicle }) {
  const [open, setOpen] = useState(false);

  const doc = vehicle.initialDocumentation;
  const allPhotos: { src: string; label: string }[] = [
    ...(doc?.frontExterior ?? []).filter(p => p && p !== 'string').map(p => ({ src: p, label: 'Front' })),
    ...(doc?.rearExterior ?? []).filter(p => p && p !== 'string').map(p => ({ src: p, label: 'Rear' })),
    ...(doc?.leftSide ?? []).filter(p => p && p !== 'string').map(p => ({ src: p, label: 'Left' })),
    ...(doc?.rightSide ?? []).filter(p => p && p !== 'string').map(p => ({ src: p, label: 'Right' })),
    ...(doc?.interior ?? []).filter(p => p && p !== 'string').map(p => ({ src: p, label: 'Interior' })),
  ];

  if (allPhotos.length === 0) return null;

  const toSrc = (p: string) =>
    p.startsWith('/') || p.startsWith('http') || p.startsWith('data:')
      ? p
      : `data:image/jpeg;base64,${p}`;

  return (
    <div className="card-premium overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/20 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Images className="w-4 h-4 text-accent" />
          Registration Photos
          <span className="text-xs font-normal text-muted-foreground">({allPhotos.length} photo{allPhotos.length !== 1 ? 's' : ''})</span>
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-border/40">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-3">
            {allPhotos.map((item, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border/40 bg-muted/30">
                <img
                  src={toSrc(item.src)}
                  alt={`${item.label} ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 left-0 right-0 text-[9px] font-semibold text-white bg-black/50 backdrop-blur-sm text-center py-0.5 uppercase tracking-wide">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckInPage() {
  const router = useRouter();
  const params = useParams();
  const { store, currentUser, setVehicleEvents, setDamages, setNotifications, refreshVehicles, showToast } = useApp();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [currentDamage, setCurrentDamage] = useState<{ part: string; photos: string[]; notes: string } | null>(null);
  const [allDamages, setAllDamages] = useState<Array<{ part: string; photos: string[]; notes: string; severity: 'low' | 'medium' | 'high' }>>([]);
  const [step, setStep] = useState<'validation' | 'car-layout' | 'capture-damage' | 'review' | 'success'>('validation');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const vehicleData = store.vehicles.find(v => v.id === params.id);
    setVehicle(vehicleData || null);
  }, [params.id, store.vehicles]);

  const handlePartClick = (partId: string) => {
    if (selectedParts.includes(partId)) {
      setSelectedParts(selectedParts.filter(p => p !== partId));
      setAllDamages(allDamages.filter(d => d.part !== partId));
    } else {
      setSelectedParts([...selectedParts, partId]);
      setCurrentDamage({ part: partId, photos: [], notes: '' });
      setStep('capture-damage');
    }
  };

  const handleSaveDamage = (severity: 'low' | 'medium' | 'high') => {
    if (currentDamage) {
      setAllDamages([...allDamages, { ...currentDamage, severity }]);
      setCurrentDamage(null);
      setStep('car-layout');
    }
  };

  const handleSkipDamage = () => {
    if (currentDamage) {
      setSelectedParts(selectedParts.filter(p => p !== currentDamage.part));
      setCurrentDamage(null);
      setStep('car-layout');
    }
  };

  const handleComplete = async () => {
    if (!vehicle || !currentUser) return;

    setLoading(true);

    try {
      const timestamp = new Date().toISOString();
      const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Update vehicle status via API — pass full vehicle so existing extras (color,
      // registrationCompleted, notes) are preserved in the nickname JSON field.
      await carsApi.update(vehicle.id, vehicleToCarUpdate({ ...vehicle, status: 'in_storage', statusUpdatedAt: timestamp }));

      // Create vehicle event
      const newEvent: VehicleEvent = {
        id: eventId,
        eventType: 'arrival_after_use',
        vehicleId: vehicle.id,
        facilityId: vehicle.facilityId || currentUser.facilityId,
        staffUserId: currentUser.id,
        timestamp: timestamp,
        damagesCaptured: allDamages.map(d => d.part),
        notes: '',
      };
      setVehicleEvents([...store.vehicleEvents, newEvent]);

      // Create damages
      if (allDamages.length > 0) {
        const newDamages: Damage[] = allDamages.map((damage, index) => ({
          id: `dmg_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
          vehicleId: vehicle.id,
          eventId: eventId,
          status: 'open' as const,
          carPart: damage.part as Damage['carPart'],
          severity: damage.severity,
          photos: damage.photos,
          description: damage.notes,
          createdAt: timestamp,
        }));
        setDamages([...store.damages, ...newDamages]);

        // Create notification for damage
        const newNotification = {
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'new_damage_recorded' as const,
          audience: 'individual' as const,
          clientId: vehicle.clientId,
          title: 'New Damage Recorded',
          message: `${allDamages.length} damage(s) recorded during check-in for ${vehicle.make} ${vehicle.model}`,
          status: 'sent' as const,
          createdAt: timestamp,
        };
        setNotifications([...store.notifications, newNotification]);
      }

      await refreshVehicles();
      setStep('success');
    } catch (error) {
      console.error('[v0] Check-in error:', error);
      showToast('Failed to check in vehicle', 'error');
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

  // ── STEP: validation ────────────────────────────────────────────────────────
  if (step === 'validation') {
    const canCheckIn = vehicle.status === 'checked_out';

    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-[hsl(var(--surface-dark))] text-white p-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold">Check-In Vehicle</h1>
              <p className="text-sm text-white/70">Step 1 of 3 — Validation</p>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-4">
          <VehicleSummary vehicle={vehicle} ownerName={ownerName} />
          <PhotoGallery vehicle={vehicle} />

          <div className={`card-premium p-6 space-y-4 ${!canCheckIn ? 'border-destructive' : 'border-success'}`}>
            <div className="flex items-start gap-3">
              {canCheckIn ? (
                <Check className="w-6 h-6 text-success flex-shrink-0 mt-1" />
              ) : (
                <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold mb-2">
                  {canCheckIn ? 'Ready for Check-In' : 'Cannot Check In'}
                </h3>

                {!vehicle.registrationCompleted && canCheckIn && (
                  <p className="text-sm text-amber-600 mb-3">
                    Note: Registration is incomplete, but check-in is still allowed.
                  </p>
                )}

                {vehicle.status === 'in_storage' && (
                  <p className="text-sm text-destructive mb-3">
                    Vehicle is already checked in. Please check out first.
                  </p>
                )}

                {vehicle.status === 'archived' && (
                  <p className="text-sm text-destructive mb-3">
                    Vehicle is archived. Please unarchive first.
                  </p>
                )}
              </div>
            </div>

            {canCheckIn ? (
              <Button onClick={() => setStep('car-layout')} className="w-full btn-dark">
                Continue to Condition Record
              </Button>
            ) : (
              <Button onClick={() => router.push(`/vehicles/${vehicle.id}`)} variant="outline" className="w-full">
                Go to Vehicle Details
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── STEP: car-layout ────────────────────────────────────────────────────────
  if (step === 'car-layout') {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-[hsl(var(--surface-dark))] text-white p-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setStep('validation')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-semibold">Entry Condition</h1>
              <p className="text-sm text-white/70">Step 2 of 3 — Record vehicle condition</p>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-4">
          <VehicleSummary vehicle={vehicle} ownerName={ownerName} />
          <PhotoGallery vehicle={vehicle} />

          <div className="card-premium p-4">
            <div className="relative w-full aspect-[2/3] bg-muted/20 rounded-lg">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <g className="text-muted-foreground/30" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M30,12 C30,5 70,5 70,12 L76,35 C78,45 78,60 76,75 C75,88 70,95 50,95 C30,95 25,88 24,75 C22,60 22,45 24,35 Z" />
                  <path d="M28,33 Q50,38 72,33 L66,45 Q50,43 34,45 Z" fill="currentColor" fillOpacity="0.05" />
                  <path d="M33,72 Q50,69 67,72 L62,62 Q50,64 38,62 Z" fill="currentColor" fillOpacity="0.05" />
                  <rect x="34" y="45" width="32" height="17" rx="6" />
                  <path d="M33,13 L31,28 M67,13 L69,28" strokeWidth="1" className="text-muted-foreground/20" />
                  <path d="M30,85 Q50,82 70,85" strokeWidth="1" className="text-muted-foreground/20" />
                  <path d="M25,38 L21,38 C19,38 19,42 22,42 Z" fill="currentColor" opacity="0.5" />
                  <path d="M75,38 L79,38 C81,38 81,42 78,42 Z" fill="currentColor" opacity="0.5" />
                </g>

                {CAR_PARTS.map(part => (
                  <circle
                    key={part.id}
                    cx={part.x}
                    cy={part.y}
                    r="4"
                    className={`cursor-pointer transition-all ${
                      selectedParts.includes(part.id)
                        ? 'fill-destructive stroke-destructive'
                        : 'fill-muted stroke-muted-foreground hover:fill-destructive/50'
                    }`}
                    strokeWidth="1"
                    onClick={() => handlePartClick(part.id)}
                  />
                ))}
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Tap a point to document damage. Leave blank if the vehicle is in good condition — this record is for reference only.
            </p>
            {selectedParts.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedParts.map(partId => {
                  const part = CAR_PARTS.find(p => p.id === partId);
                  return (
                    <div key={partId} className="bg-destructive/10 text-destructive px-3 py-1 rounded-full text-sm">
                      {part?.label}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Button onClick={() => setStep('review')} className="w-full btn-dark">
            {selectedParts.length === 0 ? 'Continue — No Issues Found' : 'Review & Complete'}
          </Button>
        </div>
      </div>
    );
  }

  // ── STEP: capture-damage ────────────────────────────────────────────────────
  if (step === 'capture-damage' && currentDamage) {
    const part = CAR_PARTS.find(p => p.id === currentDamage.part);

    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-[hsl(var(--surface-dark))] text-white p-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={handleSkipDamage}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold">Document Condition</h1>
              <p className="text-sm text-white/70">{part?.label}</p>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-4">
          <VehicleSummary vehicle={vehicle} ownerName={ownerName} />

          <PhotoCapture
            maxPhotos={4}
            photos={currentDamage.photos}
            onPhotosChange={(photos) => setCurrentDamage({ ...currentDamage, photos })}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (optional)</label>
            <Textarea
              value={currentDamage.notes}
              onChange={(e) => setCurrentDamage({ ...currentDamage, notes: e.target.value })}
              placeholder="Describe the damage..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Severity</label>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={() => handleSaveDamage('low')} className="h-12">Low</Button>
              <Button variant="outline" onClick={() => handleSaveDamage('medium')} className="h-12">Medium</Button>
              <Button
                variant="outline"
                onClick={() => handleSaveDamage('high')}
                className="h-12 border-destructive text-destructive hover:bg-destructive hover:text-white"
              >
                High
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP: review ────────────────────────────────────────────────────────────
  if (step === 'review') {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-[hsl(var(--surface-dark))] text-white p-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setStep('car-layout')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold">Review Check-In</h1>
              <p className="text-sm text-white/70">Step 3 of 3 — {allDamages.length === 0 ? 'No issues' : `${allDamages.length} issue(s) noted`}</p>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-4">
          <VehicleSummary vehicle={vehicle} ownerName={ownerName} />

          {allDamages.length === 0 && (
            <div className="card-premium p-5 text-center text-muted-foreground">
              <Check className="w-8 h-8 text-success mx-auto mb-2" />
              <p className="text-sm font-medium">Good condition — no issues noted</p>
              <p className="text-xs mt-1">Vehicle will be checked in clean.</p>
            </div>
          )}

          {allDamages.map((damage, index) => {
            const part = CAR_PARTS.find(p => p.id === damage.part);
            return (
              <div key={index} className="card-premium p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{part?.label}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    damage.severity === 'high' ? 'bg-destructive/10 text-destructive' :
                    damage.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-700' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {damage.severity}
                  </span>
                </div>
                {damage.photos.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {damage.photos.map((photo, i) => (
                      <img key={i} src={photo} alt="" className="w-20 h-20 object-cover rounded" />
                    ))}
                  </div>
                )}
                {damage.notes && (
                  <p className="text-sm text-muted-foreground">{damage.notes}</p>
                )}
              </div>
            );
          })}

          <Button onClick={handleComplete} disabled={loading} className="w-full btn-dark h-12">
            {loading ? 'Completing Check-In...' : 'Complete Check-In'}
          </Button>
        </div>
      </div>
    );
  }

  // ── STEP: success ────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-6">
          <Check className="w-10 h-10 text-success" />
        </div>

        <h1 className="text-2xl font-bold mb-2">Check-In Complete</h1>
        <p className="text-muted-foreground mb-4 text-balance">
          {vehicle.make} {vehicle.model} has been successfully checked in.
          {allDamages.length > 0 && ` ${allDamages.length} damage record(s) logged.`}
        </p>

        {/* Summary recap */}
        <div className="w-full max-w-sm mb-6">
          <VehicleSummary vehicle={vehicle} ownerName={ownerName} />
        </div>

        <div className="w-full max-w-sm space-y-3">
          <Button className="w-full btn-dark h-12 text-base" onClick={() => router.push('/check-in')}>
            Return to Check-In List
          </Button>
          <Button variant="ghost" className="w-full h-12" onClick={() => router.push(`/vehicles/${vehicle.id}`)}>
            View Vehicle Details
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
