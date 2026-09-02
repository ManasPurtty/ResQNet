import React from 'react';
import {
  Truck,
  Home,
  AlertTriangle,
  ShieldAlert,
  Users,
  CheckCircle,
  Clock,
  Activity,
  MapPin,
  Phone
} from 'lucide-react';

export const KpiCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend }) => {
  const colors = {
    blue: 'border-blue-800/60 bg-blue-950/30 text-blue-400',
    red: 'border-red-800/60 bg-red-950/30 text-red-400',
    emerald: 'border-emerald-800/60 bg-emerald-950/30 text-emerald-400',
    amber: 'border-amber-800/60 bg-amber-950/30 text-amber-400',
    purple: 'border-purple-800/60 bg-purple-950/30 text-purple-400'
  };

  return (
    <div className={`p-4 rounded-2xl border bg-[#111827] shadow-xl relative overflow-hidden ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {title}
        </span>
        {Icon && <Icon className="w-5 h-5 opacity-80" />}
      </div>

      <div className="font-heading font-black text-2xl text-gray-100 mt-2">
        {value}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
        <span>{subtitle}</span>
        {trend && <span className="text-emerald-400 font-mono text-[11px]">{trend}</span>}
      </div>
    </div>
  );
};

export const ResourceCard = ({ resource, onStatusChange }) => {
  const isAvailable = resource.status === 'AVAILABLE';
  const isAssigned = resource.status === 'ASSIGNED';
  const isBusy = resource.status === 'BUSY';

  return (
    <div className="bg-[#111827] border border-gray-800 hover:border-blue-500/40 rounded-2xl p-4 space-y-3 shadow-xl transition-all">
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 text-lg">
            🚑
          </div>
          <div className="min-w-0">
            <h4 className="font-heading font-bold text-sm leading-snug text-gray-100">{resource.name}</h4>
            <p className="text-[11px] text-gray-400 font-mono">ID: {resource.id}</p>
          </div>
        </div>

        <select
          value={resource.status}
          onChange={(e) => onStatusChange(resource.id, e.target.value)}
          className={`w-full sm:w-auto font-mono text-xs font-bold px-2.5 py-2 sm:py-1 rounded-lg border focus:outline-none cursor-pointer ${
            isAvailable
              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
              : isAssigned
              ? 'bg-blue-950 text-blue-300 border-blue-800'
              : isBusy
              ? 'bg-amber-950 text-amber-300 border-amber-800'
              : 'bg-gray-900 text-gray-400 border-gray-700'
          }`}
        >
          <option value="AVAILABLE">AVAILABLE</option>
          <option value="ASSIGNED">ASSIGNED</option>
          <option value="BUSY">BUSY</option>
          <option value="UNAVAILABLE">UNAVAILABLE</option>
        </select>
      </div>

      <div className="space-y-1.5 text-xs text-gray-300 border-t border-b border-gray-800/80 py-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-gray-400">Location:</span>
          <span>📍 {resource.location.name}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-gray-400">Rescue Capacity:</span>
          <span className="font-mono font-bold text-gray-200">{resource.capacity} persons</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-gray-400">Contact:</span>
          <span className="font-mono text-blue-300">{resource.contactPerson}</span>
        </div>
      </div>

      <div>
        <div className="text-[10px] text-gray-400 uppercase font-mono mb-1">Capabilities</div>
        <div className="flex flex-wrap gap-1">
          {resource.capabilities.map((cap, i) => (
            <span key={i} className="bg-slate-900 text-blue-300 border border-gray-800 text-[10px] px-2 py-0.5 rounded font-mono">
              ✓ {cap}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ShelterCard = ({ shelter, onStatusChange }) => {
  const occupancyPercent = Math.round((shelter.occupied / shelter.capacity) * 100);

  return (
    <div className="bg-[#111827] border border-gray-800 hover:border-emerald-500/40 rounded-2xl p-4 space-y-3 shadow-xl transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 text-lg">
            🏠
          </div>
          <div>
            <h4 className="font-heading font-bold text-sm text-gray-100">{shelter.name}</h4>
            <p className="text-[11px] text-gray-400">📍 {shelter.location.name}</p>
          </div>
        </div>

        <select
          value={shelter.status}
          onChange={(e) => onStatusChange(shelter.id, e.target.value)}
          className={`font-mono text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
            shelter.status === 'OPEN'
              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
              : shelter.status === 'NEAR_CAPACITY'
              ? 'bg-amber-950 text-amber-300 border-amber-800'
              : shelter.status === 'FULL'
              ? 'bg-red-950 text-red-300 border-red-800'
              : 'bg-gray-900 text-gray-400 border-gray-700'
          }`}
        >
          <option value="OPEN">OPEN</option>
          <option value="NEAR_CAPACITY">NEAR CAPACITY</option>
          <option value="FULL">FULL</option>
          <option value="CLOSED">CLOSED</option>
        </select>
      </div>

      {/* Progress meter */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-mono text-gray-300">
          <span>Occupancy:</span>
          <span><b>{shelter.occupied}</b> / {shelter.capacity} ({shelter.available} free)</span>
        </div>
        <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              occupancyPercent >= 90 ? 'bg-red-500' : occupancyPercent >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${occupancyPercent}%` }}
          ></div>
        </div>
      </div>

      <div>
        <div className="text-[10px] text-gray-400 uppercase font-mono mb-1">Active Facilities</div>
        <div className="flex flex-wrap gap-1">
          {shelter.facilities.map((fac, i) => (
            <span key={i} className="bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 text-[10px] px-2 py-0.5 rounded font-mono">
              ✓ {fac}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export const AlertCard = ({ alert }) => {
  return (
    <div className="bg-[#111827] border border-red-900/60 rounded-2xl p-4 space-y-2.5 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-2, h-full bg-red-600"></div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
          <span className="font-mono text-xs font-bold text-red-400">{alert.id}</span>
          <span className="bg-red-950 text-red-300 border border-red-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
            {alert.severity}
          </span>
        </div>
        <span className="text-[11px] text-gray-400 font-mono">Source: {alert.source}</span>
      </div>

      <h4 className="font-heading font-bold text-base text-gray-100">{alert.title}</h4>
      <p className="text-xs text-gray-300 leading-relaxed">{alert.details}</p>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400 pt-2 border-t border-gray-800 font-mono">
        <span>Affected: <b className="text-gray-200">{alert.affectedRegion}</b></span>
        <span>Issued: <b className="text-blue-300">{alert.issuedAt}</b></span>
      </div>
    </div>
  );
};
