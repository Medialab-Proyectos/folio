import { useState } from 'react';
import { useApp } from '@/lib/context/app-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Calendar, Loader2 } from 'lucide-react';
import { Vehicle } from '@/lib/types';
import { carsApi } from '@/lib/api/cars';
import { vehicleToCarUpdate } from '@/lib/api/mappers';

interface EditVehicleModalProps {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
}

export function EditVehicleModal({ vehicle, isOpen, onClose }: EditVehicleModalProps) {
  const { showToast, refreshVehicles } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    licensePlate: vehicle.licensePlate || '',
    color: vehicle.color || '',
    vin: vehicle.vin || '',
    odometer: vehicle.odometer ? vehicle.odometer.toString() : '',
    notes: vehicle.notes || '',
    registrationExpDate: vehicle.registrationExpDate || '',
    insuranceExpDate: vehicle.insuranceExpDate || '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Check if the combination of what they fill completes the strict registration requirements
    const isCompleted = !!(
      vehicle.make &&
      vehicle.model &&
      formData.licensePlate &&
      vehicle.clientId &&
      formData.registrationExpDate &&
      formData.insuranceExpDate
      // Assuming they uploaded a rearPhoto previously, or we bypass that strictness during edit.
    );

    try {
      await carsApi.update(vehicle.id, vehicleToCarUpdate({
        licensePlate: formData.licensePlate,
        color: formData.color,
        vin: formData.vin,
        odometer: formData.odometer ? parseInt(formData.odometer) : undefined,
        notes: formData.notes,
        registrationExpDate: formData.registrationExpDate || undefined,
        insuranceExpDate: formData.insuranceExpDate || undefined,
        registrationCompleted: isCompleted,
      }, vehicle.notes));
      
      await refreshVehicles();
      showToast('Vehicle updated successfully', 'success');
      onClose();
    } catch (error) {
      console.error(error);
      showToast('Failed to update vehicle', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-card w-full max-w-lg rounded-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-border/60 flex items-center justify-between">
          <h2 className="text-xl font-bold">Edit Vehicle Data</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors min-h-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          <form id="edit-vehicle-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="licensePlate" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">License Plate</Label>
                <Input
                  id="licensePlate"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                  placeholder="ABC-1234"
                  required
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="Red"
                  required
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vin" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">VIN Number</Label>
                <Input
                  id="vin"
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                  placeholder="Auto/Scanner..."
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="odometer" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Odometer (mi)</Label>
                <Input
                  id="odometer"
                  type="number"
                  value={formData.odometer}
                  onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                  placeholder="45000"
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="divider-gold my-4" />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registrationExp" className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  <Calendar className="w-3 h-3" /> Registration Exp
                </Label>
                <Input
                  id="registrationExp"
                  type="date"
                  value={formData.registrationExpDate}
                  onChange={(e) => setFormData({ ...formData, registrationExpDate: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insuranceExp" className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  <Calendar className="w-3 h-3" /> Insurance Exp
                </Label>
                <Input
                  id="insuranceExp"
                  type="date"
                  value={formData.insuranceExpDate}
                  onChange={(e) => setFormData({ ...formData, insuranceExpDate: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label htmlFor="notes" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Internal Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Details about the vehicle status or registration..."
                rows={3}
                className="rounded-xl"
              />
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-border/60 flex gap-3 bg-muted/10">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl h-12">
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="edit-vehicle-form" 
            disabled={submitting} 
            className="flex-1 btn-dark rounded-xl h-12 font-semibold"
          >
            {submitting ? (
              <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Saving...</span>
            ) : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
