'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { formatDateDZ } from '@silex/shared';
import { Truck, Wrench, ShieldCheck, AlertCircle, Plus } from 'lucide-react';

export default function MaintenancePage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMaintenanceData() {
      try {
        setLoading(true);
        const [asts, ords] = await Promise.all([
          api.get<any[]>('/fleet/assets'),
          api.get<any[]>('/fleet/maintenance-orders'),
        ]);
        setAssets(asts);
        setOrders(ords);
      } catch (err) {
        console.error('Erreur maintenance:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMaintenanceData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-[#182433]">Parc Matériel, Engins de Levage & Maintenance</h1>
        <p className="text-xs text-[#697789] mt-0.5">
          Disponibilité opérationnelle des grues, postes de soudure autonomes, compresseurs et véhicules de chantiers.
        </p>
      </div>

      {/* Equipment List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {assets.map(a => {
          const isOperational = a.status === 'OPERATIONAL';
          return (
            <div key={a.id} className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#142B45]">{a.assetTag}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    isOperational
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {isOperational ? 'Opérationnel' : 'En Révision'}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-800 leading-tight">{a.name}</div>
              <div className="text-[11px] text-slate-500">
                {a.brand} {a.model} • N/S : {a.serialNumber}
              </div>
              <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
                <span>Type : {a.assetType}</span>
                <span>Acquis le {formatDateDZ(a.acquisitionDate)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
