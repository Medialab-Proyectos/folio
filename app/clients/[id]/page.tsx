'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useApp } from '@/lib/context/app-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, DollarSign, Car, ChevronRight, Loader2 } from 'lucide-react';
import { Client, Vehicle } from '@/lib/types';
import Link from 'next/link';

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { currentUser, store } = useApp();
  const [client, setClient] = useState<Client | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    if (!currentUser) {
      router.push('/');
      return;
    }

    const found = store.clients.find(c => c.id === params.id);
    if (found) {
      setClient(found);
      const clientVehicles = store.vehicles.filter(v => v.clientId === found.id && v.status !== 'archived');
      setVehicles(clientVehicles);
    }
  }, [currentUser, store, params.id, router]);

  if (!currentUser || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading member...</p>
        </div>
      </div>
    );
  }

  const inStorageCount = vehicles.filter(v => v.status === 'in_storage').length;
  const checkedOutCount = vehicles.filter(v => v.status === 'checked_out').length;

  const activityLogs = store.activityLogs
    .filter(log => 
      log.entityType === 'client' && log.entityId === client.id ||
      vehicles.some(v => v.id === log.entityId)
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);

  return (
    <div className="min-h-screen pb-8 bg-background">
      {/* Header */}
      <div className="header-gradient border-b border-border/60 sticky top-0 z-30">
        <div className="px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1 hover:bg-muted rounded-xl transition-colors min-h-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">
              {client.firstName === 'string' ? 'John' : client.firstName} {client.lastName === 'string' ? 'Doe' : client.lastName}
            </h1>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Member Details</p>
          </div>
          <Button size="sm" variant="outline" className="rounded-xl h-9 text-xs font-semibold">Edit</Button>
        </div>
      </div>

      <div className="p-4 space-y-5 max-w-2xl mx-auto">
        {/* Profile Card */}
        <div className="card-premium p-5 animate-fade-in-up">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center flex-shrink-0 border border-accent/10">
              <span className="text-2xl font-bold text-accent">
                {client.firstName === 'string' ? 'J' : client.firstName.charAt(0)}{client.lastName === 'string' ? 'D' : client.lastName.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">
                {client.firstName === 'string' ? 'John' : client.firstName} {client.lastName === 'string' ? 'Doe' : client.lastName}
              </h2>
              <span className={`inline-block px-2.5 py-1 text-[11px] font-semibold rounded-full mt-2 border ${
                client.status === 'active' 
                  ? 'bg-success/10 text-success border-success/20' 
                  : 'bg-muted text-muted-foreground border-border/40'
              }`}>
                {client.status === 'active' ? 'Active Member' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="divider-gold mb-4" />

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Mail className="w-4 h-4 text-muted-foreground" />
              </div>
              <span>{client.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Phone className="w-4 h-4 text-muted-foreground" />
              </div>
              <span>{client.phone === 'string' ? '(555) 123-4567' : client.phone}</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="pt-1">{client.billingAddress === 'string' ? '123 Main St, Anytown, USA' : client.billingAddress}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </div>
              <span>Member since {new Date(client.memberSince).toLocaleDateString()}</span>
            </div>
            {client.monthlyRate && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="font-semibold">${client.monthlyRate}<span className="text-muted-foreground font-normal">/month</span></span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 animate-fade-in-up delay-75">
          <div className="card-premium p-4 text-center">
            <p className="text-2xl font-bold animate-count-up">{vehicles.length}</p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">Total</p>
          </div>
          <div className="card-premium p-4 text-center">
            <p className="text-2xl font-bold text-success animate-count-up">{inStorageCount}</p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">In Storage</p>
          </div>
          <div className="card-premium p-4 text-center">
            <p className="text-2xl font-bold text-blue-600 animate-count-up">{checkedOutCount}</p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">Checked Out</p>
          </div>
        </div>

        {/* Vehicles */}
        <div className="space-y-3 animate-fade-in-up delay-150">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
            Vehicles ({vehicles.length})
          </h3>

          {vehicles.length === 0 ? (
            <div className="card-premium p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                <Car className="w-7 h-7 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground">No vehicles registered</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {vehicles.map((vehicle, idx) => (
                <Link
                  key={vehicle.id}
                  href={`/vehicles/${vehicle.id}`}
                  className="block card-premium p-4 group"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-[10px] uppercase tracking-wider text-accent font-semibold mb-0.5">
                        {vehicle.make}
                      </p>
                      <p className="font-bold text-base">
                        {vehicle.model} {vehicle.year}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {vehicle.licensePlate} <span className="text-border">•</span> {vehicle.color}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border ${
                        vehicle.status === 'in_storage'
                          ? 'bg-success/10 text-success border-success/20'
                          : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                      }`}>
                        {vehicle.status === 'in_storage' ? 'In Storage' : 'Checked Out'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-accent transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Activity Log */}
        <div className="space-y-3 animate-fade-in-up delay-200">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
            Activity Log
          </h3>
          
          <div className="card-premium divide-y divide-border/50 overflow-hidden">
            {activityLogs.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm text-muted-foreground/60">No activity yet</p>
              </div>
            ) : (
              activityLogs.map(log => (
                <div key={log.id} className="p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{log.action}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        by {log.actorName}
                      </p>
                    </div>
                    <span className="text-[11px] text-muted-foreground/70 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
