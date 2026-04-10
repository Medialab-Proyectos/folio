'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/app-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NotificationSettingsPage() {
  const router = useRouter();
  const { currentUser, store } = useApp();
  const [brandMode, setBrandMode] = useState<'black' | 'white'>(store.settings.brandMode);

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen pb-8 bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.back()}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Notification Settings</h1>
            <p className="text-xs text-muted-foreground">Configure notifications and branding</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Brand Mode */}
        <div className="card-premium p-4 space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Brand Mode</h3>
            <p className="text-sm text-muted-foreground">
              Switch between black and white label configurations
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setBrandMode('black')}
              variant={brandMode === 'black' ? 'default' : 'outline'}
              className="flex-1 h-12"
            >
              Black Label
            </Button>
            <Button
              onClick={() => setBrandMode('white')}
              variant={brandMode === 'white' ? 'default' : 'outline'}
              className="flex-1 h-12"
            >
              White Label
            </Button>
          </div>
        </div>

        {/* Notification Templates */}
        <div className="card-premium p-4 space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Notification Templates</h3>
            <p className="text-sm text-muted-foreground">
              Customize message templates for different notification types
            </p>
          </div>

          <div className="space-y-3">
            {[
              { type: 'New Damage Recorded', desc: 'Sent when damage is detected' },
              { type: 'Registration Expiring', desc: 'Sent 30 days before expiration' },
              { type: 'Insurance Expiring', desc: 'Sent 30 days before expiration' },
              { type: 'Registration Incomplete', desc: 'Sent for incomplete registrations' },
              { type: 'Contact Request', desc: 'Sent when client needs to contact facility' },
            ].map((template) => (
              <div key={template.type} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="text-sm font-medium">{template.type}</p>
                  <p className="text-xs text-muted-foreground">{template.desc}</p>
                </div>
                <Button size="sm" variant="ghost">Edit</Button>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Settings */}
        <div className="card-premium p-4 space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Delivery Settings</h3>
            <p className="text-sm text-muted-foreground">
              Configure how notifications are delivered
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Send via email</p>
              </div>
              <div className="w-12 h-6 rounded-full bg-success">
                <div className="w-5 h-5 bg-white rounded-full shadow-sm translate-x-6 mt-0.5" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">SMS Notifications</p>
                <p className="text-xs text-muted-foreground">Send via text message</p>
              </div>
              <div className="w-12 h-6 rounded-full bg-muted">
                <div className="w-5 h-5 bg-white rounded-full shadow-sm translate-x-0.5 mt-0.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
