import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { calculatePriorityScore } from '../services/priorityEngine';
import { getRankedRecommendations } from '../services/recommendationEngine';
import {
  ShieldAlert,
  Users,
  Clock,
  MapPin,
  Truck,
  Home,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  Phone,
  UserCheck
} from 'lucide-react';

export const IncidentDetailPanel = () => {
  const {
    incidents,
    resources,
    shelters,
    selectedIncidentId,
    assignResourceToIncident,
    assignShelterToIncident
  } = useAppState();

  const [showAlternatives, setShowAlternatives] = useState(false);

  const incident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

  if (!incident) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-gray-500 bg-[#111827] border border-gray-800 rounded-2xl">
        Select an incident from the feed or map to view details.
      </div>
    );
  }

  // Priority Score & Gauge Calculation
  const priorityCalc = calculatePriorityScore(incident);
  const priorityScore = incident.priorityScore || priorityCalc.score;
  const breakdown = priorityCalc.breakdown;

  // Ranked Rescue Team Recommendations
  const rankedTeams = getRankedRecommendations(incident, resources);
  const topTeamRec = rankedTeams[0];
  const alternativeTeams = rankedTeams.slice(1, 4);

  // Recommended Shelter (Nearest with open capacity)
  const availableShelters = shelters.filter(s => s.status !== 'FULL' && s.status !== 'CLOSED');
  const recommendedShelter = availableShelters[0] || shelters[0];

  const assignedTeam = resources.find(r => r.id === incident.assignedResourceId);
  const assignedShelter = shelters.find(s => s.id === incident.assignedShelterId);

  return (
    <div className="flex flex-col h-full bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Panel Top Header */}
      <div className="p-4 border-b border-gray-800 bg-[#151e32] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="font-mono font-black text-sm text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
            {incident.id}
          </span>
          <h3 className="font-heading font-bold text-sm text-gray-100 truncate max-w-[220px]">
            {incident.title}
          </h3>
        </div>

        <span
          className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-full border ${
            incident.severity === 'CRITICAL'
              ? 'bg-red-950 text-red-300 border-red-800 animate-pulse'
              : incident.severity === 'HIGH'
              ? 'bg-orange-950 text-orange-300 border-orange-800'
              : 'bg-yellow-950 text-yellow-300 border-yellow-800'
          }`}
        >
          {incident.severity}
        </span>
      </div>

      {/* Scrollable Content Drawer */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Consolidated Cluster Alert Badge */}
        <div className="bg-blue-950/40 border border-blue-800/60 rounded-xl p-2.5 flex items-center gap-2.5 text-xs text-blue-200">
          <Layers className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            <b>{incident.reportCount || 17} citizen reports</b> consolidated into this incident via geospatial clustering.
          </span>
        </div>

        {/* Incident Summary Metadata & Image */}
        <div className="bg-[#151e32] border border-gray-800 rounded-xl p-3 space-y-3">
          {incident.image && (
            <div className="relative h-32 rounded-lg overflow-hidden border border-gray-800">
              <img
                src={incident.image}
                alt={incident.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-2">
                <span className="text-[11px] text-gray-300 font-mono">
                  📍 {incident.location.name}
                </span>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-300 leading-relaxed italic bg-slate-900/60 p-2.5 rounded-lg border border-gray-800">
            "{incident.description}"
          </p>

          {/* Key Incident Stats Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-[#0d1322] p-2 rounded-lg border border-gray-800">
              <div className="text-[10px] text-gray-400 font-mono uppercase">People Affected</div>
              <div className="font-bold text-sm text-gray-100 mt-0.5">{incident.peopleAffected}</div>
            </div>
            <div className="bg-[#0d1322] p-2 rounded-lg border border-gray-800">
              <div className="text-[10px] text-gray-400 font-mono uppercase">People Trapped</div>
              <div className="font-bold text-sm text-red-400 mt-0.5">{incident.peopleTrapped}</div>
            </div>
            <div className="bg-[#0d1322] p-2 rounded-lg border border-gray-800">
              <div className="text-[10px] text-gray-400 font-mono uppercase">Vulnerable</div>
              <div className="font-bold text-sm text-amber-400 mt-0.5">{incident.vulnerablePeople}</div>
            </div>
          </div>
        </div>

        {/* PRIORITY ENGINE VISUALIZATION (Section 11) */}
        <div className="bg-[#151e32] border border-gray-800 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-gray-200">
                Priority Engine Score
              </h4>
            </div>
            <div className="flex items-center gap-1 font-mono font-black text-base text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800">
              <span>{priorityScore}</span>
              <span className="text-[10px] text-gray-400">/ 100</span>
            </div>
          </div>

          {/* Gauge Bars Breakdown */}
          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between text-[11px] text-gray-300 mb-1">
                <span>Severity Level</span>
                <span className="font-mono text-red-400 font-bold">{breakdown.severity}%</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${breakdown.severity}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-gray-300 mb-1">
                <span>People Affected</span>
                <span className="font-mono text-orange-400 font-bold">{breakdown.peopleAffected}%</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${breakdown.peopleAffected}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-gray-300 mb-1">
                <span>Waiting Time Urgency</span>
                <span className="font-mono text-yellow-400 font-bold">{breakdown.waitingTime}%</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${breakdown.waitingTime}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-gray-300 mb-1">
                <span>Vulnerability Score</span>
                <span className="font-mono text-amber-400 font-bold">{breakdown.vulnerability}%</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${breakdown.vulnerability}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-gray-300 mb-1">
                <span>Report Confidence</span>
                <span className="font-mono text-emerald-400 font-bold">{breakdown.confidence}%</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${breakdown.confidence}%` }}></div>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-gray-400 italic">
            Priority is dynamically calculated using severity, affected population, waiting time, vulnerability and report confidence.
          </p>
        </div>

        {/* RESOURCE MATCH RECOMMENDATION ENGINE (Sections 12 & 13) */}
        <div className="bg-[#151e32] border border-blue-900/60 rounded-xl p-3.5 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl"></div>

          <div className="flex items-center justify-between border-b border-gray-800 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-blue-200">
                Recommended Rescue Response
              </h4>
            </div>

            {assignedTeam && (
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                DEPLOYED
              </span>
            )}
          </div>

          {topTeamRec ? (
            <div className="space-y-3">
              {/* Top Match Header */}
              <div className="bg-[#0d1322] border border-blue-800/60 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-heading font-bold text-sm text-gray-100">
                      🚑 {topTeamRec.resource.name}
                    </h5>
                    <p className="text-[11px] text-gray-400">
                      📍 {topTeamRec.resource.location.name} ({topTeamRec.distanceKm} km away)
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-gray-400 font-mono">MATCH SCORE</div>
                    <div className="font-mono font-black text-lg text-emerald-400">
                      {topTeamRec.totalScore}%
                    </div>
                  </div>
                </div>

                {/* Specs Pill Matrix */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="bg-[#151e32] p-1.5 rounded border border-gray-800 flex justify-between">
                    <span className="text-gray-400">Estimated Arrival:</span>
                    <span className="font-mono font-bold text-blue-300">{topTeamRec.etaMinutes} min</span>
                  </div>
                  <div className="bg-[#151e32] p-1.5 rounded border border-gray-800 flex justify-between">
                    <span className="text-gray-400">Capacity:</span>
                    <span className="font-mono font-bold text-gray-200">
                      {topTeamRec.resource.capacity} (Req {incident.peopleTrapped || 5})
                    </span>
                  </div>
                </div>

                {/* Capabilities Badges */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {topTeamRec.resource.capabilities.map((cap, i) => (
                    <span
                      key={i}
                      className="bg-blue-950 text-blue-300 border border-blue-800/80 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 font-mono"
                    >
                      ✓ {cap}
                    </span>
                  ))}
                </div>

                {/* Scoring Formula Breakdown Drawer */}
                <div className="bg-[#151e32]/80 p-2 rounded-lg border border-gray-800 text-[10px] font-mono space-y-1 mt-2">
                  <div className="text-gray-400 font-semibold mb-1">SCORE CONTRIBUTION BREAKDOWN</div>
                  <div className="flex justify-between text-gray-300">
                    <span>Priority Contribution (45%):</span>
                    <span>+{topTeamRec.breakdown.priorityContrib} pts</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Capability Match (25%):</span>
                    <span>+{topTeamRec.breakdown.capabilityContrib} pts</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Distance Proximity (20%):</span>
                    <span>+{topTeamRec.breakdown.distanceContrib} pts</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Availability (10%):</span>
                    <span>+{topTeamRec.breakdown.availContrib} pts</span>
                  </div>
                </div>
              </div>

              {/* Action Button: ASSIGN TEAM */}
              {incident.assignedResourceId ? (
                <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-200 p-3 rounded-xl text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold">{assignedTeam?.name} Assigned</div>
                      <div className="text-[10px] text-emerald-300">Route plotted on map. Team en route.</div>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => assignResourceToIncident(incident.id, topTeamRec.resource.id)}
                  className="w-full py-2.5 rounded-xl font-heading font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 border border-blue-400/30 transition-all flex items-center justify-center gap-2 transform active:scale-95"
                >
                  <Truck className="w-4 h-4" />
                  <span>ASSIGN {topTeamRec.resource.name.toUpperCase()}</span>
                </button>
              )}

              {/* View Alternatives Toggle */}
              <button
                onClick={() => setShowAlternatives(!showAlternatives)}
                className="w-full text-center text-xs text-blue-400 hover:underline pt-1 font-medium"
              >
                {showAlternatives ? 'Hide Alternatives' : 'View Alternative Resources'}
              </button>

              {/* Alternatives List */}
              {showAlternatives && (
                <div className="space-y-2 pt-1">
                  {alternativeTeams.map(alt => (
                    <div
                      key={alt.resource.id}
                      className="bg-[#0d1322] border border-gray-800 p-2.5 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-gray-200">{alt.resource.name}</div>
                        <div className="text-[10px] text-gray-400">
                          Match: <b className="text-blue-300">{alt.totalScore}%</b> | Distance: {alt.distanceKm}km ({alt.etaMinutes}m ETA)
                        </div>
                      </div>

                      <button
                        onClick={() => assignResourceToIncident(incident.id, alt.resource.id)}
                        disabled={incident.assignedResourceId === alt.resource.id}
                        className="px-2.5 py-1 rounded bg-gray-800 hover:bg-blue-600 text-white text-[11px] font-bold transition-colors"
                      >
                        Assign
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No available rescue teams match this incident.</p>
          )}
        </div>

        {/* SHELTER RECOMMENDATION (Section 14) */}
        <div className="bg-[#151e32] border border-emerald-900/60 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-emerald-400" />
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-emerald-200">
                Recommended Shelter
              </h4>
            </div>

            {assignedShelter && (
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                RESERVED
              </span>
            )}
          </div>

          {recommendedShelter && (
            <div className="space-y-2.5 text-xs">
              <div className="bg-[#0d1322] border border-emerald-900/40 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-heading font-bold text-sm text-gray-100">
                      🏠 {recommendedShelter.name}
                    </h5>
                    <p className="text-[11px] text-gray-400">📍 {recommendedShelter.location.name}</p>
                  </div>
                  <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                    {recommendedShelter.status}
                  </span>
                </div>

                {/* Capacity Progress bar */}
                <div>
                  <div className="flex justify-between text-[11px] text-gray-300 mb-1 font-mono">
                    <span>Occupancy Capacity</span>
                    <span>
                      <b>{recommendedShelter.occupied}</b> / {recommendedShelter.capacity} ({recommendedShelter.available} free)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${(recommendedShelter.occupied / recommendedShelter.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Facilities checklist */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {recommendedShelter.facilities.map((fac, i) => (
                    <span
                      key={i}
                      className="bg-emerald-950 text-emerald-300 border border-emerald-800/60 text-[10px] px-1.5 py-0.5 rounded font-mono"
                    >
                      ✓ {fac}
                    </span>
                  ))}
                </div>
              </div>

              {/* Assign Shelter Button */}
              {incident.assignedShelterId ? (
                <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-200 p-2.5 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Reserved at {assignedShelter?.name}</span>
                </div>
              ) : (
                <button
                  onClick={() => assignShelterToIncident(incident.id, recommendedShelter.id)}
                  className="w-full py-2 rounded-xl font-heading font-bold text-xs bg-emerald-700 hover:bg-emerald-600 text-white shadow-lg border border-emerald-400/30 transition-all flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  <span>ASSIGN SHELTER ({recommendedShelter.name.slice(0, 20)}...)</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
