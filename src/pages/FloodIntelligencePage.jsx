import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Circle, CircleMarker, MapContainer, Polyline, Popup, TileLayer } from 'react-leaflet';
import {
  Activity,
  AlertOctagon,
  BadgeCheck,
  Construction,
  CheckCircle2,
  Clock3,
  Database,
  Gauge,
  HeartPulse,
  MapPinned,
  Radio,
  RefreshCw,
  Route,
  ShieldAlert,
  Siren,
  TrendingUp,
  Users,
  Waves
} from 'lucide-react';
import { AuthorityHeader } from '../components/AuthorityHeader';
import { useAppState } from '../context/StateContext';
import {
  DEMO_FLOOD_DASHBOARD,
  floodIntelligenceService
} from '../services/floodIntelligenceService';

const riskStyles = {
  CRITICAL: 'border-red-600 bg-red-950/70 text-red-200',
  HIGH: 'border-orange-600 bg-orange-950/60 text-orange-200',
  MEDIUM: 'border-amber-600 bg-amber-950/50 text-amber-100',
  LOW: 'border-emerald-700 bg-emerald-950/50 text-emerald-200'
};

const assetColor = {
  OPERATIONAL: '#10b981',
  AT_RISK: '#f59e0b',
  FLOODED: '#3b82f6',
  WASHED_OUT: '#ef4444',
  CLOSED: '#ef4444',
  UNKNOWN: '#94a3b8'
};

const statusOptions = ['OPERATIONAL', 'AT_RISK', 'FLOODED', 'WASHED_OUT', 'CLOSED'];

