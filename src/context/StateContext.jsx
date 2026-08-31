import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  INITIAL_INCIDENTS,
  INITIAL_RESOURCES,
  INITIAL_SHELTERS,
  INITIAL_SUPPLY_CENTERS,
  INITIAL_ALERTS,
  SMS_IVR_REPORTS,
  ODISHA_ROAD_HAZARDS,
  HAZARD_ZONE_POLYGON
} from '../data/mockData';
import {
  calculatePriorityScore
} from '../services/priorityEngine';
import {
  findNearestFireStationRescueTeam,
  findNearestHospitalAmbulance,
  findNearestGovernmentSchoolShelter
} from '../services/recommendationEngine';
import { optimizeEmergencyRoute } from '../services/routeOptimizationEngine';

const StateContext = createContext();

// Helper to play Web Audio API emergency chime
const playAudioBeep = (freq = 880, duration = 0.2) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Audio context not allowed until user gesture or unsupported
  }
};

export const StateProvider = ({ children }) => {
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [resources, setResources] = useState(INITIAL_RESOURCES);
  const [shelters, setShelters] = useState(INITIAL_SHELTERS);
  const [supplyCenters, setSupplyCenters] = useState(INITIAL_SUPPLY_CENTERS);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [smsReports, setSmsReports] = useState(SMS_IVR_REPORTS);
  const [roadHazards, setRoadHazards] = useState(ODISHA_ROAD_HAZARDS);
  
  const [selectedIncidentId, setSelectedIncidentId] = useState("INC-1024");
  const [toasts, setToasts] = useState([]);
  const [isLiveSimulation, setIsLiveSimulation] = useState(false);
  
  // Citizen's own submitted incident IDs (persistent in localStorage)
  const [myReportedIncidentIds, setMyReportedIncidentIds] = useState(() => {
    try {
      const saved = localStorage.getItem('resqnet_my_reports');
      return saved ? JSON.parse(saved) : ["INC-1024"];
    } catch {
      return ["INC-1024"];
    }
  });

  // Demo Mode state
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  // ==========================================
  // EMERGENCY ROUTE OPTIMIZATION STATE
  // ==========================================
  const [routeOrigin, setRouteOrigin] = useState(() => ({
    id: "FIRE-STATION-01",
    name: "Kalpana Fire & Emergency Services Station",
    lat: 20.2580,
    lng: 85.8420,
    type: "FIRE_STATION"
  }));

  const [routeDestination, setRouteDestination] = useState(() => ({
    id: "INC-1024",
    name: "INC-1024: Rasulgarh / Daya River Canal Basin",
    lat: 20.2915,
    lng: 85.8640,
    type: "INCIDENT"
  }));

  const [routeVehicleType, setRouteVehicleType] = useState('AMBULANCE'); // 'AMBULANCE', 'RESCUE_TEAM', 'RELIEF_VEHICLE'
  const [optimizedRouteData, setOptimizedRouteData] = useState(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [isOptimizingRoute, setIsOptimizingRoute] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationProgress, setNavigationProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('INCIDENT_DETAILS');

  // User auth state
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('resqnet_user');
    return saved ? JSON.parse(saved) : { role: 'AUTHORITY', email: 'eoc.commander@odisha.gov.in', name: 'Odisha EOC Commander' };
  });

  const addToast = (title, message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-4), { id, title, message, type }]);
    if (type === 'critical' || type === 'alert') {
      playAudioBeep(880, 0.3);
    } else {
      playAudioBeep(587, 0.15);
    }
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // AUTOMATIC ALLOTMENT ON INCIDENT SELECTION OR CHANGE
  const autoAllotNearestUnitsForIncident = (targetIncident) => {
    if (!targetIncident || !targetIncident.location) return;

    const loc = targetIncident.location;

    // 1. Nearest Fire Station / Rescue Team
    const nearestFireRes = findNearestFireStationRescueTeam(loc, resources);
    // 2. Nearest Hospital Ambulance
    const nearestAmbRes = findNearestHospitalAmbulance(loc, resources);
    // 3. Nearest Government School Shelter
    const nearestSchoolRes = findNearestGovernmentSchoolShelter(loc, shelters);

    // Auto-select origin in Route Optimizer depending on vehicle type
    if (routeVehicleType === 'AMBULANCE' && nearestAmbRes) {
      setRouteOrigin({
        id: nearestAmbRes.resource.id,
        name: nearestAmbRes.resource.name,
        lat: nearestAmbRes.resource.location.lat,
        lng: nearestAmbRes.resource.location.lng,
        type: nearestAmbRes.resource.type
      });
    } else if (nearestFireRes) {
      setRouteOrigin({
        id: nearestFireRes.resource.id,
        name: nearestFireRes.resource.name,
        lat: nearestFireRes.resource.location.lat,
        lng: nearestFireRes.resource.location.lng,
        type: nearestFireRes.resource.type
      });
    }

    setRouteDestination({
      id: targetIncident.id,
      name: `${targetIncident.id}: ${targetIncident.title.slice(0, 30)}`,
      lat: loc.lat,
      lng: loc.lng,
      type: "INCIDENT"
    });

    return {
      nearestFireStation: nearestFireRes,
      nearestHospitalAmbulance: nearestAmbRes,
      nearestSchoolShelter: nearestSchoolRes
    };
  };

  // When selected incident ID changes, trigger auto allotment
  useEffect(() => {
    const inc = incidents.find(i => i.id === selectedIncidentId);
    if (inc) {
      autoAllotNearestUnitsForIncident(inc);
    }
  }, [selectedIncidentId]);

  // Add Citizen Report + Automatic Allotment Trigger
  const addCitizenReport = (reportData) => {
    const newId = `INC-${1030 + Math.floor(Math.random() * 100)}`;
    const priorityCalc = calculatePriorityScore({
      severity: reportData.severity,
      peopleTrapped: parseInt(reportData.peopleTrapped || 0),
      vulnerablePeople: parseInt(reportData.vulnerablePeople || 0),
      peopleAffected: parseInt(reportData.peopleAffected || 1),
      waitingTimeMinutes: 1,
      confidenceScore: 94
    });

    const newIncident = {
      id: newId,
      title: `${reportData.type} in ${reportData.locationName || 'Odisha Location'}`,
      type: reportData.type,
      severity: reportData.severity,
      priorityScore: priorityCalc.score,
      confidenceScore: 94,
      location: {
        name: reportData.locationName || "Bhubaneswar Urban Corridor",
        lat: reportData.lat || (20.2961 + (Math.random() - 0.5) * 0.05),
        lng: reportData.lng || (85.8245 + (Math.random() - 0.5) * 0.05),
        district: reportData.district || "Khordha",
        address: reportData.address || "Reported via Odisha Citizen App"
      },
      peopleAffected: parseInt(reportData.peopleAffected || 1),
      peopleTrapped: parseInt(reportData.peopleTrapped || 0),
      vulnerablePeople: parseInt(reportData.vulnerablePeople || 0),
      waitingTimeMinutes: 1,
      reportCount: 1,
      status: "UNASSIGNED",
      assignedResourceId: null,
      assignedShelterId: null,
      description: reportData.description || "Emergency reported by citizen.",
      image: reportData.image || "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
      reportedAt: new Date().toISOString(),
      reporter: { name: reportData.reporterName || "Anonymous Citizen", phone: reportData.phone || "+91 94370 99999" }
    };

    setIncidents(prev => [newIncident, ...prev]);
    setSelectedIncidentId(newId);

    // Save to citizen's personal report list
    setMyReportedIncidentIds(prev => {
      const updated = [newId, ...prev];
      try {
        localStorage.setItem('resqnet_my_reports', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Run Auto-Allotment for new incident
    const allotments = autoAllotNearestUnitsForIncident(newIncident);

    addToast(
      "🚨 New Citizen Emergency Reported",
      `${newIncident.id}: Priority ${newIncident.priorityScore}/100. Auto-allocated nearest Fire Station (${allotments?.nearestFireStation?.distanceKm || 2}km) & School Shelter (${allotments?.nearestSchoolShelter?.distanceKm || 1.5}km).`,
      "critical"
    );

    return newIncident;
  };

  // Assign Rescue Team (Fire Station / ODRAF)
  const assignResourceToIncident = (incidentId, resourceId) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          status: 'RESOURCE_ASSIGNED',
          assignedResourceId: resourceId
        };
      }
      return inc;
    }));

    setResources(prev => prev.map(res => {
      if (res.id === resourceId) {
        return {
          ...res,
          status: 'ASSIGNED',
          currentAssignment: incidentId
        };
      }
      return res;
    }));

    const inc = incidents.find(i => i.id === incidentId);
    const res = resources.find(r => r.id === resourceId);

    if (res && inc) {
      setRouteOrigin({
        id: res.id,
        name: res.name,
        lat: res.location.lat,
        lng: res.location.lng,
        type: res.type
      });
      setRouteDestination({
        id: inc.id,
        name: `${inc.id}: ${inc.location.name}`,
        lat: inc.location.lat,
        lng: inc.location.lng,
        type: "INCIDENT"
      });
    }

    addToast(
      "🚒 Rescue Team / Fire Station Dispatched",
      `${res?.name || resourceId} assigned to ${incidentId}. ETA ~6 mins.`,
      "success"
    );
  };

  // Activate School Shelter & Notify Authorized Emergency Contacts
  const activateSchoolShelter = (incidentId, shelterId, expectedEvacuees = 35) => {
    const inc = incidents.find(i => i.id === incidentId);
    const shelter = shelters.find(s => s.id === shelterId);
    const peopleCount = inc ? (inc.peopleAffected || expectedEvacuees) : expectedEvacuees;

    setIncidents(prev => prev.map(i => {
      if (i.id === incidentId) {
        return { ...i, assignedShelterId: shelterId, status: i.status === 'RESOURCE_ASSIGNED' ? 'RESCUE_IN_PROGRESS' : i.status };
      }
      return i;
    }));

    setShelters(prev => prev.map(s => {
      if (s.id === shelterId) {
        const newOccupied = s.occupied + peopleCount;
        const newAvailable = Math.max(0, s.capacity - newOccupied);
        let newStatus = 'ACTIVE';
        if (newAvailable === 0) newStatus = 'FULL';
        else if (newAvailable < 80) newStatus = 'NEAR_CAPACITY';

        const updatedStaff = s.staff ? s.staff.map(member => ({
          ...member,
          dutyStatus: member.dutyStatus || 'ACCEPTED'
        })) : [];

        return {
          ...s,
          occupied: newOccupied,
          available: newAvailable,
          status: newStatus,
          staff: updatedStaff
        };
      }
      return s;
    }));

    addToast(
      "🏫 Government School Shelter Activated",
      `${shelter?.name || shelterId} activated for ${peopleCount} evacuees. School Headmaster & Staff notified via SMS.`,
      "success"
    );
  };

  // Update Staff Duty Confirmation & Role
  const updateStaffDutyStatus = (shelterId, staffId, newStatus, newRole) => {
    setShelters(prev => prev.map(sh => {
      if (sh.id === shelterId && sh.staff) {
        return {
          ...sh,
          staff: sh.staff.map(st => {
            if (st.id === staffId) {
              return {
                ...st,
                dutyStatus: newStatus || st.dutyStatus,
                role: newRole || st.role
              };
            }
            return st;
          })
        };
      }
      return sh;
    }));

    addToast("Staff Roster Updated", `Staff member duty confirmation logged.`, "info");
  };

  // Calculate & Allocate Relief Materials from Depot
  const allocateReliefSupplies = (evacueesCount = 35, depotId = "SUPPLY-ODISHA-01") => {
    const requirements = {
      waterLiters: Math.round(evacueesCount * 2.5),
      foodPackets: evacueesCount,
      blankets: evacueesCount,
      medicalKits: Math.max(1, Math.ceil(evacueesCount / 7))
    };

    setSupplyCenters(prev => prev.map(depot => {
      if (depot.id === depotId) {
        return {
          ...depot,
          inventory: {
            ...depot.inventory,
            drinkingWaterLiters: Math.max(0, depot.inventory.drinkingWaterLiters - requirements.waterLiters),
            foodRations: Math.max(0, depot.inventory.foodRations - requirements.foodPackets),
            blankets: Math.max(0, depot.inventory.blankets - requirements.blankets)
          }
        };
      }
      return depot;
    }));

    addToast(
      "📦 Relief Supplies Dispatched",
      `Allocated ${requirements.waterLiters}L Water, ${requirements.foodPackets} Food Packets from OSDMA Depot.`,
      "info"
    );

    return requirements;
  };

  // Update Resource Status
  const updateResourceStatus = (resourceId, newStatus) => {
    setResources(prev => prev.map(r => r.id === resourceId ? { ...r, status: newStatus } : r));
    addToast("Resource Status Updated", `${resourceId} status set to ${newStatus}`, "info");
  };

  // Update Shelter Status
  const updateShelterStatus = (shelterId, newStatus) => {
    setShelters(prev => prev.map(s => s.id === shelterId ? { ...s, status: newStatus } : s));
    addToast("Shelter Status Updated", `${shelterId} is now ${newStatus}`, "info");
  };

  // Simulate New Alert
  const simulateNewAlert = () => {
    const newAlertId = `ALERT-OD-${904 + alerts.length}`;
    const newAlert = {
      id: newAlertId,
      title: "EXTREME CYCLONIC SQUALL & FLASH INUNDATION WARNING",
      source: "IMD Bhubaneswar Doppler Radar",
      severity: "EXTREME",
      affectedRegion: "Khordha, Cuttack & Puri Deltaic Margins",
      issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      validUntil: "Midnight",
      details: "Intense cloudburst detected. Water discharge escalated along Daya & Mahanadi distributaries.",
      coordinates: [
        [20.3500, 85.8000],
        [20.3600, 85.8900],
        [20.2500, 85.9200],
        [20.2000, 85.7800]
      ]
    };

    setAlerts(prev => [newAlert, ...prev]);
    setIncidents(prev => prev.map(inc => {
      if (inc.status === 'UNASSIGNED') {
        return { ...inc, priorityScore: Math.min(99, inc.priorityScore + 8) };
      }
      return inc;
    }));

    addToast("⚠ OFFICIAL IMD RED CYCLONE ALERT", newAlert.title, "alert");
  };

  // Convert SMS report into active incident
  const convertSmsToIncident = (smsId) => {
    const sms = smsReports.find(s => s.id === smsId);
    if (!sms) return;

    addCitizenReport({
      type: sms.parsed.type,
      severity: sms.parsed.severity,
      peopleAffected: sms.parsed.peopleAffected,
      peopleTrapped: sms.parsed.peopleTrapped,
      locationName: sms.parsed.locationName,
      description: `SMS Fallback from ${sms.phone}: "${sms.rawText}"`,
      reporterName: `SMS Citizen (${sms.phone.slice(-4)})`,
      phone: sms.phone
    });

    setSmsReports(prev => prev.filter(s => s.id !== smsId));
    addToast("📡 SMS Ingested into Command Feed", `Created incident from low-connectivity report ${smsId}`, "success");
  };

  // ==========================================
  // RUN EMERGENCY ROUTE OPTIMIZATION
  // ==========================================
  const runRouteOptimization = async (customOrigin, customDest, customVehicle) => {
    const originToUse = customOrigin || routeOrigin;
    const destToUse = customDest || routeDestination;
    const vehicleToUse = customVehicle || routeVehicleType;

    if (!originToUse || !destToUse) {
      addToast("Route Optimization Error", "Please select both a Start location and Destination incident.", "alert");
      return;
    }

    setIsOptimizingRoute(true);

    try {
      const result = await optimizeEmergencyRoute({
        origin: { lat: originToUse.lat, lng: originToUse.lng, name: originToUse.name },
        destination: { lat: destToUse.lat, lng: destToUse.lng, name: destToUse.name },
        vehicleType: vehicleToUse
      });

      setOptimizedRouteData(result);
      setSelectedRouteIndex(0);
      setIsNavigating(false);
      setNavigationProgress(0);

      const recommended = result.recommended_route;
      addToast(
        "✓ Safest Route Found",
        `Safety Score: ${recommended.safety_score}/100 | ${recommended.distance_km} km | ETA: ${recommended.duration_min} min`,
        "success"
      );
    } catch (err) {
      console.error(err);
      addToast("Routing Error", "Could not calculate route. Please select an alternative location.", "alert");
    } finally {
      setIsOptimizingRoute(false);
    }
  };

  // Start Navigation Simulation
  const startRouteNavigation = () => {
    if (!optimizedRouteData || !optimizedRouteData.alternative_routes[selectedRouteIndex]) return;
    setIsNavigating(true);
    setNavigationProgress(0);
    addToast("🚀 Navigation Started", "Live vehicle tracking active along recommended safe route.", "info");
  };

  const stopRouteNavigation = () => {
    setIsNavigating(false);
    setNavigationProgress(0);
  };

  // Animated Navigation Heartbeat
  useEffect(() => {
    if (!isNavigating) return;
    const interval = setInterval(() => {
      setNavigationProgress(prev => {
        if (prev >= 1) {
          setIsNavigating(false);
          addToast("🏁 Destination Reached", "Emergency vehicle arrived safely at incident site.", "success");
          return 1;
        }
        return prev + 0.04;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isNavigating]);

  // Automated 10-step Demo Mode Walkthrough Script for Hackathon Presentation
  const runDemoMode = () => {
    if (isDemoPlaying) return;
    setIsDemoPlaying(true);
    setDemoStep(1);

    addToast("🎬 ODISHA DISASTER DEMO ACTIVATED", "Playing automatic fire station, ambulance hospital & school shelter allotment...", "info");

    const steps = [
      () => {
        setDemoStep(1);
        addToast("Demo Step 1/10", "Odisha Command Map loaded with Fire Stations, Hospitals, and Government schools.", "info");
      },
      () => {
        setDemoStep(2);
        const newInc = addCitizenReport({
          type: "FLOOD",
          severity: "CRITICAL",
          peopleAffected: 35,
          peopleTrapped: 8,
          vulnerablePeople: 5,
          locationName: "Rasulgarh Canal Basin, Bhubaneswar",
          description: "Water level rose 5.5ft. 8 people trapped on 1st floor roof.",
          lat: 20.2915,
          lng: 85.8640
        });
        setSelectedIncidentId(newInc.id);
      },
      () => {
        setDemoStep(3);
        addToast("Demo Step 3/10", "Dynamic Priority Engine calculates Priority Score 95/100 (Critical).", "critical");
      },
      () => {
        setDemoStep(4);
        addToast("Demo Step 4/10", "Automatic Allotment Engine selects nearest Fire Station & Capital Hospital Ambulance.", "info");
      },
      () => {
        setDemoStep(5);
        assignResourceToIncident("INC-1024", "FIRE-STATION-01");
        setDemoStep(5);
      },
      () => {
        setDemoStep(6);
        addToast("Demo Step 6/10", "Automatic Allotment activates nearest Government School Shelter (Capital High School).", "info");
        activateSchoolShelter("INC-1024", "SCHOOL-SHELTER-01", 35);
        setDemoStep(6);
      },
      () => {
        setDemoStep(7);
        addToast("Demo Step 7/10", "Headmaster & Staff SMS notifications sent; Relief supplies allocated from OSDMA Hub.", "success");
        allocateReliefSupplies(35);
        setDemoStep(7);
      },
      () => {
        setDemoStep(8);
        setActiveTab('ROUTE_OPTIMIZER');
        addToast("Demo Step 8/10", "Emergency Route Optimization calculating safest route from nearest Fire Station to incident.", "info");
        runRouteOptimization(
          { lat: 20.2580, lng: 85.8420, name: "Kalpana Fire Station" },
          { lat: 20.2915, lng: 85.8640, name: "INC-1024" },
          'AMBULANCE'
        );
        setDemoStep(8);
      },
      () => {
        setDemoStep(9);
        startRouteNavigation();
        addToast("Demo Step 9/10", "Live Navigation Simulation moving Fire Tender / Ambulance along safe route.", "success");
        setDemoStep(9);
      },
      () => {
        setDemoStep(10);
        addToast("🎉 AUTOMATIC DISASTER ALLOTMENT COMPLETE", "Verified: Nearest Fire Station + Nearest Hospital Ambulance + Nearest School Shelter Auto-Allotted!", "success");
        setIsDemoPlaying(false);
        setDemoStep(0);
      }
    ];

    steps.forEach((stepFn, idx) => {
      setTimeout(() => {
        stepFn();
      }, (idx + 1) * 3200);
    });
  };

  useEffect(() => {
    runRouteOptimization();
  }, []);

  return (
    <StateContext.Provider
      value={{
        incidents,
        resources,
        shelters,
        supplyCenters,
        alerts,
        smsReports,
        roadHazards,
        selectedIncidentId,
        setSelectedIncidentId,
        toasts,
        addToast,
        removeToast,
        addCitizenReport,
        assignResourceToIncident,
        activateSchoolShelter,
        updateStaffDutyStatus,
        allocateReliefSupplies,
        updateResourceStatus,
        updateShelterStatus,
        simulateNewAlert,
        convertSmsToIncident,
        autoAllotNearestUnitsForIncident,
        isLiveSimulation,
        setIsLiveSimulation,
        isDemoPlaying,
        demoStep,
        runDemoMode,
        currentUser,
        setCurrentUser,
        // Route Optimization Exports
        routeOrigin,
        setRouteOrigin,
        routeDestination,
        setRouteDestination,
        routeVehicleType,
        setRouteVehicleType,
        optimizedRouteData,
        selectedRouteIndex,
        setSelectedRouteIndex,
        isOptimizingRoute,
        isNavigating,
        navigationProgress,
        runRouteOptimization,
        startRouteNavigation,
        stopRouteNavigation,
        activeTab,
        setActiveTab,
        // Citizen personal reports
        myReportedIncidentIds,
        setMyReportedIncidentIds,
        myIncidents: incidents.filter(i => myReportedIncidentIds.includes(i.id))
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useAppState = () => useContext(StateContext);
