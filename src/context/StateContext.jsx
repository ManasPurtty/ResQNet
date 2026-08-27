import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  INITIAL_INCIDENTS,
  INITIAL_RESOURCES,
  INITIAL_SHELTERS,
  INITIAL_SUPPLY_CENTERS,
  INITIAL_ALERTS,
  SMS_IVR_REPORTS
} from '../data/mockData';
import { calculatePriorityScore } from '../services/priorityEngine';

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
  
  const [selectedIncidentId, setSelectedIncidentId] = useState("INC-1024");
  const [toasts, setToasts] = useState([]);
  const [isLiveSimulation, setIsLiveSimulation] = useState(false);
  
  // Demo Mode state
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  // User auth state (citizen / authority)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('resqnet_user');
    return saved ? JSON.parse(saved) : { role: 'AUTHORITY', email: 'admin@resqnet.demo', name: 'Commander Admin' };
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

  // Add Citizen Report
  const addCitizenReport = (reportData) => {
    const newId = `INC-${1030 + Math.floor(Math.random() * 100)}`;
    const priorityCalc = calculatePriorityScore({
      severity: reportData.severity,
      peopleTrapped: parseInt(reportData.peopleTrapped || 0),
      vulnerablePeople: parseInt(reportData.vulnerablePeople || 0),
      peopleAffected: parseInt(reportData.peopleAffected || 1),
      waitingTimeMinutes: 1,
      confidenceScore: 92
    });

    const newIncident = {
      id: newId,
      title: `${reportData.type} Emergency in ${reportData.locationName || 'City Area'}`,
      type: reportData.type,
      severity: reportData.severity,
      priorityScore: priorityCalc.score,
      confidenceScore: 92,
      location: {
        name: reportData.locationName || "City Center Sector",
        lat: reportData.lat || (13.0400 + (Math.random() - 0.5) * 0.05),
        lng: reportData.lng || (80.2300 + (Math.random() - 0.5) * 0.05),
        address: reportData.address || "Reported via Citizen Mobile App"
      },
      peopleAffected: parseInt(reportData.peopleAffected || 1),
      peopleTrapped: parseInt(reportData.peopleTrapped || 0),
      vulnerablePeople: parseInt(reportData.vulnerablePeople || 0),
      waitingTimeMinutes: 1,
      reportCount: 1,
      status: "UNASSIGNED",
      assignedResourceId: null,
      assignedShelterId: null,
      description: reportData.description || "Emergency report filed by citizen.",
      image: reportData.image || "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
      reportedAt: new Date().toISOString(),
      reporter: { name: reportData.reporterName || "Anonymous Citizen", phone: reportData.phone || "+91 99999 88888" }
    };

    setIncidents(prev => [newIncident, ...prev]);
    setSelectedIncidentId(newId);
    addToast("🚨 New Citizen Report Received", `${newIncident.id}: ${newIncident.type} - Priority ${newIncident.priorityScore}`, "critical");
    return newIncident;
  };

  // Assign Rescue Team
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

    addToast(
      "🚑 Rescue Team Deployed",
      `${res?.name || resourceId} assigned to ${incidentId}. ETA ~7 mins.`,
      "success"
    );
  };

  // Assign Shelter
  const assignShelterToIncident = (incidentId, shelterId) => {
    const inc = incidents.find(i => i.id === incidentId);
    const shelter = shelters.find(s => s.id === shelterId);
    const peopleCount = inc ? (inc.peopleAffected || 5) : 5;

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
        let newStatus = s.status;
        if (newAvailable === 0) newStatus = 'FULL';
        else if (newAvailable < 50) newStatus = 'NEAR_CAPACITY';

        return {
          ...s,
          occupied: newOccupied,
          available: newAvailable,
          status: newStatus
        };
      }
      return s;
    }));

    addToast(
      "🏠 Evacuation Shelter Assigned",
      `${shelter?.name || shelterId} reserved for ${peopleCount} evacuees from ${incidentId}.`,
      "info"
    );
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
    const newAlertId = `ALERT-${804 + alerts.length}`;
    const newAlert = {
      id: newAlertId,
      title: "FLASH FLOOD EMERGENCY — ADYAR BASIN",
      source: "IMD Emergency Radar Feed",
      severity: "EXTREME",
      affectedRegion: "Saidapet, Kotturpuram & Velachery Lowland",
      issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      validUntil: "Midnight",
      details: "Radar detects sudden intense cloudburst (75mm/hr). Water level rising rapidly along Adyar basin. Priority scores across affected zones escalated by +15 points.",
      coordinates: [
        [13.0300, 80.2000],
        [13.0400, 80.2400],
        [13.0100, 80.2600],
        [12.9800, 80.2200]
      ]
    };

    setAlerts(prev => [newAlert, ...prev]);
    // Escalate priorities of nearby unassigned flood incidents
    setIncidents(prev => prev.map(inc => {
      if (inc.status === 'UNASSIGNED') {
        return { ...inc, priorityScore: Math.min(99, inc.priorityScore + 8) };
      }
      return inc;
    }));

    addToast("⚠ NEW OFFICIAL IMD EMERGENCY ALERT", newAlert.title, "alert");
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
      description: `Ingested via SMS Fallback from ${sms.phone}: "${sms.rawText}"`,
      reporterName: `SMS User (${sms.phone.slice(-4)})`,
      phone: sms.phone
    });

    setSmsReports(prev => prev.filter(s => s.id !== smsId));
    addToast("📡 SMS Converted", `Created incident from low-connectivity report ${smsId}`, "success");
  };

  // Automated 10-step Demo Mode Walkthrough Script for Hackathon Presentation
  const runDemoMode = () => {
    if (isDemoPlaying) return;
    setIsDemoPlaying(true);
    setDemoStep(1);

    addToast("🎬 DEMO MODE ACTIVATED", "Playing 10-step disaster response simulation...", "info");

    const steps = [
      () => {
        setDemoStep(1);
        addToast("Demo Step 1/10", "Initial disaster state: 12 active incidents & 8 rescue teams loaded.", "info");
      },
      () => {
        setDemoStep(2);
        const newInc = addCitizenReport({
          type: "FLOOD",
          severity: "CRITICAL",
          peopleAffected: 12,
          peopleTrapped: 6,
          vulnerablePeople: 2,
          locationName: "Saidapet Main Market",
          description: "Water level rose 4ft rapidly. 6 shoppers trapped inside pharmacy.",
          lat: 13.0230,
          lng: 80.2210
        });
        setSelectedIncidentId(newInc.id);
      },
      () => {
        setDemoStep(3);
        addToast("Demo Step 3/10", "Dynamic Priority Engine calculates priority score 96/100.", "critical");
      },
      () => {
        setDemoStep(4);
        addToast("Demo Step 4/10", "Recommendation Engine matches NDRF Team #04 (93% score, 2.1km, 7 min ETA).", "info");
      },
      () => {
        setDemoStep(5);
        const currentSelected = incidents[0]?.id || "INC-1024";
        assignResourceToIncident(currentSelected, "TEAM-04");
        setDemoStep(5);
      },
      () => {
        setDemoStep(6);
        simulateNewAlert();
        setDemoStep(6);
      },
      () => {
        setDemoStep(7);
        assignShelterToIncident("INC-1024", "SHELTER-03");
        setDemoStep(7);
      },
      () => {
        setDemoStep(8);
        addToast("Demo Step 8/10", "Heatmap intensifies. Risk zone polygon active.", "alert");
        setDemoStep(8);
      },
      () => {
        setDemoStep(9);
        addToast("Demo Step 9/10", "Resource utilization updated: Team #04 ASSIGNED, Shelter #03 +12 occupancy.", "success");
        setDemoStep(9);
      },
      () => {
        setDemoStep(10);
        addToast("🎉 DEMO SIMULATION COMPLETE", "Full workflow verified: Report → Priority → Recommendation → Assignment → Shelter", "success");
        setIsDemoPlaying(false);
        setDemoStep(0);
      }
    ];

    steps.forEach((stepFn, idx) => {
      setTimeout(() => {
        stepFn();
      }, (idx + 1) * 3000);
    });
  };

  // Live Simulation Heartbeat
  useEffect(() => {
    if (!isLiveSimulation) return;

    const interval = setInterval(() => {
      const types = ["FLOOD", "BUILDING_DAMAGE", "MEDICAL", "ROAD_BLOCKAGE"];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const severities = ["HIGH", "CRITICAL", "MEDIUM"];
      const randomSev = severities[Math.floor(Math.random() * severities.length)];

      addCitizenReport({
        type: randomType,
        severity: randomSev,
        peopleAffected: Math.floor(Math.random() * 15) + 3,
        peopleTrapped: randomSev === 'CRITICAL' ? Math.floor(Math.random() * 5) + 2 : 0,
        vulnerablePeople: Math.floor(Math.random() * 3),
        locationName: "Adyar Sector Zone",
        description: "Simulated live incoming emergency report.",
        lat: 13.0100 + (Math.random() - 0.5) * 0.08,
        lng: 80.2200 + (Math.random() - 0.5) * 0.08
      });
    }, 20000);

    return () => clearInterval(interval);
  }, [isLiveSimulation]);

  return (
    <StateContext.Provider
      value={{
        incidents,
        resources,
        shelters,
        supplyCenters,
        alerts,
        smsReports,
        selectedIncidentId,
        setSelectedIncidentId,
        toasts,
        addToast,
        removeToast,
        addCitizenReport,
        assignResourceToIncident,
        assignShelterToIncident,
        updateResourceStatus,
        updateShelterStatus,
        simulateNewAlert,
        convertSmsToIncident,
        isLiveSimulation,
        setIsLiveSimulation,
        isDemoPlaying,
        demoStep,
        runDemoMode,
        currentUser,
        setCurrentUser
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useAppState = () => useContext(StateContext);
