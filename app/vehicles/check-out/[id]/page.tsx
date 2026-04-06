'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useApp } from '@/lib/context/app-context';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Check, AlertCircle, Car, User, ClipboardList, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, Images, Shield, Home } from 'lucide-react';
import { Vehicle, VehicleEvent, Damage } from '@/lib/types';
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

export default function CheckOutPage() {
  const router = useRouter();
  const params = useParams();
  const { store, currentUser, setVehicleEvents, setDamages, setNotifications, refreshVehicles, showToast } = useApp();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'validation' | 'inspection' | 'capture-damage' | 'review' | 'success'>('validation');
  const [showCheckInSummary, setShowCheckInSummary] = useState(false);

  // Inspection state
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [currentDamage, setCurrentDamage] = useState<{ part: string; photos: string[]; notes: string } | null>(null);
  const [newDamages, setNewDamages] = useState<Array<{ part: string; photos: string[]; notes: string; severity: 'low' | 'medium' | 'high' }>>([]);
  const [resolvedDamageIds, setResolvedDamageIds] = useState<string[]>([]);

  useEffect(() => {
    const vehicleData = store.vehicles.find(v => v.id === params.id);
    setVehicle(vehicleData || null);
  }, [params.id, store.vehicles]);

  const handlePartClick = (partId: string) => {
    if (selectedParts.includes(partId)) {
      setSelectedParts(selectedParts.filter(p => p !== partId));
      setNewDamages(newDamages.filter(d => d.part !== partId));
    } else {
      setSelectedParts([...selectedParts, partId]);
      setCurrentDamage({ part: partId, photos: [], notes: '' });
      setStep('capture-damage');
    }
  };

  const handleSaveDamage = (severity: 'low' | 'medium' | 'high') => {
    if (currentDamage) {
      setNewDamages([...newDamages, { ...currentDamage, severity }]);
      setCurrentDamage(null);
      setStep('inspection');
    }
  };

  const handleSkipDamage = () => {
    if (currentDamage) {
      setSelectedParts(selectedParts.filter(p => p !== currentDamage.part));
      setCurrentDamage(null);
      setStep('inspection');
    }
  };

  const toggleResolved = (damageId: string) => {
    setResolvedDamageIds(prev =>
      prev.includes(damageId) ? prev.filter(id => id !== damageId) : [...prev, damageId]
    );
  };

  const handleComplete = async () => {
    if (!vehicle || !currentUser) return;

    setLoading(true);

    try {
      const timestamp = new Date().toISOString();
      const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Update vehicle status via API — pass full vehicle to preserve nickname JSON
      await carsApi.update(vehicle.id, vehicleToCarUpdate({ ...vehicle, status: 'checked_out', statusUpdatedAt: timestamp }));

      // Create vehicle event
      const newEvent: VehicleEvent = {
        id: eventId,
        eventType: 'departure_after_use',
        vehicleId: vehicle.id,
        facilityId: vehicle.facilityId || currentUser.facilityId,
        staffUserId: currentUser.id,
        timestamp: timestamp,
        damagesCaptured: newDamages.map(d => d.part),
        notes: resolvedDamageIds.length > 0
          ? `Resolved ${resolvedDamageIds.length} damage(s). ${newDamages.length > 0 ? `New: ${newDamages.map(d => d.part).join(', ')}.` : ''}`
          : '',
      };
      setVehicleEvents([...store.vehicleEvents, newEvent]);

      // Build final damages array in one shot: resolve old + append new
      const newDamageRecords: Damage[] = newDamages.map((damage, index) => ({
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

      const updatedExisting = store.damages.map(d =>
        resolvedDamageIds.includes(d.id) ? { ...d, status: 'resolved' as const } : d
      );
      setDamages([...updatedExisting, ...newDamageRecords]);

      if (newDamages.length > 0) {
        const newNotification = {
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'new_damage_recorded' as const,
          audience: 'individual' as const,
          clientId: vehicle.clientId,
          title: 'New Damage at Check-Out',
          message: `${newDamages.length} new damage(s) recorded during check-out for ${vehicle.make} ${vehicle.model}`,
          status: 'sent' as const,
          createdAt: timestamp,
        };
        setNotifications([...store.notifications, newNotification]);
      }

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

  const canCheckOut = vehicle.status === 'in_storage';

  // Open damages from last check-in (used in inspection + review)
  const lastCheckIn = [...store.vehicleEvents]
    .filter(e => e.vehicleId === vehicle.id && e.eventType === 'arrival_after_use')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

  const existingOpenDamages: Damage[] = lastCheckIn
    ? store.damages.filter(d => d.vehicleId === vehicle.id && d.eventId === lastCheckIn.id && d.status === 'open')
    : store.damages.filter(d => d.vehicleId === vehicle.id && d.status === 'open');

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
          {newDamages.length > 0 && ` ${newDamages.length} new damage(s) recorded.`}
          {resolvedDamageIds.length > 0 && ` ${resolvedDamageIds.length} damage(s) marked resolved.`}
        </p>

        <div className="w-full max-w-sm mb-6">
          <VehicleSummary vehicle={vehicle} ownerName={ownerName} />
        </div>

        <div className="w-full max-w-sm space-y-3">
          <Button className="w-full btn-dark h-12 text-base" onClick={() => router.push('/')}>
            <Home className="w-4 h-4 mr-2" />
            Return to Home
          </Button>
          <Button variant="outline" className="w-full h-12" onClick={() => router.push('/check-out')}>
            Check-Out List
          </Button>
          <Button variant="ghost" className="w-full h-12" onClick={() => router.push(`/vehicles/${vehicle.id}`)}>
            View Vehicle Details
          </Button>
        </div>
      </div>
    );
  }

  // ── STEP: validation ────────────────────────────────────────────────────────
  if (step === 'validation') {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-[hsl(var(--surface-dark))] text-white p-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold">Check-Out Vehicle</h1>
              <p className="text-sm text-white/70">Step 1 of 3 — Validation</p>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-4">
          <VehicleSummary vehicle={vehicle} ownerName={ownerName} />
          <PhotoGallery vehicle={vehicle} />

          {/* Last Check-In Summary */}
          {lastCheckIn && (() => {
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
                    {existingOpenDamages.length > 0 ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                        {existingOpenDamages.length} open damage{existingOpenDamages.length !== 1 ? 's' : ''}
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
                      {existingOpenDamages.length === 0 ? (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-success/5 border border-success/20">
                          <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                          <p className="text-sm text-success font-medium">No damages recorded</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {existingOpenDamages.map(damage => (
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

          <div className={`card-premium p-6 space-y-4 ${!canCheckOut ? 'border-destructive' : 'border-success'}`}>
            <div className="flex items-start gap-3">
              {canCheckOut ? (
                <Shield className="w-6 h-6 text-success flex-shrink-0 mt-1" />
              ) : (
                <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold mb-2">
                  {canCheckOut ? 'Ready for Exit Inspection' : 'Cannot Check Out'}
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
                    An exit inspection is required before check-out. You will be able to document new damage or mark previous damage as resolved.
                  </p>
                )}
              </div>
            </div>

            {canCheckOut ? (
              <Button onClick={() => setStep('inspection')} className="w-full btn-dark">
                Start Exit Inspection
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

  // ── STEP: inspection ────────────────────────────────────────────────────────
  if (step === 'inspection') {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-[hsl(var(--surface-dark))] text-white p-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setStep('validation')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-semibold">Exit Inspection</h1>
              <p className="text-sm text-white/70">Step 2 of 3 — Review vehicle condition</p>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-4">
          <VehicleSummary vehicle={vehicle} ownerName={ownerName} />

          {/* Existing open damages — mark resolved */}
          {existingOpenDamages.length > 0 && (
            <div className="card-premium p-4 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Previous Damages — Mark if Resolved
              </h3>
              <div className="space-y-2">
                {existingOpenDamages.map(damage => {
                  const isResolved = resolvedDamageIds.includes(damage.id);
                  return (
                    <button
                      key={damage.id}
                      onClick={() => toggleResolved(damage.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                        isResolved
                          ? 'bg-success/5 border-success/30'
                          : 'bg-destructive/[0.04] border-destructive/10'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isResolved
                          ? <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                          : <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                        }
                        <div>
                          <p className={`text-sm font-medium capitalize ${isResolved ? 'line-through text-muted-foreground' : ''}`}>
                            {damage.carPart.replace(/_/g, ' ')}
                          </p>
                          {damage.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{damage.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                          damage.severity === 'high'
                            ? 'bg-destructive/10 text-destructive'
                            : damage.severity === 'medium'
                            ? 'bg-yellow-500/10 text-yellow-700'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {damage.severity}
                        </span>
                        <span className={`text-xs font-semibold ${isResolved ? 'text-success' : 'text-muted-foreground'}`}>
                          {isResolved ? 'Resolved' : 'Tap to resolve'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Car diagram — new damage */}
          <div className="card-premium p-4 space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              New Damage — Tap to Mark
            </h3>
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

            {selectedParts.length > 0 && (
              <div className="flex flex-wrap gap-2">
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

            {selectedParts.length === 0 && (
              <p className="text-xs text-muted-foreground text-center">No new damage — tap a point to mark</p>
            )}
          </div>

          <Button onClick={() => setStep('review')} className="w-full btn-dark h-12">
            Continue to Review
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
              <h1 className="font-semibold">Document New Damage</h1>
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
    const hasChanges = newDamages.length > 0 || resolvedDamageIds.length > 0;
    const unresolvedCount = existingOpenDamages.filter(d => !resolvedDamageIds.includes(d.id)).length;

    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-[hsl(var(--surface-dark))] text-white p-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setStep('inspection')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold">Review Check-Out</h1>
              <p className="text-sm text-white/70">Step 3 of 3 — Confirm exit state</p>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-4">
          <VehicleSummary vehicle={vehicle} ownerName={ownerName} />

          {/* Exit state summary */}
          <div className="card-premium p-4 space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Exit Summary</h3>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className={`p-3 rounded-xl ${unresolvedCount > 0 ? 'bg-destructive/5 border border-destructive/20' : 'bg-success/5 border border-success/20'}`}>
                <p className={`text-2xl font-bold ${unresolvedCount > 0 ? 'text-destructive' : 'text-success'}`}>{unresolvedCount}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Open Damages</p>
              </div>
              <div className={`p-3 rounded-xl ${newDamages.length > 0 ? 'bg-destructive/5 border border-destructive/20' : 'bg-muted/30 border border-border/40'}`}>
                <p className={`text-2xl font-bold ${newDamages.length > 0 ? 'text-destructive' : 'text-foreground'}`}>{newDamages.length}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">New Damages</p>
              </div>
              <div className={`p-3 rounded-xl ${resolvedDamageIds.length > 0 ? 'bg-success/5 border border-success/20' : 'bg-muted/30 border border-border/40'}`}>
                <p className={`text-2xl font-bold ${resolvedDamageIds.length > 0 ? 'text-success' : 'text-foreground'}`}>{resolvedDamageIds.length}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Resolved</p>
              </div>
            </div>

            {!hasChanges && existingOpenDamages.length === 0 && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-success/5 border border-success/20">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                <p className="text-sm text-success font-medium">Vehicle exits clean — no damages</p>
              </div>
            )}
          </div>

          {/* New damages detail */}
          {newDamages.length > 0 && (
            <div className="card-premium p-4 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">New Damages Recorded</h3>
              {newDamages.map((damage, index) => {
                const part = CAR_PARTS.find(p => p.id === damage.part);
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{part?.label}</p>
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
                          <img key={i} src={photo} alt="" className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                        ))}
                      </div>
                    )}
                    {damage.notes && <p className="text-xs text-muted-foreground">{damage.notes}</p>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Resolved damages detail */}
          {resolvedDamageIds.length > 0 && (
            <div className="card-premium p-4 space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Damages Marked Resolved</h3>
              {existingOpenDamages.filter(d => resolvedDamageIds.includes(d.id)).map(damage => (
                <div key={damage.id} className="flex items-center gap-2 p-2 rounded-lg bg-success/5">
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                  <p className="text-sm capitalize line-through text-muted-foreground">{damage.carPart.replace(/_/g, ' ')}</p>
                </div>
              ))}
            </div>
          )}

          <Button onClick={handleComplete} disabled={loading} className="w-full btn-dark h-12">
            {loading ? 'Completing Check-Out...' : 'Complete Check-Out'}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
