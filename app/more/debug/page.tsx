'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/app-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Zap, AlertCircle, Wifi, WifiOff, Database, BarChart3 } from 'lucide-react';
import { getStore, saveStore, resetStore } from '@/lib/store/data-store';
import { generateSeedData } from '@/lib/store/seed-data';

export default function DebugPage() {
  const router = useRouter();
  const { currentUser, store, refreshStore, showToast } = useApp();
  const [settings, setSettings] = useState(store.settings);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'super_user') {
      router.push('/more');
    }
  }, [currentUser, router]);

  if (!currentUser || currentUser.role !== 'super_user') {
    return null;
  }

  const handleToggleSetting = (key: keyof typeof settings) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key],
    };
    setSettings(newSettings);
    
    const updatedStore = {
      ...store,
      settings: newSettings,
    };
    saveStore(updatedStore);
    refreshStore();
    showToast(`${key} ${newSettings[key] ? 'enabled' : 'disabled'}`, 'success');
  };

  const handleResetData = () => {
    if (confirm('Reset all data to initial seed?')) {
      resetStore();
      refreshStore();
      showToast('Data reset successfully', 'success');
    }
  };

  const handleGenerate100Vehicles = () => {
    if (confirm('Generate 100 additional vehicles?')) {
      const { randomCarMakeModel, randomColor, randomYear, randomPlate, randomVIN } = require('@/lib/store/seed-data');
      const newVehicles = [];
      
      for (let i = 0; i < 100; i++) {
        const { make, model } = randomCarMakeModel();
        const clientIndex = Math.floor(Math.random() * store.clients.length);
        const client = store.clients[clientIndex];
        
        newVehicles.push({
          id: `vehicle_stress_${Date.now()}_${i}`,
          facilityId: client.facilityId,
          clientId: client.id,
          licensePlate: randomPlate(),
          make,
          model,
          color: randomColor(),
          year: randomYear(),
          vin: randomVIN(),
          status: Math.random() > 0.5 ? 'in_storage' : 'checked_out',
          statusUpdatedAt: new Date().toISOString(),
          initialDocumentation: {
            frontExterior: ['mock'],
            rearExterior: ['mock'],
            leftSide: [],
            rightSide: [],
            interior: [],
          },
          registrationCompleted: true,
          createdByStaffUserId: currentUser.id,
          createdAt: new Date().toISOString(),
        });
      }
      
      const updatedStore = {
        ...store,
        vehicles: [...store.vehicles, ...newVehicles],
      };
      saveStore(updatedStore);
      refreshStore();
      showToast('Generated 100 vehicles', 'success');
    }
  };

  const statItems = [
    { label: 'Companies', value: store.companies.length },
    { label: 'Facilities', value: store.facilities.length },
    { label: 'Staff Users', value: store.staffUsers.length },
    { label: 'Clients', value: store.clients.length },
    { label: 'Vehicles', value: store.vehicles.length },
    { label: 'Events', value: store.vehicleEvents.length },
    { label: 'Damages', value: store.damages.length },
    { label: 'Activity Logs', value: store.activityLogs.length },
  ];

  return (
    <div className="min-h-screen pb-8 bg-background">
      {/* Header */}
      <div className="header-gradient border-b border-border/60 sticky top-0 z-30">
        <div className="px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1 hover:bg-muted rounded-xl transition-colors min-h-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Debug Panel</h1>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Testing & simulation tools</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-5 max-w-2xl mx-auto">
        {/* Current Stats */}
        <div className="card-premium p-5 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-accent" />
            </div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Current Data Stats</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {statItems.map((stat, idx) => (
              <div key={stat.label} className="bg-muted/30 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold animate-count-up">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Simulation Modes */}
        <div className="card-premium p-5 space-y-4 animate-fade-in-up delay-75">
          <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Simulation Modes</h3>
          <div className="divider-gold" />
          
          <div className="space-y-4">
            {[
              { key: 'slowNetworkMode' as const, icon: WifiOff, title: 'Slow Network Mode', desc: 'Adds 1500ms delay to operations' },
              { key: 'randomErrorMode' as const, icon: AlertCircle, title: 'Random Error Mode', desc: '5% chance of operation failure' },
              { key: 'capacityFullMode' as const, icon: Zap, title: 'Capacity Full Mode', desc: 'Simulate no available space' },
            ].map(({ key, icon: Icon, title, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{title}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleSetting(key)}
                  className={`w-12 h-7 rounded-full transition-all duration-300 ${
                    settings[key] ? 'bg-success shadow-sm shadow-success/25' : 'bg-muted'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
                    settings[key] ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Data Actions */}
        <div className="card-premium p-5 space-y-3 animate-fade-in-up delay-150">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Database className="w-4 h-4 text-accent" />
            </div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Data Actions</h3>
          </div>
          
          <Button
            onClick={handleResetData}
            variant="outline"
            className="w-full justify-start rounded-xl h-12 text-destructive hover:bg-destructive/5 hover:border-destructive/30 transition-all"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset All Data
          </Button>

          <Button
            onClick={handleGenerate100Vehicles}
            variant="outline"
            className="w-full justify-start rounded-xl h-12 hover:border-accent/30 transition-all"
          >
            <Zap className="w-4 h-4 mr-2" />
            Generate 100 Extra Vehicles
          </Button>
        </div>

        {/* Branding */}
        <div className="card-premium p-5 space-y-4 animate-fade-in-up delay-200">
          <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Brand Mode</h3>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                const newSettings = { ...settings, brandMode: 'black' as const };
                setSettings(newSettings);
                saveStore({ ...store, settings: newSettings });
                refreshStore();
              }}
              variant={settings.brandMode === 'black' ? 'default' : 'outline'}
              className={`flex-1 rounded-xl h-12 font-semibold ${settings.brandMode === 'black' ? 'btn-dark' : ''}`}
            >
              Black Label
            </Button>
            <Button
              onClick={() => {
                const newSettings = { ...settings, brandMode: 'white' as const };
                setSettings(newSettings);
                saveStore({ ...store, settings: newSettings });
                refreshStore();
              }}
              variant={settings.brandMode === 'white' ? 'default' : 'outline'}
              className={`flex-1 rounded-xl h-12 font-semibold ${settings.brandMode === 'white' ? 'btn-dark' : ''}`}
            >
              White Label
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Switch between black and white label modes (visual theme changes)
          </p>
        </div>
      </div>
    </div>
  );
}
