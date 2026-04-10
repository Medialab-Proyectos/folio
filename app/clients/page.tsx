'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/app-context';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Mail, Phone, Car, Users } from 'lucide-react';
import { Client, ClientWithVehicles } from '@/lib/types';
import { CreateMemberModal } from '@/components/shared/create-member-modal';
import { GarageFolioLogo } from '@/components/shared/garagefolio-logo';
import Link from 'next/link';
import Image from 'next/image';

export default function ClientsPage() {
  const router = useRouter();
  const { currentUser, store, currentFacility } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [clients, setClients] = useState<ClientWithVehicles[]>([]);
  const [showCreateMember, setShowCreateMember] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    let filtered = store.clients.filter(c => c.facilityId === currentFacility);

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        c =>
          c.firstName.toLowerCase().includes(searchLower) ||
          c.lastName.toLowerCase().includes(searchLower) ||
          c.email.toLowerCase().includes(searchLower) ||
          c.phone.includes(search)
      );
    }

    const withVehicles: ClientWithVehicles[] = filtered.map(client => {
      const clientVehicles = store.vehicles.filter(v => v.clientId === client.id && v.status !== 'archived');
      return {
        ...client,
        totalVehicles: clientVehicles.length,
        inStorageCount: clientVehicles.filter(v => v.status === 'in_storage').length,
        checkedOutCount: clientVehicles.filter(v => v.status === 'checked_out').length,
      };
    });

    setClients(
      withVehicles.sort((a, b) => 
        `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`)
      )
    );
  }, [currentUser, store, currentFacility, search, statusFilter, router]);

  if (!currentUser) {
    return null;
  }

  const filterOptions = [
    { key: 'all' as const, label: 'All' },
    { key: 'active' as const, label: 'Active' },
    { key: 'inactive' as const, label: 'Inactive' },
  ];

  return (
    <div className="min-h-screen pb-safe bg-background">
      {/* Header */}
      <div className="header-gradient border-b border-border/60 sticky top-0 z-30">
        <div className="px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Members</h1>
            <Button size="sm" className="btn-gold rounded-xl h-9 px-4" onClick={() => setShowCreateMember(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Member
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <Input
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-muted/60 border-border/40 text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {filterOptions.map(opt => (
              <button
                key={opt.key}
                onClick={() => setStatusFilter(opt.key)}
                className={`px-4 py-1.5 text-[13px] font-semibold rounded-full whitespace-nowrap transition-all duration-300 ${
                  statusFilter === opt.key
                    ? 'bg-foreground text-background shadow-md'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted active:scale-95'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3 max-w-2xl mx-auto">
        {clients.length === 0 ? (
          <div className="card-premium relative overflow-hidden p-12 text-center animate-fade-in">
            <div className="absolute inset-0 opacity-[0.03]">
              <Image src="/empty-garage.png" alt="Empty Garage" fill className="object-cover grayscale" />
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-muted/80 backdrop-blur-sm mx-auto mb-4 flex items-center justify-center border border-border/50 shadow-inner">
                <Users className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <p className="text-foreground/90 font-medium text-lg">No members found</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Try adjusting your search or filters</p>
              <Button className="mt-6 btn-gold rounded-xl px-6" onClick={() => setShowCreateMember(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </div>
          </div>
        ) : (
          clients.map((client, idx) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="block card-premium p-4 group animate-fade-in-up"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center flex-shrink-0 border border-accent/10 group-hover:border-accent/30 transition-colors">
                  <span className="text-[15px] font-bold text-accent">
                    {client.firstName === 'string' ? 'J' : client.firstName.charAt(0)}{client.lastName === 'string' ? 'D' : client.lastName.charAt(0)}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base group-hover:text-accent transition-colors">
                    {client.firstName === 'string' ? 'John' : client.firstName} {client.lastName === 'string' ? 'Doe' : client.lastName}
                  </h3>
                  
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{client.phone === 'string' ? '(555) 123-4567' : client.phone}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center gap-1.5 bg-muted/50 rounded-full px-2.5 py-1">
                      <Car className="w-3.5 h-3.5 text-accent" />
                      <span className="text-xs font-semibold">{client.totalVehicles}</span>
                      <span className="text-[10px] text-muted-foreground">vehicle{client.totalVehicles !== 1 ? 's' : ''}</span>
                    </div>
                    
                    {client.status === 'active' ? (
                      <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-success/10 text-success border border-success/20">
                        Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-muted text-muted-foreground border border-border/40">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Create Member Modal */}
      <CreateMemberModal
        open={showCreateMember}
        onClose={() => setShowCreateMember(false)}
        onMemberCreated={() => {
          setShowCreateMember(false);
        }}
      />

      <BottomNav />
    </div>
  );
}
