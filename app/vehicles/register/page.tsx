'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/app-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Camera, Check, X, Plus, Car, Loader2, Image as ImageIcon } from 'lucide-react';
import { Vehicle } from '@/lib/types';
import { carsApi } from '@/lib/api/cars';
import { surveyCarsApi } from '@/lib/api/survey-cars';
import { vehicleToCarCreate } from '@/lib/api/mappers';
import { CreateMemberModal } from '@/components/shared/create-member-modal';
import { GarageFolioLogo } from '@/components/shared/garagefolio-logo';

type Step = 0 | 1 | 2 | 3;

export default function VehicleRegisterPage() {
  const router = useRouter();
  const { currentUser, store, showToast, addActivityLog, refreshVehicles } = useApp();
  const [step, setStep] = useState<Step>(0);
  const [rearPhoto, setRearPhoto] = useState<string | null>(null);
  const [showCreateMember, setShowCreateMember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    licensePlate: '',
    vin: '',
    clientId: '',
    odometer: '',
    notes: '',
    registrationExpDate: '',
    insuranceExpDate: '',
  });
  const [photos, setPhotos] = useState({
    front: [] as string[],
    rear: [] as string[],
    left: [] as string[],
    right: [] as string[],
    interior: [] as string[],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) {
    router.push('/');
    return null;
  }

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>, section?: keyof typeof photos) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (step === 0 || step === 1) {
        setRearPhoto(dataUrl);
      } else if (section) {
        setPhotos(prev => ({
          ...prev,
          [section]: [...prev[section], dataUrl].slice(0, 4),
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!formData.clientId) {
      showToast('Please select a client', 'error');
      return;
    }

    setSubmitting(true);

    const registrationCompleted = !!(
      formData.make &&
      formData.model &&
      formData.licensePlate &&
      formData.clientId &&
      rearPhoto &&
      formData.registrationExpDate &&
      formData.insuranceExpDate
    );

    const newVehicle: Omit<Vehicle, 'id'> = {
      facilityId: currentUser.facilityId,
      clientId: formData.clientId,
      licensePlate: formData.licensePlate.toUpperCase(),
      make: formData.make,
      model: formData.model,
      color: formData.color,
      year: formData.year,
      vin: formData.vin,
      status: 'checked_out',
      statusUpdatedAt: new Date().toISOString(),
      registrationExpDate: formData.registrationExpDate || undefined,
      insuranceExpDate: formData.insuranceExpDate || undefined,
      initialDocumentation: {
        frontExterior: photos.front,
        rearExterior: rearPhoto ? [rearPhoto, ...photos.rear] : photos.rear,
        leftSide: photos.left,
        rightSide: photos.right,
        interior: photos.interior,
      },
      odometer: formData.odometer ? parseInt(formData.odometer) : undefined,
      notes: formData.notes,
      registrationCompleted,
      createdByStaffUserId: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    try {
      const created = await carsApi.create(vehicleToCarCreate(newVehicle));

      // Because the backend doesn't support massive base64 image strings strictly in strings (causes 500 error), 
      // we save local files AND send the actual binary Files via surveyCarsApi as indicated in caras.txt.
      if (typeof window !== 'undefined') {
        const photosKey = 'GF_VEHICLE_PHOTOS';
        try {
          const existing = JSON.parse(localStorage.getItem(photosKey) || '{}');
          existing[created.id] = newVehicle.initialDocumentation;
          localStorage.setItem(photosKey, JSON.stringify(existing));
        } catch {}
      }

      // Upload binary photos securely to the API
      const uploadPhotos = async (photosArray: string[], position: string) => {
        for (const b64 of photosArray) {
          if (!b64) continue;
          try {
            const arr = b64.split(',');
            const mimeMatch = arr[0].match(/:(.*?);/);
            const mime = mimeMatch ? mimeMatch[1] : 'image/png';
            const bstr = atob(arr.length > 1 ? arr[1] : b64);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while(n--) u8arr[n] = bstr.charCodeAt(n);
            const file = new File([u8arr], `${position}.png`, { type: mime });
            
            await surveyCarsApi.create({
              car_id: created.id,
              view_position: position,
              image: file
            });
          } catch (e) {
            console.error('Failed to upload photo for', position, e);
          }
        }
      };

      await Promise.all([
        uploadPhotos(photos.front, 'frontExterior'),
        uploadPhotos(rearPhoto ? [rearPhoto, ...photos.rear] : photos.rear, 'rearExterior'),
        uploadPhotos(photos.left, 'leftSide'),
        uploadPhotos(photos.right, 'rightSide'),
        uploadPhotos(photos.interior, 'interior')
      ]);

      addActivityLog({
        entityType: 'vehicle',
        entityId: created.id,
        action: 'Vehicle registered',
        actorId: currentUser.id,
        actorName: `${currentUser.firstName} ${currentUser.lastName}`,
      });

      await refreshVehicles();
      showToast('Vehicle registered successfully', 'success');
      router.push('/vehicles');
    } catch {
      showToast('Failed to register vehicle. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const stepLabels = ['Start', 'Details', 'Owner', 'Documentation'];

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6 animate-fade-in-up">
            <div className="text-center space-y-5 pt-4">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent/80 to-accent mx-auto flex items-center justify-center shadow-lg shadow-accent/20 animate-subtle-float">
                <Camera className="w-12 h-12 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold">Let's add your first car</h2>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  Take a photo of your car's rear end to get started, or add details manually
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => {
                  handlePhotoCapture(e);
                  if (e.target.files?.[0]) {
                    setTimeout(() => setStep(1), 300);
                  }
                }}
                className="hidden"
              />
              <Button onClick={() => fileInputRef.current?.click()} className="w-full h-14 btn-dark rounded-xl text-base font-semibold">
                <Camera className="w-5 h-5 mr-2" />
                Take Photo
              </Button>
              <Button variant="outline" onClick={() => setStep(1)} className="w-full h-14 rounded-xl text-base font-medium border-2 hover:border-accent/50 transition-all">
                Add Manually
              </Button>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6 animate-fade-in-up">
            {rearPhoto && (
              <div className="relative rounded-2xl overflow-hidden shadow-lg">
                <img src={rearPhoto} alt="Rear view" className="w-full rounded-2xl" />
                <div className="absolute top-3 right-3 animate-scale-in">
                  <div className="bg-success text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    Vehicle detected
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setRearPhoto(null)}
                  className="absolute bottom-3 right-3 shadow-lg hover:shadow-xl transition-all active:scale-95 rounded-xl bg-white/90 text-foreground"
                >
                  Change Photo
                </Button>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="make" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Brand *</Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
                  placeholder="e.g. Porsche"
                  required
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Model *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="e.g. 911"
                  required
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Year *</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    required
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Color *</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="Black"
                    required
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plate" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">License Plate *</Label>
                <Input
                  id="plate"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData(prev => ({ ...prev, licensePlate: e.target.value.toUpperCase() }))}
                  placeholder="ABC123"
                  required
                  className="uppercase h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vin" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">VIN (17 characters)</Label>
                <Input
                  id="vin"
                  value={formData.vin}
                  onChange={(e) => setFormData(prev => ({ ...prev, vin: e.target.value.toUpperCase() }))}
                  placeholder="Leave blank to auto-generate"
                  maxLength={17}
                  className="uppercase font-mono text-sm h-12 rounded-xl"
                />
                {formData.vin && formData.vin.length !== 17 && formData.vin.length > 0 && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <X className="w-3 h-3" />
                    VIN must be exactly 17 characters ({formData.vin.length}/17)
                  </p>
                )}
              </div>
            </div>

            {!rearPhoto && (
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full rounded-xl border-2 border-dashed h-12 hover:border-accent/50 transition-all">
                <Camera className="w-4 h-4 mr-2" />
                Add Rear Photo
              </Button>
            )}
          </div>
        );

      case 2:
        const clients = store.clients.filter(c => c.facilityId === currentUser.facilityId && c.status === 'active');
        return (
          <div className="space-y-6 animate-fade-in-up">
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-3">
                <Label htmlFor="client" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Select Owner/Member *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateMember(true)}
                  className="text-xs rounded-xl border-2 hover:border-accent/50 transition-all"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  New Member
                </Button>
              </div>
              <select
                id="client"
                value={formData.clientId}
                onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                className="w-full h-12 px-3 rounded-xl border border-input bg-background text-sm transition-all"
                required
              >
                <option value="">Choose member...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.firstName === 'string' ? 'John' : client.firstName} {client.lastName === 'string' ? 'Doe' : client.lastName}
                  </option>
                ))}
              </select>
              {clients.length === 0 && (
                <p className="text-xs text-muted-foreground">No members found. Create one first.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Facility</Label>
              <Input
                value={store.facilities.find(f => f.id === currentUser.facilityId)?.name || ''}
                disabled
                className="bg-muted/50 h-12 rounded-xl"
              />
              <p className="text-xs text-muted-foreground">Assigned to your current facility</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fade-in-up">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Documentation Photos (up to 4 each)</Label>
              <p className="text-xs text-muted-foreground">Optional but recommended for complete registration</p>
            </div>

            {['front', 'left', 'right', 'interior'].map((section) => (
              <div key={section} className="space-y-2">
                <Label className="capitalize text-sm font-medium">{section} {section !== 'interior' ? 'Exterior' : ''}</Label>
                <div className="grid grid-cols-4 gap-2">
                  {photos[section as keyof typeof photos].map((photo, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-muted shadow-sm">
                      <img src={photo} alt={`${section} ${idx + 1}`} className="object-cover w-full h-full" />
                    </div>
                  ))}
                  {photos[section as keyof typeof photos].length < 4 && (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-border/60 flex flex-col items-center justify-center cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-all duration-300 group">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handlePhotoCapture(e, section as keyof typeof photos)}
                        className="hidden"
                      />
                      <Camera className="w-5 h-5 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                      <span className="text-[9px] text-muted-foreground/50 mt-1 group-hover:text-accent transition-colors">Add</span>
                    </label>
                  )}
                </div>
              </div>
            ))}

            <div className="space-y-4 pt-4 border-t border-border/60">
              <div className="space-y-2">
                <Label htmlFor="odometer" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Odometer Reading</Label>
                <Input
                  id="odometer"
                  type="number"
                  value={formData.odometer}
                  onChange={(e) => setFormData(prev => ({ ...prev, odometer: e.target.value }))}
                  placeholder="Current mileage"
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="regExp" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Registration Exp *</Label>
                  <Input
                    id="regExp"
                    type="date"
                    value={formData.registrationExpDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, registrationExpDate: e.target.value }))}
                    required
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insExp" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Insurance Exp *</Label>
                  <Input
                    id="insExp"
                    type="date"
                    value={formData.insuranceExpDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, insuranceExpDate: e.target.value }))}
                    required
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional information..."
                  rows={3}
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>
        );
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.make && formData.model && formData.licensePlate && formData.color;
      case 2: return formData.clientId;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Stepper Header */}
      <div className="header-dark-gradient text-white sticky top-0 z-30 shadow-xl">
        <div className="px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => step === 0 ? router.back() : setStep((step - 1) as Step)}
            className="hover:opacity-70 transition-opacity active:scale-95 p-1 min-h-0"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          {step > 0 && (
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/80 to-accent flex items-center justify-center flex-shrink-0 shadow-md">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--gold-accent))] mb-0.5">
                  Step {step} of 3
                </p>
                <h1 className="text-base font-semibold leading-tight">
                  {step === 1 && 'Confirm Vehicle'}
                  {step === 2 && 'Ownership & Facility'}
                  {step === 3 && 'Initial Documentation'}
                </h1>
              </div>
            </div>
          )}
          {step === 0 && (
            <div className="flex-1 flex items-center gap-3">
              <GarageFolioLogo variant="gold" size="sm" showText={false} />
              <h1 className="text-lg font-semibold">Add New Vehicle</h1>
            </div>
          )}
        </div>
        {/* Progress Bar */}
        {step > 0 && (
          <div className="h-1 bg-white/[0.06]">
            <div
              className="h-full transition-all duration-500 ease-out rounded-r-full"
              style={{
                width: `${(step / 3) * 100}%`,
                background: 'linear-gradient(90deg, hsl(var(--gold-accent)), hsl(var(--accent)))',
              }}
            />
          </div>
        )}
        {/* Step Dots */}
        {step > 0 && (
          <div className="flex items-center justify-center gap-6 py-2 bg-white/[0.02]">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  s <= step ? 'bg-[hsl(var(--gold-accent))] scale-100' : 'bg-white/20 scale-75'
                }`} />
                <span className={`text-[10px] font-medium transition-colors duration-300 ${
                  s <= step ? 'text-white/80' : 'text-white/30'
                }`}>{stepLabels[s]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 max-w-2xl mx-auto">
        {renderStep()}
      </div>

      {/* Bottom CTA */}
      {step > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-lg border-t border-border/40">
          <div className="max-w-2xl mx-auto">
            <Button
              onClick={() => {
                if (step === 3) {
                  handleSubmit();
                } else {
                  setStep((step + 1) as Step);
                }
              }}
              disabled={!canProceed() || submitting}
              className="w-full h-13 btn-dark rounded-xl text-base font-semibold"
            >
              {step === 3 ? (
                submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Registering...
                  </span>
                ) : 'Complete Registration'
              ) : 'Continue'}
            </Button>
          </div>
        </div>
      )}

      <CreateMemberModal
        open={showCreateMember}
        onClose={() => setShowCreateMember(false)}
        onMemberCreated={(memberId) => {
          setFormData(prev => ({ ...prev, clientId: memberId }));
        }}
      />
    </div>
  );
}
