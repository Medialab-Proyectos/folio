'use client';

import Link from 'next/link';
import { Car, Hash, Circle, FileCheck, AlertCircle } from 'lucide-react';
import { Vehicle } from '@/lib/types';

interface VehicleCardProps {
  vehicle: Vehicle;
  clientName?: string;
  onClick?: () => void;
}

export default function VehicleCard({ vehicle, clientName, onClick }: VehicleCardProps) {
  const statusColors = {
    in_storage: 'bg-success/10 text-success border-success/20',
    checked_out: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    archived: 'bg-muted text-muted-foreground border-border/40',
  };

  const statusLabels = {
    in_storage: 'In Storage',
    checked_out: 'Checked Out',
    archived: 'Archived',
  };

  const content = (
    <div className="card-premium overflow-hidden cursor-pointer active:scale-[0.98] group">
      {/* Image - Dominante */}
      <div className="aspect-[16/9] bg-gradient-to-br from-muted via-muted/80 to-muted/60 relative overflow-hidden">
        {vehicle.initialDocumentation?.rearExterior?.[0] || vehicle.initialDocumentation?.frontExterior?.[0] ? (
          <img
            src={vehicle.initialDocumentation.rearExterior[0] || vehicle.initialDocumentation.frontExterior[0]}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="w-16 h-16 text-muted-foreground/15" strokeWidth={1} />
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
        
        {/* Status Badge - Top Right */}
        <div className="absolute top-3 right-3">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm ${statusColors[vehicle.status]}`}>
            {statusLabels[vehicle.status]}
          </span>
        </div>

        {/* Incomplete badge */}
        {!vehicle.registrationCompleted && (
          <div className="absolute top-3 left-3">
            <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-destructive/90 text-white flex items-center gap-1 backdrop-blur-sm shadow-sm">
              <AlertCircle className="w-3 h-3" />
              Incomplete
            </span>
          </div>
        )}
      </div>

      {/* Content - Estructura Premium */}
      <div className="p-4 space-y-2.5">
        {/* Brand - Uppercase Gold Small */}
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-accent">
          {vehicle.make}
        </p>

        {/* Model + Year - Título Principal */}
        <h3 className="text-lg font-bold text-balance leading-tight -mt-0.5">
          {vehicle.model} <span className="font-semibold text-foreground/75">{vehicle.year}</span>
        </h3>

        {/* Divider Sutil */}
        <div className="divider-gold" />

        {/* Metadata Row - 3 Items */}
        <div className="flex items-center justify-between text-sm pt-0.5">
          <div className="flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-muted-foreground/60" strokeWidth={2.5} />
            <span className="font-semibold text-xs">{vehicle.licensePlate}</span>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded-full bg-current opacity-30" />
            <span className="text-xs">{vehicle.color}</span>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <FileCheck className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">
              {vehicle.registrationCompleted ? 'Complete' : 'Incomplete'}
            </span>
          </div>
        </div>

        {clientName && (
          <p className="text-xs text-muted-foreground/70 pt-1">
            Owner: <span className="font-medium text-muted-foreground">{clientName}</span>
          </p>
        )}
      </div>
    </div>
  );

  if (onClick) {
    return <div onClick={onClick}>{content}</div>;
  }

  return <Link href={`/vehicles/${vehicle.id}`}>{content}</Link>;
}
