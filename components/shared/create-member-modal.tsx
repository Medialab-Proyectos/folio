'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context/app-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usersApi } from '@/lib/api/users';
import { userToClient } from '@/lib/api/mappers';
import { AlertCircle, Loader2, UserPlus } from 'lucide-react';

interface CreateMemberModalProps {
  open: boolean;
  onClose: () => void;
  onMemberCreated: (memberId: string) => void;
}

export function CreateMemberModal({ open, onClose, onMemberCreated }: CreateMemberModalProps) {
  const { currentUser, showToast, addClient } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    billingAddress: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone format';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !currentUser) return;

    setLoading(true);
    try {
      // Members are Users — create via the admin /users/ endpoint (authenticated)
      // NOT via /auth/register which is for self-registration
      const created = await usersApi.create({
        email: formData.email.trim().toLowerCase(),
        password: `Temp${Math.random().toString(36).slice(2, 10)}@Gf1`,
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        phone: formData.phone.trim() || undefined,
        billing: formData.billingAddress.trim() || undefined,
        place: currentUser.facilityId || undefined,
        type: 'user', // Mark as regular user / member, not admin
      });

      // Add immediately to the local store so the member list updates instantly
      addClient(userToClient(created, currentUser.facilityId));

      showToast('Member created successfully', 'success');
      onMemberCreated(created.id);
      onClose();

      setFormData({ firstName: '', lastName: '', phone: '', email: '', billingAddress: '' });
    } catch (err: any) {
      // err.message contains the raw detail from the API (set in client.ts)
      const msg = err?.message ?? 'Error creating member';
      setErrors({ api: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-accent" />
            </div>
            <DialogTitle className="text-xl font-bold">Create New Member</DialogTitle>
          </div>
        </DialogHeader>

        <div className="divider-gold mt-2" />

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className={`h-11 rounded-xl ${errors.firstName ? 'border-destructive focus:border-destructive' : ''}`}
              />
              {errors.firstName && <p className="text-[11px] text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.firstName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className={`h-11 rounded-xl ${errors.lastName ? 'border-destructive focus:border-destructive' : ''}`}
              />
              {errors.lastName && <p className="text-[11px] text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.lastName}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Phone *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className={`h-11 rounded-xl ${errors.phone ? 'border-destructive focus:border-destructive' : ''}`}
            />
            {errors.phone && <p className="text-[11px] text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="member@example.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={`h-11 rounded-xl ${errors.email ? 'border-destructive focus:border-destructive' : ''}`}
            />
            {errors.email && <p className="text-[11px] text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="billingAddress" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Billing Address (Optional)</Label>
            <Input
              id="billingAddress"
              placeholder="123 Main St, City, State 12345"
              value={formData.billingAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, billingAddress: e.target.value }))}
              className="h-11 rounded-xl"
            />
          </div>

          {errors.api && (
            <div className="text-sm text-destructive bg-destructive/[0.06] border border-destructive/15 px-4 py-3 rounded-xl break-words flex items-start gap-2 animate-scale-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errors.api}</span>
            </div>
          )}

          <div className="flex gap-3 pt-3">
            <Button type="button" variant="outline" className="flex-1 rounded-xl h-12" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 btn-dark rounded-xl h-12 font-semibold" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Creating...</span>
              ) : 'Create Member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
