'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useApp } from '@/lib/context/app-context';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  LogIn,
  LogOut,
  Archive,
  AlertCircle,
  AlertTriangle,
  Pencil,
  Loader2,
  Car,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle2,
} from 'lucide-react';
import { Vehicle, VehicleEvent } from '@/lib/types';
import { carsApi } from '@/lib/api/cars';
import { vehicleToCarUpdate } from '@/lib/api/mappers';
import { EditVehicleModal } from '@/components/shared/edit-vehicle-modal';
import Link from 'next/link';
import Image from 'next/image';

export default function VehicleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { currentUser, store, showToast, addActivityLog, refreshVehicles, setVehicleEvents } = useApp();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    const found = store.vehicles.find(v => v.id === params.id);
    if (found) {
      setVehicle(found);
    }
  }, [currentUser, store, params.id, router]);

  if (!currentUser || !vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading vehicle...</p>
        </div>
      </div>
    );
  }

  const client = store.clients.find(c => c.id === vehicle.clientId);
  const damages = store.damages.filter(d => d.vehicleId === vehicle.id);
  const openDamages = damages.filter(d => d.status === 'open');
  const events = store.vehicleEvents
    .filter(e => e.vehicleId === vehicle.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const canCheckIn = vehicle.status === 'checked_out';
  const canCheckOut = vehicle.status === 'in_storage';
  const isArchived = vehicle.status === 'archived';

  const handleArchive = async () => {
    setActionLoading(true);
    try {
      const now = new Date().toISOString();
      const newStatus = isArchived ? 'in_storage' : 'archived';
      await carsApi.update(vehicle.id, vehicleToCarUpdate({ ...vehicle, status: newStatus, statusUpdatedAt: now }));

      addActivityLog({
        entityType: 'vehicle',
        entityId: vehicle.id,
        action: isArchived ? 'Vehicle unarchived' : 'Vehicle archived',
        actorId: currentUser.id,
        actorName: `${currentUser.firstName} ${currentUser.lastName}`,
      });

      await refreshVehicles();
      showToast(isArchived ? 'Vehicle restored to storage' : 'Vehicle archived successfully', 'success');
      setShowArchiveModal(false);
    } catch {
      showToast('Action failed. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (vehicle.status !== 'checked_out') {
      showToast('Vehicle is already in storage', 'info');
      return;
    }

    setActionLoading(true);
    try {
      const now = new Date().toISOString();
      await carsApi.update(vehicle.id, vehicleToCarUpdate({ ...vehicle, status: 'in_storage', statusUpdatedAt: now }));

      const newEvent: VehicleEvent = {
        id: `event_${Date.now()}`,
        eventType: 'arrival_after_use',
        vehicleId: vehicle.id,
        facilityId: vehicle.facilityId || currentUser.facilityId,
        staffUserId: currentUser.id,
        timestamp: now,
        damagesCaptured: [],
        notes: '',
      };
      setVehicleEvents([newEvent, ...store.vehicleEvents]);

      addActivityLog({
        entityType: 'vehicle',
        entityId: vehicle.id,
        action: 'Vehicle checked in',
        actorId: currentUser.id,
        actorName: `${currentUser.firstName} ${currentUser.lastName}`,
      });

      await refreshVehicles();
      showToast('Vehicle checked in successfully', 'success');
      setShowCheckInModal(false);
    } catch {
      showToast('Failed to check in. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (vehicle.status) {
      case 'in_storage':
        return <span className="px-3 py-1.5 text-[12px] font-semibold rounded-full bg-success/10 text-success border border-success/20">In Storage</span>;
      case 'checked_out':
        return <span className="px-3 py-1.5 text-[12px] font-semibold rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">Checked Out</span>;
      case 'archived':
        return <span className="px-3 py-1.5 text-[12px] font-semibold rounded-full bg-muted text-muted-foreground border border-border/40">Archived</span>;
    }
  };

  const docs = vehicle.initialDocumentation;
  const mainPhoto = docs?.frontExterior?.find(p => p && p !== 'string')
    || docs?.rearExterior?.find(p => p && p !== 'string')
    || docs?.leftSide?.find(p => p && p !== 'string')
    || docs?.rightSide?.find(p => p && p !== 'string')
    || docs?.interior?.find(p => p && p !== 'string');

  return (
    <div className="min-h-screen pb-8 bg-background">
      {/* Header */}
      <div className="header-gradient border-b border-border/60 sticky top-0 z-30">
        <div className="px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1 hover:bg-muted rounded-xl transition-colors min-h-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-accent font-semibold">{vehicle.make}</p>
            <h1 className="text-lg font-bold flex items-center gap-2 truncate">
              {vehicle.model} {vehicle.year}
              <button 
                onClick={() => setShowEditModal(true)} 
                className="p-1.5 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-full transition-all min-h-0"
                title="Edit Vehicle"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </h1>
          </div>
          {getStatusBadge()}
        </div>
      </div>

      {/* Vehicle Image */}
      <div className="w-full bg-muted/50 border-b border-border/40 flex justify-center">
        <div className="relative w-full max-w-2xl aspect-[16/9] sm:aspect-[21/9] overflow-hidden">
          {mainPhoto ? (
            <img
              src={mainPhoto.startsWith('/') || mainPhoto.startsWith('http') || mainPhoto.startsWith('data:') ? mainPhoto : `data:image/jpeg;base64,${mainPhoto}`}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="w-full h-full object-contain bg-black/90"
            />
          ) : (
            <div className="relative w-full h-full bg-[#0a0a0a] flex flex-col items-center justify-center">
              <Image 
                src="/vehicle-placeholder.png" 
                alt="Vehicle Placeholder" 
                fill 
                className="object-cover object-center opacity-30 mix-blend-screen" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              <div className="relative z-10 flex flex-col items-center gap-2 mt-12">
                <Car className="w-10 h-10 text-muted-foreground/40" strokeWidth={1} />
                <span className="text-xs font-medium text-muted-foreground/50 uppercase tracking-widest">No photo available</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Registration Incomplete Warning */}
        {!vehicle.registrationCompleted && (
          <div className="card-premium p-4 bg-amber-500/[0.07] border-amber-500/20 animate-fade-in-up">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-600 text-sm">Partial Registration</p>
                <p className="text-xs text-amber-600/70 mt-1 leading-relaxed">
                  This vehicle is missing some legal expiration dates (Insurance/Registration) but is unlocked for Check-In/Out processing.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 animate-fade-in-up delay-75">
          <Button
            onClick={() => canCheckIn ? router.push(`/vehicles/check-in/${vehicle.id}`) : undefined}
            disabled={!canCheckIn}
            className={`h-13 rounded-xl font-semibold text-sm transition-all ${canCheckIn ? 'btn-dark' : ''}`}
            variant={canCheckIn ? 'default' : 'outline'}
          >
            <LogIn className="w-4 h-4 mr-2" />
            Check-in
          </Button>
          <Button
            onClick={() => canCheckOut ? router.push(`/vehicles/check-out/${vehicle.id}`) : undefined}
            disabled={!canCheckOut}
            className={`h-13 rounded-xl font-semibold text-sm transition-all ${canCheckOut ? 'btn-dark' : ''}`}
            variant={canCheckOut ? 'default' : 'outline'}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Check-out
          </Button>
        </div>

        {/* Archive / Unarchive */}
        <Button
          onClick={() => setShowArchiveModal(true)}
          variant="outline"
          className={`w-full rounded-xl font-medium text-sm h-11 animate-fade-in-up delay-100 ${
            isArchived
              ? 'border-success/40 text-success hover:bg-success/5'
              : 'border-muted-foreground/20 text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5'
          }`}
        >
          <Archive className="w-4 h-4 mr-2" />
          {isArchived ? 'Restore Vehicle' : 'Archive Vehicle'}
        </Button>

        {/* Documentation Photos Gallery — 3-column responsive grid */}
        {(() => {
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
            <div className="card-premium p-5 space-y-3 animate-fade-in-up delay-125">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Documentation Photos</h3>
                <span className="text-[11px] text-muted-foreground/60">{allPhotos.length} photo{allPhotos.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="divider-gold" />
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
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
          );
        })()}

        {/* Vehicle Info */}
        <div className="card-premium p-5 space-y-4 animate-fade-in-up delay-150">
          <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Vehicle Information</h3>
          <div className="divider-gold" />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">License Plate</p>
              <p className="font-bold text-base">{vehicle.licensePlate}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Color</p>
              <p className="font-medium flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-muted-foreground/30 border border-border" />
                {vehicle.color}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">VIN</p>
              <p className="font-mono text-xs text-muted-foreground">{vehicle.vin}</p>
            </div>
            {vehicle.odometer && (
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Odometer</p>
                <p className="font-medium">{vehicle.odometer.toLocaleString()} mi</p>
              </div>
            )}
            {vehicle.registrationExpDate && (
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Registration Exp.</p>
                {(() => {
                  const d = new Date(vehicle.registrationExpDate!);
                  const t = new Date(); const todayStr = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
                  const expired = vehicle.registrationExpDate! < todayStr;
                  return (
                    <p className={`text-sm font-medium flex items-center gap-1 ${expired ? 'text-destructive' : ''}`}>
                      {expired && <AlertCircle className="w-3 h-3 flex-shrink-0" />}
                      {d.toLocaleDateString()}
                    </p>
                  );
                })()}
              </div>
            )}
            {vehicle.insuranceExpDate && (
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Insurance Exp.</p>
                {(() => {
                  const d = new Date(vehicle.insuranceExpDate!);
                  const t = new Date(); const todayStr = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
                  const expired = vehicle.insuranceExpDate! < todayStr;
                  return (
                    <p className={`text-sm font-medium flex items-center gap-1 ${expired ? 'text-destructive' : ''}`}>
                      {expired && <AlertCircle className="w-3 h-3 flex-shrink-0" />}
                      {d.toLocaleDateString()}
                    </p>
                  );
                })()}
              </div>
            )}
          </div>

          {vehicle.notes && (
            <div className="pt-3 border-t border-border/40">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Notes</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{vehicle.notes}</p>
            </div>
          )}
        </div>

        {client && (
          <div className="card-premium p-5 animate-fade-in-up delay-200">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3">Owner</h3>
            <Link href={`/clients/${client.id}`} className="flex items-center gap-3 hover:bg-muted/30 p-2.5 -m-2.5 rounded-xl transition-all group">
              <div className="w-11 h-11 rounded-full bg-accent/10 flex items-center justify-center">
                <span className="text-sm font-bold text-accent">
                  {client.firstName === 'string' ? 'J' : client.firstName.charAt(0)}{client.lastName === 'string' ? 'D' : client.lastName.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-semibold">{client.firstName === 'string' ? 'John' : client.firstName} {client.lastName === 'string' ? 'Doe' : client.lastName}</p>
                <p className="text-xs text-muted-foreground">{client.email}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-accent transition-colors" />
            </Link>
          </div>
        )}

        {/* Open Damages */}
        {openDamages.length > 0 && (
          <div className="card-premium p-5 animate-fade-in-up delay-300">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm flex items-center gap-2 uppercase tracking-wider text-destructive">
                <AlertTriangle className="w-4 h-4" />
                Open Damages ({openDamages.length})
              </h3>
            </div>
            <div className="space-y-2">
              {openDamages.map(damage => (
                <div key={damage.id} className="flex items-center justify-between p-3 bg-destructive/[0.04] border border-destructive/10 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold capitalize">{damage.carPart.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-muted-foreground capitalize">{damage.severity} severity</p>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-lg h-8 text-xs">View</Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Movement History */}
        <div className="card-premium p-5 animate-fade-in-up delay-400">
          <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3">Movement History</h3>
          {events.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground/60">No activity yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {events.slice(0, 20).map((event) => {
                const staff = store.staffUsers.find(s => s.id === event.staffUserId);
                const eventDamages = store.damages.filter(d => d.eventId === event.id);
                const isExpanded = expandedEventId === event.id;
                const isCheckIn = event.eventType === 'arrival_after_use';
                const eventDate = new Date(event.timestamp);

                return (
                  <div key={event.id} className="rounded-xl overflow-hidden border border-border/40">
                    <button
                      onClick={() => setExpandedEventId(isExpanded ? null : event.id)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors text-left"
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCheckIn ? 'bg-success/10 text-success' : 'bg-blue-500/10 text-blue-600'
                      }`}>
                        {isCheckIn ? <LogIn className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">
                          {isCheckIn ? 'Checked In' : 'Checked Out'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown'} • {eventDate.toLocaleDateString()} {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {eventDamages.length > 0 && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                            {eventDamages.length} dmg
                          </span>
                        )}
                        {isExpanded
                          ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        }
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-border/40 p-3 space-y-3 bg-muted/10">
                        {/* Damages */}
                        {eventDamages.length === 0 ? (
                          <div className="flex items-center gap-2 text-success">
                            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                            <p className="text-xs font-medium">No damages recorded</p>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Damages</p>
                            {eventDamages.map(damage => (
                              <div key={damage.id} className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/30">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className={`w-3 h-3 flex-shrink-0 ${damage.status === 'resolved' ? 'text-muted-foreground' : 'text-destructive'}`} />
                                  <span className={`text-xs font-medium capitalize ${damage.status === 'resolved' ? 'line-through text-muted-foreground' : ''}`}>
                                    {damage.carPart.replace(/_/g, ' ')}
                                  </span>
                                  {damage.description && (
                                    <span className="text-xs text-muted-foreground hidden sm:inline truncate max-w-[120px]">— {damage.description}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${
                                    damage.severity === 'high' ? 'bg-destructive/10 text-destructive' :
                                    damage.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-700' :
                                    'bg-muted text-muted-foreground'
                                  }`}>{damage.severity}</span>
                                  {damage.status === 'resolved' && (
                                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-success/10 text-success">resolved</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Notes */}
                        {event.notes && (
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Notes</p>
                            <p className="text-xs text-muted-foreground">{event.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Check-in Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in" onClick={() => setShowCheckInModal(false)}>
          <div className="bg-card rounded-2xl w-full max-w-md p-6 space-y-4 animate-slide-in-bottom shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Check-in Vehicle</h2>
              <button onClick={() => setShowCheckInModal(false)} className="p-2 hover:bg-muted rounded-full transition-colors min-h-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Confirm check-in for <span className="font-semibold text-foreground">{vehicle.make} {vehicle.model}</span> ({vehicle.licensePlate})
            </p>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowCheckInModal(false)} className="flex-1 rounded-xl h-12">
                Cancel
              </Button>
              <Button onClick={handleCheckIn} disabled={actionLoading} className="flex-1 btn-dark rounded-xl h-12">
                {actionLoading ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Processing...</span>
                ) : 'Confirm Check-in'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Archive / Unarchive Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in" onClick={() => setShowArchiveModal(false)}>
          <div className="bg-card rounded-2xl w-full max-w-md p-6 space-y-4 animate-slide-in-bottom shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{isArchived ? 'Restore Vehicle' : 'Archive Vehicle'}</h2>
              <button onClick={() => setShowArchiveModal(false)} className="p-2 hover:bg-muted rounded-full transition-colors min-h-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              {isArchived
                ? <>Restore <span className="font-semibold text-foreground">{vehicle.make} {vehicle.model}</span> ({vehicle.licensePlate}) back to storage?</>
                : <>Archive <span className="font-semibold text-foreground">{vehicle.make} {vehicle.model}</span> ({vehicle.licensePlate})? Archived vehicles cannot be checked in or out.</>
              }
            </p>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowArchiveModal(false)} className="flex-1 rounded-xl h-12" disabled={actionLoading}>
                Cancel
              </Button>
              <Button
                onClick={handleArchive}
                disabled={actionLoading}
                className={`flex-1 rounded-xl h-12 ${isArchived ? 'bg-success hover:bg-success/90 text-white' : 'bg-destructive hover:bg-destructive/90 text-white'}`}
              >
                {actionLoading
                  ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Processing...</span>
                  : isArchived ? 'Restore' : 'Archive'
                }
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      <EditVehicleModal
        vehicle={vehicle}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
    </div>
  );
}
