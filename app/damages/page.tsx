'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/lib/context/app-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Check, AlertTriangle, Wrench, ShieldCheck } from 'lucide-react';
import { BottomNav } from '@/components/layout/bottom-nav';

export default function DamagesPage() {
  const { store, setDamages } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'fixed'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'yesterday' | 'week' | 'month'>('all');

  const filteredDamages = useMemo(() => {
    let filtered = store.damages;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    if (dateFilter !== 'all') {
      const filterDate = new Date();
      if (dateFilter === 'yesterday') filterDate.setDate(filterDate.getDate() - 1);
      else if (dateFilter === 'week') filterDate.setDate(filterDate.getDate() - 7);
      else if (dateFilter === 'month') filterDate.setMonth(filterDate.getMonth() - 1);
      filtered = filtered.filter(d => new Date(d.createdAt) >= filterDate);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(d => {
        const vehicle = store.vehicles.find(v => v.id === d.vehicleId);
        const client = vehicle ? store.clients.find(c => c.id === vehicle.clientId) : null;
        return (
          vehicle?.licensePlate.toLowerCase().includes(query) ||
          vehicle?.make.toLowerCase().includes(query) ||
          vehicle?.model.toLowerCase().includes(query) ||
          client?.firstName.toLowerCase().includes(query) ||
          client?.lastName.toLowerCase().includes(query) ||
          d.carPart.toLowerCase().includes(query)
        );
      });
    }

    return filtered.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [store.damages, store.vehicles, store.clients, statusFilter, dateFilter, searchQuery]);

  const handleMarkFixed = (damageId: string) => {
    const updated = store.damages.map(d =>
      d.id === damageId ? { ...d, status: 'fixed' as const, fixedAt: new Date().toISOString() } : d
    );
    setDamages(updated);
  };

  const openCount = store.damages.filter(d => d.status === 'open').length;
  const fixedCount = store.damages.filter(d => d.status === 'fixed').length;

  const statusFilterOptions = [
    { key: 'all' as const, label: 'All' },
    { key: 'open' as const, label: 'Open' },
    { key: 'fixed' as const, label: 'Fixed' },
  ];

  const dateFilterOptions = [
    { key: 'yesterday' as const, label: 'Yesterday' },
    { key: 'week' as const, label: 'Last Week' },
    { key: 'month' as const, label: 'Last Month' },
  ];

  return (
    <div className="min-h-screen bg-background pb-safe">
      <header className="header-dark-gradient text-white px-4 py-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold">Damages</h1>
        <p className="text-sm text-white/50 mt-1">Track and manage vehicle damages</p>
      </header>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Search */}
        <div className="relative animate-fade-in-up">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <Input
            placeholder="Search by plate, vehicle, or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-xl bg-muted/60 border-border/40 text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide animate-fade-in-up delay-75">
          {statusFilterOptions.map(opt => (
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
          <div className="w-px bg-border/50 flex-shrink-0 my-1" />
          {dateFilterOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => setDateFilter(prev => prev === opt.key ? 'all' : opt.key)}
              className={`px-4 py-1.5 text-[13px] font-semibold rounded-full whitespace-nowrap transition-all duration-300 ${
                dateFilter === opt.key
                  ? 'bg-foreground text-background shadow-md'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted active:scale-95'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 animate-fade-in-up delay-150">
          <div className="card-premium p-4 text-center">
            <p className="text-2xl font-bold animate-count-up">{store.damages.length}</p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">Total</p>
          </div>
          <div className="card-premium p-4 text-center">
            <p className="text-2xl font-bold text-destructive animate-count-up">
              {openCount}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">Open</p>
          </div>
          <div className="card-premium p-4 text-center">
            <p className="text-2xl font-bold text-success animate-count-up">
              {fixedCount}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">Fixed</p>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          {filteredDamages.length === 0 ? (
            <div className="card-premium p-12 text-center animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-muted-foreground/40" />
              </div>
              <h3 className="font-bold mb-1">No damages found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
            </div>
          ) : (
            filteredDamages.map((damage, idx) => {
              const vehicle = store.vehicles.find(v => v.id === damage.vehicleId);
              const client = vehicle ? store.clients.find(c => c.id === vehicle.clientId) : null;

              return (
                <div
                  key={damage.id}
                  className="card-premium p-4 space-y-3 animate-fade-in-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm">
                          {vehicle?.make} {vehicle?.model}
                        </h3>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          damage.status === 'open'
                            ? 'bg-destructive/10 text-destructive border-destructive/20'
                            : 'bg-success/10 text-success border-success/20'
                        }`}>
                          {damage.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {client?.firstName} {client?.lastName} • {vehicle?.licensePlate}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm font-semibold capitalize">{damage.carPart.replace(/_/g, ' ')}</span>
                        <span className="text-muted-foreground text-xs">•</span>
                        <span className={`text-xs font-medium ${
                          damage.severity === 'high' ? 'text-destructive' :
                          damage.severity === 'medium' ? 'text-amber-500' :
                          'text-muted-foreground'
                        }`}>
                          {damage.severity} severity
                        </span>
                      </div>
                    </div>
                  </div>

                  {damage.photos && damage.photos.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                      {damage.photos.map((photo, index) => (
                        <img key={index} src={photo} alt="" className="w-20 h-20 object-cover rounded-xl flex-shrink-0 border border-border/40" />
                      ))}
                    </div>
                  )}

                  {damage.notes && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{damage.notes}</p>
                  )}

                  <div className="flex items-center justify-between pt-2.5 border-t border-border/40">
                    <p className="text-[11px] text-muted-foreground/70">
                      {new Date(damage.createdAt).toLocaleDateString()}
                    </p>
                    {damage.status === 'open' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkFixed(damage.id)}
                        className="h-8 rounded-lg text-xs font-semibold hover:bg-success/10 hover:text-success hover:border-success/30 transition-all"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Mark Fixed
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
