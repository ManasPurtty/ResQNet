import React from 'react';
import { AuthorityHeader } from '../components/AuthorityHeader';
import { KpiCard } from '../components/Cards';
import { useAppState } from '../context/StateContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  ShieldAlert,
  Truck,
  Home,
  Clock,
  Users,
  Activity,
  BarChart3
} from 'lucide-react';

export const AnalyticsPage = () => {
  const { incidents, resources, shelters } = useAppState();

  const activeIncidentsCount = incidents.length;
  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL').length;
  const availableTeams = resources.filter(r => r.status === 'AVAILABLE').length;
  const deployedTeams = resources.filter(r => r.status === 'ASSIGNED').length;
  const totalRescued = 184;
  const availableSheltersCount = shelters.filter(s => s.status !== 'FULL' && s.status !== 'CLOSED').length;

  // Chart 1: Incidents by Type
  const incidentsByTypeData = [
    { type: 'Flood', count: incidents.filter(i => i.type === 'FLOOD').length },
    { type: 'Building', count: incidents.filter(i => i.type === 'BUILDING_DAMAGE').length },
    { type: 'Medical', count: incidents.filter(i => i.type === 'MEDICAL').length },
    { type: 'Road Block', count: incidents.filter(i => i.type === 'ROAD_BLOCKAGE').length },
    { type: 'Landslide', count: incidents.filter(i => i.type === 'LANDSLIDE').length },
    { type: 'Fire', count: incidents.filter(i => i.type === 'FIRE').length }
  ];

  // Chart 2: Incidents by Severity
  const severityData = [
    { name: 'Critical', value: incidents.filter(i => i.severity === 'CRITICAL').length, color: '#ef4444' },
    { name: 'High', value: incidents.filter(i => i.severity === 'HIGH').length, color: '#f97316' },
    { name: 'Medium', value: incidents.filter(i => i.severity === 'MEDIUM').length, color: '#eab308' },
    { name: 'Low', value: incidents.filter(i => i.severity === 'LOW').length, color: '#10b981' }
  ];

  // Chart 3: Response Time Trend over past hours
  const responseTimeData = [
    { hour: '06:00', eta: 14, target: 10 },
    { hour: '08:00', eta: 12, target: 10 },
    { hour: '10:00', eta: 9, target: 10 },
    { hour: '12:00', eta: 7.2, target: 10 },
    { hour: '14:00', eta: 6.8, target: 10 },
    { hour: '16:00', eta: 7.1, target: 10 }
  ];

  // Chart 4: Resource Utilization
  const resourceUtilData = [
    { status: 'Available', count: availableTeams, color: '#10b981' },
    { status: 'Assigned', count: deployedTeams, color: '#3b82f6' },
    { status: 'Busy', count: resources.filter(r => r.status === 'BUSY').length, color: '#f59e0b' },
    { status: 'Unavailable', count: resources.filter(r => r.status === 'UNAVAILABLE').length, color: '#6b7280' }
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col font-sans">
      <AuthorityHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
            EOC COMMAND ANALYTICS
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm">
            Operational metrics, response velocity trends, and resource distribution analytics.
          </p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Active Incidents"
            value={activeIncidentsCount}
            subtitle={`${criticalCount} Critical Priority`}
            icon={ShieldAlert}
            color="red"
          />
          <KpiCard
            title="Rescue Teams Deployed"
            value={`${deployedTeams} / ${resources.length}`}
            subtitle={`${availableTeams} Units Ready`}
            icon={Truck}
            color="blue"
          />
          <KpiCard
            title="Citizens Rescued"
            value={totalRescued}
            subtitle="Past 24 Hours"
            icon={Users}
            color="emerald"
            trend="+18 today"
          />
          <KpiCard
            title="Avg Response Time"
            value="7.1 Min"
            subtitle="Target: < 10.0 Min"
            icon={Clock}
            color="purple"
            trend="-2.4m faster"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Incidents by Type Bar Chart */}
          <div className="lg:col-span-7 bg-[#111827] border border-gray-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="font-heading font-bold text-sm text-gray-200 uppercase tracking-wider">
              Incidents Breakdown by Disaster Type
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incidentsByTypeData}>
                  <XAxis dataKey="type" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#151e32', borderColor: '#374151', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Incidents by Severity Pie Chart */}
          <div className="lg:col-span-5 bg-[#111827] border border-gray-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="font-heading font-bold text-sm text-gray-200 uppercase tracking-wider">
              Incidents Severity Distribution
            </h3>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#151e32', borderColor: '#374151', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Response Performance Trend Area Chart */}
          <div className="lg:col-span-7 bg-[#111827] border border-gray-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="font-heading font-bold text-sm text-gray-200 uppercase tracking-wider">
              Response Time Velocity Trend (ETA Minutes)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={responseTimeData}>
                  <XAxis dataKey="hour" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#151e32', borderColor: '#374151', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="eta" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Resource Utilization Status */}
          <div className="lg:col-span-5 bg-[#111827] border border-gray-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="font-heading font-bold text-sm text-gray-200 uppercase tracking-wider">
              Resource Utilization Status
            </h3>
            <div className="space-y-3 pt-2">
              {resourceUtilData.map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-gray-300">
                    <span>{item.status}</span>
                    <span className="font-bold">{item.count} units</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(item.count / resources.length) * 100}%`,
                        backgroundColor: item.color
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
