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
  { id: 'front_bumper', label: 'Front Bumper', x: 50, y: -8 },
  { id: 'hood', label: 'Hood', x: 50, y: 4 },
  { id: 'windshield', label: 'Windshield', x: 50, y: 22 },
  { id: 'roof', label: 'Roof', x: 50, y: 45 },
  { id: 'left_front_door', label: 'Left Front Door', x: 30, y: 35 },
  { id: 'left_rear_door', label: 'Left Rear Door', x: 30, y: 60 },
  { id: 'right_front_door', label: 'Right Front Door', x: 70, y: 35 },
  { id: 'right_rear_door', label: 'Right Rear Door', x: 70, y: 60 },
  { id: 'trunk', label: 'Trunk', x: 50, y: 90 },
  { id: 'rear_bumper', label: 'Rear Bumper', x: 50, y: 106 },
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
  const [okParts, setOkParts] = useState<string[]>([]);
  const [partData, setPartData] = useState<Record<string, { photos: string[]; notes: string; severity?: 'low' | 'medium' | 'high' }>>({});
  const [currentDamage, setCurrentDamage] = useState<{ part: string; photos: string[]; notes: string; severity?: 'low' | 'medium' | 'high' } | null>(null);
  const [newDamages, setNewDamages] = useState<Array<{ part: string; photos: string[]; notes: string; severity: 'low' | 'medium' | 'high' }>>([]);
  const [resolvedDamageIds, setResolvedDamageIds] = useState<string[]>([]);

  useEffect(() => {
    const vehicleData = store.vehicles.find(v => v.id === params.id);
    setVehicle(vehicleData || null);
  }, [params.id, store.vehicles]);

  // Pre-load diagram state from last check-in event (okParts, partData, damages)
  const [preloaded, setPreloaded] = useState(false);
  useEffect(() => {
    if (!vehicle || preloaded) return;

    const lastArrival = [...store.vehicleEvents]
      .filter(e => e.vehicleId === vehicle.id && e.eventType === 'arrival_after_use')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    const newPartData: Record<string, { photos: string[]; notes: string; severity?: 'low' | 'medium' | 'high' }> = {};
    const newSelected: string[] = [];
    const newOk: string[] = [];

    // 1) Restore partData and okParts saved on the event
    if (lastArrival?.partData) {
      Object.assign(newPartData, lastArrival.partData);
    }
    if (lastArrival?.okParts) {
      newOk.push(...lastArrival.okParts);
    }

    // 2) Open damages → red points (override any OK if damage is still open)
    const openDamages = store.damages.filter(d => d.vehicleId === vehicle.id && d.status === 'open');
    openDamages.forEach(d => {
      newPartData[d.carPart] = {
        photos: d.photos || [],
        notes: d.description || '',
        severity: d.severity,
      };
      newSelected.push(d.carPart);
      // Remove from okParts if it was there
      const okIdx = newOk.indexOf(d.carPart);
      if (okIdx !== -1) newOk.splice(okIdx, 1);
    });

    if (Object.keys(newPartData).length > 0 || newOk.length > 0) {
      setPartData(newPartData);
      setSelectedParts(newSelected);
      setOkParts(newOk);
    }
    setPreloaded(true);
  }, [vehicle, store.damages, store.vehicleEvents, preloaded]);

  const handlePartClick = (partId: string) => {
    const saved = partData[partId];
    if (saved) {
      setCurrentDamage({ part: partId, photos: saved.photos || [], notes: saved.notes || '', severity: saved.severity });
    } else {
      // Check if this part has an existing open damage from previous check-in
      const existingDmg = existingOpenDamages.find(d => d.carPart === partId);
      if (existingDmg) {
        setCurrentDamage({
          part: partId,
          photos: existingDmg.photos || [],
          notes: existingDmg.description || '',
          severity: existingDmg.severity as 'low' | 'medium' | 'high' | undefined,
        });
      } else {
        setCurrentDamage({ part: partId, photos: [], notes: '', severity: undefined });
      }
    }
    setStep('capture-damage');
  };

  const handleMarkOk = () => {
    if (currentDamage) {
      const partId = currentDamage.part;
      setPartData({ ...partData, [partId]: { photos: currentDamage.photos, notes: currentDamage.notes } });
      if (currentDamage.photos.length > 0) {
        setOkParts([...okParts.filter(p => p !== partId), partId]);
      } else {
        setOkParts(okParts.filter(p => p !== partId));
      }
      setSelectedParts(selectedParts.filter(p => p !== partId));
      setNewDamages(newDamages.filter(d => d.part !== partId));
      // If this part had an existing open damage, mark it as resolved
      const existingDmg = existingOpenDamages.find(d => d.carPart === partId);
      if (existingDmg && !resolvedDamageIds.includes(existingDmg.id)) {
        setResolvedDamageIds([...resolvedDamageIds, existingDmg.id]);
      }
      setCurrentDamage(null);
      setStep('inspection');
    }
  };

  const handleSaveDamage = () => {
    if (currentDamage && currentDamage.severity) {
      const partId = currentDamage.part;
      const damage = { ...currentDamage, severity: currentDamage.severity };
      setPartData({ ...partData, [partId]: { photos: currentDamage.photos, notes: currentDamage.notes, severity: currentDamage.severity } });
      setSelectedParts([...selectedParts.filter(p => p !== partId), partId]);
      setOkParts(okParts.filter(p => p !== partId));
      setNewDamages([...newDamages.filter(d => d.part !== partId), damage]);
      setCurrentDamage(null);
      setStep('inspection');
    }
  };

  const handleSkipDamage = () => {
    if (currentDamage) {
      // Preserve any photos/notes taken before going back
      if (currentDamage.photos.length > 0 || currentDamage.notes) {
        setPartData({ ...partData, [currentDamage.part]: { photos: currentDamage.photos, notes: currentDamage.notes, severity: currentDamage.severity } });
      }
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

      // Create vehicle event — include okParts and partData so next check-in can restore diagram
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
        okParts: [...okParts],
        partData: { ...partData },
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
          <Button className="w-full btn-dark h-12 text-base" onClick={() => router.push('/dashboard')}>
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
                  <div className="flex items-center gap-2 min-w-0">
                    <ClipboardList className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-sm font-semibold whitespace-nowrap">Last Check-In</span>
                    {existingOpenDamages.length > 0 ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20 whitespace-nowrap">
                        {existingOpenDamages.length} open
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20 whitespace-nowrap">
                        OK
                      </span>
                    )}
                  </div>
                  {showCheckInSummary
                    ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
                    : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
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

          {/* Car diagram — new damage */}
          <div className="card-premium p-4 space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              New Damage — Tap to Mark
            </h3>
            <div className="relative w-full aspect-[2/3] bg-muted/20 rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/auto.png" alt="Vehicle inspection" className="w-full h-full object-contain" />
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                {CAR_PARTS.map(part => {
                  const hasExistingDamage = existingOpenDamages.some(d => d.carPart === part.id);
                  return (
                    <circle
                      key={part.id}
                      cx={part.x}
                      cy={part.y}
                      r="4"
                      className={`cursor-pointer transition-all ${
                        okParts.includes(part.id)
                          ? 'fill-green-500 stroke-green-600'
                          : selectedParts.includes(part.id)
                          ? 'fill-destructive stroke-destructive'
                          : hasExistingDamage
                          ? 'fill-destructive stroke-destructive'
                          : 'fill-muted stroke-muted-foreground hover:fill-destructive/50'
                      }`}
                      strokeWidth="1"
                      onClick={() => handlePartClick(part.id)}
                    />
                  );
                })}
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
              <h1 className="font-semibold">New Event</h1>
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
              {(['low', 'medium', 'high'] as const).map(sev => (
                <Button
                  key={sev}
                  variant="outline"
                  onClick={() => setCurrentDamage({ ...currentDamage, severity: sev })}
                  className={`h-12 ${
                    currentDamage.severity === sev
                      ? sev === 'high' ? 'bg-destructive text-white border-destructive'
                        : sev === 'medium' ? 'bg-yellow-500 text-white border-yellow-500'
                        : 'bg-blue-500 text-white border-blue-500'
                      : sev === 'high' ? 'border-destructive text-destructive hover:bg-destructive hover:text-white'
                      : ''
                  }`}
                >
                  {sev.charAt(0).toUpperCase() + sev.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button variant="outline" onClick={handleMarkOk} className="h-12 border-green-500 text-green-600 hover:bg-green-500 hover:text-white">
              OK — No Damage
            </Button>
            <Button
              onClick={handleSaveDamage}
              disabled={!currentDamage.severity}
              className="h-12 btn-dark"
            >
              Confirm
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP: review ────────────────────────────────────────────────────────────
  if (step === 'review') {
    // Counts based on actual diagram state
    const openCount = selectedParts.length;      // red points = open/unresolved damages
    const okCount = okParts.length;              // green points = OK / resolved
    const newCount = newDamages.length;          // new damages added in this session
    const noIssues = openCount === 0 && newCount === 0;

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
              <div className={`p-3 rounded-xl ${openCount > 0 ? 'bg-destructive/5 border border-destructive/20' : 'bg-success/5 border border-success/20'}`}>
                <p className={`text-2xl font-bold ${openCount > 0 ? 'text-destructive' : 'text-success'}`}>{openCount}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Open Damages</p>
              </div>
              <div className={`p-3 rounded-xl ${newCount > 0 ? 'bg-destructive/5 border border-destructive/20' : 'bg-muted/30 border border-border/40'}`}>
                <p className={`text-2xl font-bold ${newCount > 0 ? 'text-destructive' : 'text-foreground'}`}>{newCount}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">New Damages</p>
              </div>
              <div className={`p-3 rounded-xl ${okCount > 0 ? 'bg-success/5 border border-success/20' : 'bg-muted/30 border border-border/40'}`}>
                <p className={`text-2xl font-bold ${okCount > 0 ? 'text-success' : 'text-foreground'}`}>{okCount}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">OK / Resolved</p>
              </div>
            </div>

            {noIssues && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-success/5 border border-success/20">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                <p className="text-sm text-success font-medium">Vehicle exits clean — no open damages</p>
              </div>
            )}
          </div>

          {/* Open damages detail (red points) */}
          {selectedParts.length > 0 && (
            <div className="card-premium p-4 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-destructive">Open Damages</h3>
              {selectedParts.map(partId => {
                const part = CAR_PARTS.find(p => p.id === partId);
                const data = partData[partId];
                return (
                  <div key={partId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{part?.label}</p>
                      {data?.severity && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          data.severity === 'high' ? 'bg-destructive/10 text-destructive' :
                          data.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-700' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {data.severity}
                        </span>
                      )}
                    </div>
                    {data?.photos && data.photos.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto">
                        {data.photos.map((photo, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={i} src={photo} alt="" className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                        ))}
                      </div>
                    )}
                    {data?.notes && <p className="text-xs text-muted-foreground">{data.notes}</p>}
                  </div>
                );
              })}
            </div>
          )}

          {/* OK / Resolved detail (green points) */}
          {okParts.length > 0 && (
            <div className="card-premium p-4 space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-success">OK / Resolved</h3>
              {okParts.map(partId => {
                const part = CAR_PARTS.find(p => p.id === partId);
                return (
                  <div key={partId} className="flex items-center gap-2 p-2 rounded-lg bg-success/5">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                    <p className="text-sm">{part?.label}</p>
                  </div>
                );
              })}
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