const formatMinutes = minutes => {
  if (minutes === null || minutes === undefined) return 'Uncertain';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours}h ${remainder}m`;
};

const SummaryCard = ({ icon: Icon, label, value, detail, color = 'text-blue-400' }) => (
  <div className="rounded-2xl border border-gray-800 bg-[#111827] p-4">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</span>
      <Icon className={`h-4 w-4 ${color}`} />
    </div>
    <div className="mt-2 font-heading text-2xl font-black text-white">{value}</div>
    <p className="mt-1 text-[10px] text-gray-500">{detail}</p>
  </div>
);

export const FloodIntelligencePage = () => {
  const { addToast, floodIntelligenceRevision } = useAppState();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serviceWarning, setServiceWarning] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await floodIntelligenceService.getDashboard();
      setDashboard(data);
      setServiceWarning('');
    } catch (error) {
      setDashboard(DEMO_FLOOD_DASHBOARD);
      setServiceWarning(`${error.message} Showing a read-only simulation preview.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard, floodIntelligenceRevision]);

  const forecast = dashboard?.forecasts?.[0];
  const station = dashboard?.stations?.find(item => item.id === forecast?.stationId)
    || dashboard?.stations?.[0];
  const infrastructure = dashboard?.infrastructure || [];
  const checkIns = dashboard?.checkIns || [];
  const checkInSummary = dashboard?.checkInSummary || DEMO_FLOOD_DASHBOARD.checkInSummary;
  const roadDisruptions = infrastructure.filter(asset => (
    ['BRIDGE', 'ROAD'].includes(asset.type) && asset.status !== 'OPERATIONAL'
  ));

  const routeLine = useMemo(() => {
    if (!forecast) return [];
    return [
      [forecast.location.lat, forecast.location.lng],
      ...forecast.arrivalZones.map(zone => [zone.location.lat, zone.location.lng])
    ];
  }, [forecast]);

  const levelPercent = station
    ? Math.min(100, Math.max(0, (station.currentLevelM / station.dangerLevelM) * 100))
    : 0;

  const runSimulation = async () => {
    setActionLoading('SIMULATE');
    try {
      const result = await floodIntelligenceService.simulate(station?.id);
      addToast('Flood Forecast Generated', result.message, 'critical');
      await loadDashboard();
    } catch (error) {
      addToast('Simulation Failed', error.message, 'alert');
    } finally {
      setActionLoading('');
    }
  };

  const updateAsset = async (assetId, status) => {
    setActionLoading(`${assetId}:${status}`);
    try {
      const result = await floodIntelligenceService.updateInfrastructure(assetId, status, true);
      addToast(
        'Infrastructure Status Saved',
        result.routingUpdated
          ? 'Emergency route scoring now avoids this road or bridge condition.'
          : 'The asset is operational and available to the route engine.',
        result.routingUpdated ? 'alert' : 'success'
      );
      await loadDashboard();
    } catch (error) {
      addToast('Status Update Failed', error.message, 'alert');
    } finally {
      setActionLoading('');
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100">
      <AuthorityHeader />
      <main className="mx-auto max-w-[1600px] space-y-4 p-4">
        <section className="flex flex-col justify-between gap-4 rounded-3xl border border-blue-900/60 bg-gradient-to-r from-[#111827] to-blue-950/30 p-5 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-400">
              <Radio className="h-3.5 w-3.5 animate-pulse" /> Predictive flood response layer
            </div>
            <h1 className="mt-2 font-heading text-3xl font-black text-white">RIVER-TO-RESCUE INTELLIGENCE</h1>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-gray-400">
              Converts gauge rise into downstream arrival windows, removes failed roads and bridges from response routes, and accounts for households that are safe or need rescue.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={loadDashboard} disabled={loading} className="flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-4 py-2 text-xs font-bold text-gray-200 hover:bg-gray-800 disabled:opacity-50">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh MongoDB
            </button>
            <button type="button" onClick={runSimulation} disabled={Boolean(actionLoading) || dashboard?.storageMode === 'DEMO_PREVIEW'} className="flex items-center gap-2 rounded-xl border border-red-500 bg-red-600 px-4 py-2 text-xs font-black text-white shadow-lg shadow-red-950/40 hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50">
              <Siren className="h-4 w-4" /> {actionLoading === 'SIMULATE' ? 'GENERATING...' : 'SIMULATE RAPID RISE'}
            </button>
          </div>
        </section>

        {(serviceWarning || dashboard?.storageMode === 'DEMO_PREVIEW') && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-700 bg-amber-950/40 p-4 text-xs text-amber-100">
            <AlertOctagon className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <div>
              <b>Preview mode:</b> {serviceWarning || 'The displayed readings are a simulation.'}
              <div className="mt-1 text-[10px] text-amber-300/70">Never use DEMO_SENSOR data for field decisions. Connect a verified hydrology feed before production operations.</div>
            </div>
          </div>
        )}

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryCard icon={Waves} label="Flood risk" value={forecast?.risk || 'NO DATA'} detail={`${forecast?.stage || 'Unknown'} stage · ${forecast?.confidenceScore || 0}% confidence`} color="text-red-400" />
          <SummaryCard icon={Clock3} label="Danger lead time" value={formatMinutes(forecast?.dangerLeadMinutes)} detail={forecast?.predictedDangerAt ? `Threshold ${new Date(forecast.predictedDangerAt).toLocaleTimeString()}` : 'Insufficient rise-rate evidence'} color="text-amber-400" />
          <SummaryCard icon={Users} label="Population at risk" value={(forecast?.atRiskPopulation || 0).toLocaleString()} detail={`${(forecast?.atRiskHouseholds || 0).toLocaleString()} downstream households`} color="text-purple-400" />
          <SummaryCard icon={Route} label="Route disruptions" value={roadDisruptions.length} detail="Dynamic assets applied to route scoring" color="text-orange-400" />
          <SummaryCard icon={ShieldAlert} label="Need rescue" value={checkInSummary.needRescue.people} detail={`${checkInSummary.needRescue.households} household check-in(s)`} color="text-red-400" />
        </section>

        <section className="grid gap-4 xl:grid-cols-12">
          <div className="overflow-hidden rounded-3xl border border-gray-800 bg-[#111827] xl:col-span-7">
            <div className="flex items-center justify-between border-b border-gray-800 px-5 py-3">
              <div>
                <h2 className="flex items-center gap-2 font-heading text-sm font-black text-white"><MapPinned className="h-4 w-4 text-cyan-400" /> DOWNSTREAM ARRIVAL MAP</h2>
                <p className="mt-0.5 text-[10px] text-gray-500">Forecast wave path, impact radiuses, and verified infrastructure condition</p>
              </div>
              <span className="rounded-full border border-blue-800 bg-blue-950 px-2.5 py-1 text-[9px] font-black text-blue-300">{forecast?.isSimulation ? 'SIMULATION' : 'LIVE FEED'}</span>
            </div>
            <div className="h-[470px]">
              {forecast && (
                <MapContainer center={[20.26, 85.84]} zoom={9} className="h-full w-full" scrollWheelZoom>
                  <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Polyline positions={routeLine} pathOptions={{ color: '#38bdf8', weight: 4, dashArray: '9 9' }} />
                  <CircleMarker center={[forecast.location.lat, forecast.location.lng]} radius={11} pathOptions={{ color: '#f8fafc', fillColor: '#ef4444', fillOpacity: 0.95, weight: 3 }}>
                    <Popup><b>{forecast.stationName}</b><br />{forecast.currentLevelM}m · {forecast.risk}</Popup>
                  </CircleMarker>
                  {forecast.arrivalZones.map(zone => (
                    <React.Fragment key={zone.zoneId}>
                      <Circle center={[zone.location.lat, zone.location.lng]} radius={zone.radiusKm * 1000} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.12, weight: 2 }} />
                      <CircleMarker center={[zone.location.lat, zone.location.lng]} radius={8} pathOptions={{ color: '#fbbf24', fillColor: '#ef4444', fillOpacity: 0.95 }}>
                        <Popup><b>{zone.name}</b><br />Arrival: {formatMinutes(zone.arrivalMinutes)}<br />Population: {zone.population.toLocaleString()}<br />Shelter: {zone.priorityShelter}</Popup>
                      </CircleMarker>
                    </React.Fragment>
                  ))}
                  {infrastructure.map(asset => (
                    <CircleMarker key={asset.id} center={[asset.location.lat, asset.location.lng]} radius={asset.type === 'SHELTER' ? 7 : 6} pathOptions={{ color: '#f8fafc', fillColor: assetColor[asset.status], fillOpacity: 0.95, weight: 2 }}>
                      <Popup><b>{asset.name}</b><br />{asset.type} · {asset.status.replaceAll('_', ' ')}<br />{asset.description}</Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              )}
            </div>
          </div>

          <div className="space-y-4 xl:col-span-5">
            <div className={`rounded-3xl border p-5 ${riskStyles[forecast?.risk] || riskStyles.LOW}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-80">Live threshold model</div>
                  <h2 className="mt-1 font-heading text-xl font-black text-white">{station?.riverName || 'River station unavailable'}</h2>
                  <p className="mt-1 text-xs opacity-80">{station?.name}</p>
                </div>
                <Gauge className="h-8 w-8" />
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-black/20 p-3"><div className="text-[9px] uppercase opacity-70">Current</div><div className="mt-1 text-lg font-black">{station?.currentLevelM}m</div></div>
                <div className="rounded-xl bg-black/20 p-3"><div className="text-[9px] uppercase opacity-70">Warning</div><div className="mt-1 text-lg font-black">{station?.warningLevelM}m</div></div>
                <div className="rounded-xl bg-black/20 p-3"><div className="text-[9px] uppercase opacity-70">Danger</div><div className="mt-1 text-lg font-black">{station?.dangerLevelM}m</div></div>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/30">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500 transition-all" style={{ width: `${levelPercent}%` }} />
              </div>
              <div className="mt-3 flex flex-wrap justify-between gap-2 text-[10px] font-bold">
                <span className="flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" /> {station?.trend?.replaceAll('_', ' ')} · +{station?.riseRateMetersPerHour}m/hr</span>
                <span>{station?.rainfall24hMm}mm / 24h</span>
                <span>{station?.source}</span>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-800 bg-[#111827] p-5">
              <h2 className="flex items-center gap-2 font-heading text-sm font-black text-white"><Clock3 className="h-4 w-4 text-amber-400" /> DOWNSTREAM ARRIVAL TIMELINE</h2>
              <div className="mt-4 space-y-3">
                {(forecast?.arrivalZones || []).map((zone, index) => (
                  <div key={zone.zoneId} className="relative flex gap-3">
                    <div className="flex w-8 shrink-0 flex-col items-center">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full border border-red-500 bg-red-950 text-[10px] font-black text-red-200">{index + 1}</div>
                      {index < forecast.arrivalZones.length - 1 && <div className="mt-1 h-full w-px bg-red-900" />}
                    </div>
                    <div className="min-w-0 flex-1 rounded-xl border border-gray-800 bg-gray-950/50 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div><div className="text-xs font-black text-white">{zone.name}</div><div className="mt-0.5 text-[10px] text-gray-500">{zone.distanceKm} km downstream · {zone.population.toLocaleString()} people</div></div>
                        <span className="shrink-0 rounded-lg bg-red-950 px-2 py-1 text-[10px] font-black text-red-300">T+ {formatMinutes(zone.arrivalMinutes)}</span>
                      </div>
                      <p className="mt-2 text-[10px] text-emerald-300">Shelter: {zone.priorityShelter}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-12">
          <div className="rounded-3xl border border-gray-800 bg-[#111827] p-5 xl:col-span-7">
            <div className="flex flex-col justify-between gap-2 border-b border-gray-800 pb-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="flex items-center gap-2 font-heading text-base font-black text-white"><Construction className="h-5 w-5 text-orange-400" /> ROAD & BRIDGE ISOLATION DETECTOR</h2>
                <p className="mt-1 text-[10px] text-gray-500">Changing a road or bridge status updates the MongoDB asset and the emergency route engine.</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400"><Database className="h-3.5 w-3.5" /> {dashboard?.storageMode}</div>
            </div>
            <div className="mt-4 space-y-3">
              {infrastructure.map(asset => (
                <article key={asset.id} className="rounded-2xl border border-gray-800 bg-gray-950/45 p-4">
                  <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md border border-gray-700 px-2 py-0.5 text-[9px] font-black text-gray-300">{asset.type}</span>
                        <span className="rounded-md px-2 py-0.5 text-[9px] font-black text-white" style={{ backgroundColor: assetColor[asset.status] }}>{asset.status.replaceAll('_', ' ')}</span>
                        {asset.verified && <span className="flex items-center gap-1 text-[9px] font-bold text-blue-300"><BadgeCheck className="h-3.5 w-3.5" /> Verified</span>}
                      </div>
                      <h3 className="mt-2 text-sm font-black text-white">{asset.name}</h3>
                      <p className="mt-1 text-[10px] leading-relaxed text-gray-400">{asset.description}</p>
                    </div>
                    <select value={asset.status} disabled={Boolean(actionLoading) || dashboard?.storageMode === 'DEMO_PREVIEW'} onChange={event => updateAsset(asset.id, event.target.value)} className="shrink-0 rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-[10px] font-bold text-white outline-none focus:border-blue-500 disabled:opacity-50">
                      {statusOptions.map(status => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
                    </select>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-800 bg-[#111827] p-5 xl:col-span-5">
            <div className="border-b border-gray-800 pb-4">
              <h2 className="flex items-center gap-2 font-heading text-base font-black text-white"><HeartPulse className="h-5 w-5 text-red-400" /> SAFE / RESCUE ACCOUNTABILITY</h2>
              <p className="mt-1 text-[10px] text-gray-500">Household responses arrive in real time and remain linked to their warning in MongoDB.</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-emerald-800 bg-emerald-950/35 p-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <div className="mt-2 text-2xl font-black text-emerald-200">{checkInSummary.safe.people}</div>
                <div className="text-[10px] font-bold uppercase text-emerald-400">People safe</div>
                <div className="mt-1 text-[9px] text-gray-500">{checkInSummary.safe.households} households</div>
              </div>
              <div className="rounded-2xl border border-red-800 bg-red-950/40 p-4">
                <ShieldAlert className="h-5 w-5 text-red-400" />
                <div className="mt-2 text-2xl font-black text-red-200">{checkInSummary.needRescue.people}</div>
                <div className="text-[10px] font-bold uppercase text-red-400">Need rescue</div>
                <div className="mt-1 text-[9px] text-gray-500">{checkInSummary.needRescue.vulnerablePeople} vulnerable</div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {checkIns.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-700 p-8 text-center">
                  <Activity className="mx-auto h-7 w-7 text-gray-600" />
                  <p className="mt-2 text-xs font-bold text-gray-300">Waiting for household check-ins</p>
                  <p className="mt-1 text-[10px] text-gray-500">Citizens respond from the Nearby Alerts page.</p>
                </div>
              ) : checkIns.slice(0, 8).map(checkIn => (
                <article key={checkIn.id} className={`rounded-xl border p-3 ${checkIn.status === 'NEED_RESCUE' ? 'border-red-800 bg-red-950/35' : 'border-emerald-900 bg-emerald-950/20'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-black text-white">{checkIn.user?.name || 'Registered citizen'}</div>
                      <div className="mt-0.5 text-[10px] text-gray-400">{checkIn.peopleCount} people · {checkIn.vulnerablePeople} vulnerable · {checkIn.user?.district || 'District pending'}</div>
                    </div>
                    <span className={`text-[9px] font-black ${checkIn.status === 'NEED_RESCUE' ? 'text-red-300' : 'text-emerald-300'}`}>{checkIn.status.replace('_', ' ')}</span>
                  </div>
                  {checkIn.status === 'NEED_RESCUE' && checkIn.user?.phone && <div className="mt-2 text-[10px] font-bold text-red-200">Emergency contact: {checkIn.user.phone}</div>}
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
