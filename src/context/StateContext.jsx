import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { io as createSocket } from 'socket.io-client';
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
import { authService } from '../services/authService';
import { reportService } from '../services/reportService';
import { notificationService } from '../services/notificationService';
import { API_ORIGIN } from '../config/api';

const StateContext = createContext();
const AUTHORITY_ROLES = new Set(['ADMIN', 'AUTHORITY', 'RESCUE_LEAD']);

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
    try {
      const saved = localStorage.getItem('resqnet_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [myIncidents, setMyIncidents] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [nearbyAlertsEnabled, setNearbyAlertsEnabled] = useState(Boolean(currentUser?.lastKnownLocation));
  const [alertLocationStatus, setAlertLocationStatus] = useState(
    currentUser?.lastKnownLocation ? 'Location active' : 'Location not enabled'
  );
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission
  );
  const notificationIdsRef = useRef(new Set());
  const notificationsLoadedRef = useRef(false);
  const socketRef = useRef(null);

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

  const showBrowserNotification = notification => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.svg',
      tag: notification.entityId
    });
    browserNotification.onclick = () => {
      window.focus();
      window.location.assign('/nearby-alerts');
    };
  };

  const refreshNotifications = useCallback(async () => {
    if (!currentUser || !authService.getToken()) {
      setNotifications([]);
      setUnreadNotificationCount(0);
      notificationIdsRef.current = new Set();
      notificationsLoadedRef.current = false;
      return [];
    }

    try {
      const data = await notificationService.getNotifications();
      const nextNotifications = data.notifications || [];
      const freshUnread = nextNotifications.filter(notification => (
        !notification.readAt && !notificationIdsRef.current.has(notification.id)
      ));

      setNotifications(nextNotifications);
      setUnreadNotificationCount(data.unreadCount || 0);

      if (notificationsLoadedRef.current && freshUnread[0]) {
        showBrowserNotification(freshUnread[0]);
        addToast(freshUnread[0].title, freshUnread[0].message, 'critical');
      }

      notificationIdsRef.current = new Set(nextNotifications.map(notification => notification.id));
      notificationsLoadedRef.current = true;
      return nextNotifications;
    } catch (error) {
      if (error.status === 401) setCurrentUser(null);
      return [];
    }
  }, [currentUser]);

  const enableNearbyAlerts = async () => {
    if (!currentUser || !authService.getToken()) {
      addToast('Login Required', 'Log in before enabling nearby emergency alerts.', 'alert');
      return false;
    }

    if (!navigator.geolocation) {
      setAlertLocationStatus('GPS is not supported by this browser');
      addToast('Location Unsupported', 'This browser cannot share a GPS location.', 'alert');
      return false;
    }

    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
      }

      setAlertLocationStatus('Detecting your current area...');
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 60000
        });
      });

      const result = await authService.updateLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracyMeters: position.coords.accuracy,
        alertRadiusKm: 15
      });

      setCurrentUser(authService.getUser());
      setNearbyAlertsEnabled(true);
      setAlertLocationStatus(`Active within 15 km · ±${Math.round(position.coords.accuracy)} m`);
      await refreshNotifications();
      addToast(
        'Nearby Alerts Enabled',
        result.notificationsSynced > 0
          ? `${result.notificationsSynced} active warning(s) found near you.`
          : 'You will now receive warnings reported near your current area.',
        'success'
      );
      return true;
    } catch (error) {
      const message = error.code === 1
        ? 'Location permission was denied. Enable it in your browser settings to receive nearby warnings.'
        : error.message || 'Your current location could not be saved.';
      setAlertLocationStatus('Location permission required');
      addToast('Nearby Alerts Not Enabled', message, 'alert');
      return false;
    }
  };

  const markNotificationRead = async notificationId => {
    try {
      await notificationService.markRead(notificationId);
      setNotifications(previous => previous.map(notification => (
        notification.id === notificationId
          ? { ...notification, readAt: new Date().toISOString() }
          : notification
      )));
      setUnreadNotificationCount(previous => Math.max(0, previous - 1));
    } catch (error) {
      addToast('Alert Update Failed', error.message, 'alert');
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await notificationService.markAllRead();
      const readAt = new Date().toISOString();
      setNotifications(previous => previous.map(notification => ({ ...notification, readAt })));
      setUnreadNotificationCount(0);
    } catch (error) {
      addToast('Alert Update Failed', error.message, 'alert');
    }
  };

  const refreshAuthorityIncidents = useCallback(async () => {
    if (!AUTHORITY_ROLES.has(currentUser?.role) || !authService.getToken()) return [];

    try {
      const databaseIncidents = await reportService.getIncidentClusters();
      setIncidents(previous => {
        const databaseIds = new Set(databaseIncidents.map(incident => incident.id));
        return [...databaseIncidents, ...previous.filter(incident => !databaseIds.has(incident.id))];
      });
      return databaseIncidents;
    } catch {
      return [];
    }
  }, [currentUser]);

  const refreshMyReports = useCallback(async () => {
    if (!currentUser || !authService.getToken()) {
      setMyIncidents([]);
      setReportsError('');
      return [];
    }

    setReportsLoading(true);
    setReportsError('');

    try {
      const reports = await reportService.getMine();
      setMyIncidents(reports);
      setIncidents(previous => {
        const reportIds = new Set(reports.map(report => report.id));
        return [...reports, ...previous.filter(incident => !reportIds.has(incident.id))];
      });
      return reports;
    } catch (error) {
      if (error.status === 401) setCurrentUser(null);
      setReportsError(error.message);
      return [];
    } finally {
      setReportsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    refreshMyReports();
  }, [refreshMyReports]);

  useEffect(() => {
    refreshNotifications();
    refreshAuthorityIncidents();

    if (!currentUser) {
      setNearbyAlertsEnabled(false);
      setAlertLocationStatus('Location not enabled');
      return;
    }

    setNearbyAlertsEnabled(Boolean(currentUser.lastKnownLocation));
    if (currentUser.lastKnownLocation) setAlertLocationStatus('Location active');
  }, [currentUser, refreshNotifications, refreshAuthorityIncidents]);

  useEffect(() => {
    if (!currentUser || !authService.getToken()) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return undefined;
    }

    const socket = createSocket(API_ORIGIN, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      auth: { token: authService.getToken() }
    });
    socketRef.current = socket;

    const handleCommunityAlert = () => refreshNotifications();
    const handleResponseUpdate = () => {
      refreshNotifications();
      refreshMyReports();
      refreshAuthorityIncidents();
    };

    socket.on('community-alert-created', handleCommunityAlert);
    socket.on('notifications-synced', handleCommunityAlert);
    socket.on('incident-response-updated', handleResponseUpdate);
    socket.on('incident-created', refreshAuthorityIncidents);

    return () => {
      socket.off('community-alert-created', handleCommunityAlert);
      socket.off('notifications-synced', handleCommunityAlert);
      socket.off('incident-response-updated', handleResponseUpdate);
      socket.off('incident-created', refreshAuthorityIncidents);
      socket.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [currentUser, refreshNotifications, refreshMyReports, refreshAuthorityIncidents]);

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

  // Create a local-only incident for authority simulations and SMS ingestion.
  const addSimulatedIncident = (reportData) => {
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

    // Run Auto-Allotment for new incident
    const allotments = autoAllotNearestUnitsForIncident(newIncident);

    addToast(
      "🚨 New Citizen Emergency Reported",
      `${newIncident.id}: Priority ${newIncident.priorityScore}/100. Auto-allocated nearest Fire Station (${allotments?.nearestFireStation?.distanceKm || 2}km) & School Shelter (${allotments?.nearestSchoolShelter?.distanceKm || 1.5}km).`,
      "critical"
    );

    return newIncident;
  };

  // Persist a citizen report under the authenticated MongoDB user.
  const addCitizenReport = async (reportData) => {
    if (!currentUser || !authService.getToken()) {
      addToast(
        'Login Required',
        'Please log in or create an account before reporting an incident.',
        'alert'
      );
      return null;
    }

    try {
      const newIncident = await reportService.create(reportData);
      setIncidents(previous => [newIncident, ...previous.filter(incident => incident.id !== newIncident.id)]);
      setMyIncidents(previous => [newIncident, ...previous.filter(incident => incident.id !== newIncident.id)]);
      setSelectedIncidentId(newIncident.id);

      const allotments = autoAllotNearestUnitsForIncident(newIncident);
      const warning = newIncident.communityWarning;
      addToast(
        newIncident.fusion?.mergedWithExistingIncident
          ? '✅ Report Verified an Existing Incident'
          : '🚨 Emergency Report Stored',
        warning
          ? `${warning.recipientsNotified} nearby user(s) warned within ${warning.radiusKm} km. Incident confidence: ${newIncident.fusion?.confidenceScore || newIncident.confidenceScore}%.`
          : `${newIncident.id}: saved to MongoDB with priority ${newIncident.priorityScore}/100.`,
        'critical'
      );

      return { ...newIncident, allotments };
    } catch (error) {
      if (error.status === 401) setCurrentUser(null);
      addToast('Report Submission Failed', error.message, 'alert');
      throw error;
    }
  };

  // Assign Rescue Team (Fire Station / ODRAF)
  const assignResourceToIncident = async (incidentId, resourceId) => {
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

    if (inc?.databaseBacked) {
      try {
        const updatedIncident = await reportService.updateResponderStatus(incidentId, {
          responderStatus: 'ASSIGNED',
          resourceId,
          resourceName: res?.name || resourceId,
          etaMinutes: 6,
          lat: res?.location?.lat,
          lng: res?.location?.lng
        });
        setIncidents(previous => previous.map(item => (
          item.id === incidentId ? { ...item, ...updatedIncident } : item
        )));
      } catch (error) {
        addToast('Database Dispatch Update Failed', error.message, 'alert');
      }
    }

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

  const updateIncidentResponse = async (incidentId, responseUpdate) => {
    try {
      const updatedIncident = await reportService.updateResponderStatus(incidentId, responseUpdate);
      setIncidents(previous => previous.map(incident => (
        incident.id === incidentId ? { ...incident, ...updatedIncident } : incident
      )));
      setMyIncidents(previous => previous.map(incident => (
        incident.clusterId === incidentId || incident.id === incidentId
          ? { ...incident, ...updatedIncident, id: incident.id }
          : incident
      )));
      addToast(
        'Live Response Updated',
        `${incidentId}: ${updatedIncident.responderStatus.replaceAll('_', ' ')}${updatedIncident.etaMinutes !== null && updatedIncident.etaMinutes !== undefined ? ` · ETA ${updatedIncident.etaMinutes} min` : ''}`,
        'success'
      );
      return updatedIncident;
    } catch (error) {
      addToast('Response Update Failed', error.message, 'alert');
      throw error;
    }
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
  const simulateNewAlert = async () => {
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

    try {
      const published = await notificationService.publish({
        source: 'IMD',
        type: 'CYCLONE',
        severity: 'CRITICAL',
        title: newAlert.title,
        message: 'Critical cyclone and flash-flood warning for Bhubaneswar. Move indoors or to the nearest cyclone shelter and avoid flooded roads.',
        locationName: 'Bhubaneswar Metropolitan Region',
        district: 'Khordha',
        lat: 20.2961,
        lng: 85.8245,
        radiusKm: 15
      });

      setAlerts(prev => [{
        ...newAlert,
        databaseId: published.alert.id,
        recipientsNotified: published.recipientsNotified
      }, ...prev]);
      setIncidents(prev => prev.map(inc => (
        inc.status === 'UNASSIGNED'
          ? { ...inc, priorityScore: Math.min(99, inc.priorityScore + 8) }
          : inc
      )));

      addToast(
        '⚠ OFFICIAL IMD RED CYCLONE ALERT',
        `${published.recipientsNotified} nearby registered user(s) notified and the alert was stored in MongoDB.`,
        'alert'
      );
    } catch (error) {
      addToast('Official Alert Broadcast Failed', error.message, 'alert');
    }
  };

  // Convert SMS report into active incident
  const convertSmsToIncident = (smsId) => {
    const sms = smsReports.find(s => s.id === smsId);
    if (!sms) return;

    addSimulatedIncident({
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
        const newInc = addSimulatedIncident({
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
        updateIncidentResponse,
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
        notifications,
        unreadNotificationCount,
        refreshNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        nearbyAlertsEnabled,
        alertLocationStatus,
        notificationPermission,
        enableNearbyAlerts,
        refreshAuthorityIncidents,
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
        myIncidents,
        reportsLoading,
        reportsError,
        refreshMyReports
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useAppState = () => useContext(StateContext);
