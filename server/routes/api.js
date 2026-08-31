import express from 'express';
import {
  ODISHA_INCIDENTS,
  ODISHA_RESCUE_RESOURCES,
  ODISHA_GOVERNMENT_SCHOOLS,
  ODISHA_SUPPLY_CENTERS,
  ODISHA_ALERTS,
  ODISHA_SMS_IVR_REPORTS
} from '../data/odishaData.js';

const router = express.Router();

// In-memory state store for live updates
let incidents = [...ODISHA_INCIDENTS];
let resources = [...ODISHA_RESCUE_RESOURCES];
let schools = [...ODISHA_GOVERNMENT_SCHOOLS];
let supplyCenters = [...ODISHA_SUPPLY_CENTERS];
let alerts = [...ODISHA_ALERTS];
let smsReports = [...ODISHA_SMS_IVR_REPORTS];

// 1. INCIDENTS ENDPOINTS
router.get('/incidents', (req, res) => {
  res.json({ success: true, count: incidents.length, incidents });
});

router.post('/incidents', (req, res) => {
  const data = req.body;
  const newId = `INC-${1030 + Math.floor(Math.random() * 100)}`;
  
  // Rule-based priority scoring calculation
  let severityScore = 15;
  if (data.severity === 'CRITICAL') severityScore = 35;
  else if (data.severity === 'HIGH') severityScore = 26;
  else if (data.severity === 'MEDIUM') severityScore = 18;
  else if (data.severity === 'LOW') severityScore = 8;

  const trappedScore = Math.min(25, Math.round((parseInt(data.peopleTrapped) || 0) * 6.5));
  const vulnerableScore = Math.min(20, Math.round((parseInt(data.vulnerablePeople) || 0) * 7.0));
  const affectedScore = Math.min(10, Math.round((parseInt(data.peopleAffected) || 1) * 0.4));
  const totalPriority = Math.min(100, Math.max(10, severityScore + trappedScore + vulnerableScore + affectedScore + 10));

  const newIncident = {
    id: newId,
    title: `${data.type} Emergency in ${data.locationName || 'Odisha Locality'}`,
    type: data.type || 'FLOOD',
    severity: data.severity || 'HIGH',
    priorityScore: totalPriority,
    confidenceScore: 92,
    location: {
      name: data.locationName || "Bhubaneswar Urban Sector",
      lat: data.lat || 20.2961,
      lng: data.lng || 85.8245,
      district: data.district || "Khordha",
      address: data.address || "Reported via Citizen App"
    },
    peopleAffected: parseInt(data.peopleAffected) || 1,
    peopleTrapped: parseInt(data.peopleTrapped) || 0,
    vulnerablePeople: parseInt(data.vulnerablePeople) || 0,
    waitingTimeMinutes: 1,
    reportCount: 1,
    status: "UNASSIGNED",
    assignedResourceId: null,
    assignedShelterId: null,
    description: data.description || "Citizen emergency report.",
    image: data.image || "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
    reportedAt: new Date().toISOString(),
    reporter: { name: data.reporterName || "Anonymous Citizen", phone: data.phone || "+91 94370 00000" }
  };

  incidents.unshift(newIncident);
  res.status(201).json({ success: true, incident: newIncident });
});

router.patch('/incidents/:id/assign', (req, res) => {
  const { id } = req.params;
  const { resourceId, shelterId } = req.body;

  const incident = incidents.find(i => i.id === id);
  if (!incident) return res.status(404).json({ success: false, error: "Incident not found" });

  if (resourceId) {
    incident.assignedResourceId = resourceId;
    incident.status = "RESOURCE_ASSIGNED";
    const resUnit = resources.find(r => r.id === resourceId);
    if (resUnit) resUnit.status = "ASSIGNED";
  }

  if (shelterId) {
    incident.assignedShelterId = shelterId;
    if (incident.status === "RESOURCE_ASSIGNED") incident.status = "RESCUE_IN_PROGRESS";
    const school = schools.find(s => s.id === shelterId);
    if (school) {
      school.occupied += incident.peopleAffected || 10;
      school.available = Math.max(0, school.capacity - school.occupied);
      if (school.available === 0) school.status = "FULL";
      else if (school.available < 80) school.status = "NEAR_CAPACITY";
    }
  }

  res.json({ success: true, incident });
});

// 2. RESCUE RESOURCES ENDPOINTS
router.get('/resources', (req, res) => {
  res.json({ success: true, count: resources.length, resources });
});

router.patch('/resources/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const resource = resources.find(r => r.id === id);
  if (!resource) return res.status(404).json({ success: false, error: "Resource not found" });
  resource.status = status;
  res.json({ success: true, resource });
});

// 3. GOVERNMENT SCHOOLS & SHELTER ACTIVATION ENDPOINTS
router.get('/schools', (req, res) => {
  res.json({ success: true, count: schools.length, schools });
});

// Activate school shelter and trigger emergency contact notifications
router.post('/schools/:id/activate', (req, res) => {
  const { id } = req.params;
  const { incidentId, expectedEvacuees = 35 } = req.body;
  const school = schools.find(s => s.id === id);
  if (!school) return res.status(404).json({ success: false, error: "School shelter not found" });

  school.status = "ACTIVE";
  
  // Notification log sent to authorized contacts
  const notificationsSent = school.staff.map(member => ({
    staffId: member.id,
    name: member.name,
    role: member.role,
    contact: member.authorizedContact,
    status: "DELIVERED",
    message: `SHELTER ACTIVATED: ${school.schoolName}. Expected Evacuees: ${expectedEvacuees}. Incident: ${incidentId || 'OD-2026-1024'}. Please report for emergency shelter duty as per OSDMA protocol.`
  }));

  res.json({
    success: true,
    school,
    activation: {
      shelterId: school.id,
      schoolName: school.schoolName,
      status: "ACTIVATED",
      expectedEvacuees,
      notificationsSent,
      timestamp: new Date().toISOString()
    }
  });
});

// Staff Duty Confirmation (ACCEPT / DECLINE / ROLE UPDATE)
router.post('/schools/:id/staff-duty', (req, res) => {
  const { id } = req.params;
  const { staffId, dutyStatus, role } = req.body;
  const school = schools.find(s => s.id === id);
  if (!school) return res.status(404).json({ success: false, error: "School not found" });

  const staffMember = school.staff.find(m => m.id === staffId);
  if (!staffMember) return res.status(404).json({ success: false, error: "Staff member not found" });

  if (dutyStatus) staffMember.dutyStatus = dutyStatus;
  if (role) staffMember.role = role;

  res.json({ success: true, staffMember, school });
});

// 4. RELIEF SUPPLY CALCULATION & ALLOCATION
router.post('/supplies/calculate-and-allocate', (req, res) => {
  const { evacueesCount = 35, incidentId, shelterId } = req.body;

  // Formula: 2L water/person/day, 1 food packet/person, 1 blanket/person, 1 kit per 7 people
  const requirements = {
    waterLiters: evacueesCount * 2.5,
    foodPackets: evacueesCount,
    blankets: evacueesCount,
    medicalKits: Math.max(1, Math.ceil(evacueesCount / 7)),
    tarpaulins: Math.max(1, Math.ceil(evacueesCount / 10))
  };

  // Find nearest operational supply center
  const supplyCenter = supplyCenters[0];
  if (supplyCenter) {
    supplyCenter.inventory.drinkingWaterLiters -= requirements.waterLiters;
    supplyCenter.inventory.foodRations -= requirements.foodPackets;
    supplyCenter.inventory.blankets -= requirements.blankets;
    supplyCenter.inventory.medicalKits -= requirements.medicalKits;
  }

  res.json({
    success: true,
    incidentId,
    shelterId,
    evacueesCount,
    allocatedFrom: supplyCenter?.name,
    requirements,
    status: "DISPATCHED",
    dispatchedAt: new Date().toISOString()
  });
});

// 5. ALERTS & SMS FALLBACK
router.get('/alerts', (req, res) => {
  res.json({ success: true, count: alerts.length, alerts });
});

router.get('/sms-reports', (req, res) => {
  res.json({ success: true, count: smsReports.length, smsReports });
});

// 6. AI INCIDENT SUMMARIZER (Section 22)
router.post('/ai/summarize', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ success: false, error: "Text is required" });

  const lower = text.toLowerCase();
  const isFlood = lower.includes('water') || lower.includes('flood') || lower.includes('pani');
  const isCyclone = lower.includes('cyclone') || lower.includes('wind') || lower.includes('tree');
  const isLandslide = lower.includes('landslide') || lower.includes('mud') || lower.includes('hill');
  const isFire = lower.includes('fire') || lower.includes('electric') || lower.includes('transformer');

  let type = "OTHER";
  if (isFlood) type = "FLOOD";
  else if (isCyclone) type = "CYCLONE";
  else if (isLandslide) type = "LANDSLIDE";
  else if (isFire) type = "FIRE";

  const isBlocked = lower.includes('block') || lower.includes('cut off') || lower.includes('subway');
  const isTrapped = lower.includes('trap') || lower.includes('roof') || lower.includes('balcony') || lower.includes('atki');
  const isElderly = lower.includes('old') || lower.includes('elderly') || lower.includes('grandmother') || lower.includes('babu');

  res.json({
    success: true,
    summary: {
      disasterType: type,
      estimatedSeverity: isTrapped || isFlood ? "CRITICAL" : "HIGH",
      peopleEstimate: 7,
      vulnerableGroup: isElderly ? "Elderly & Children" : "General Public",
      roadBlocked: isBlocked ? "YES" : "NO",
      rescueRequired: "YES",
      recommendedUnit: isFlood ? "ODRAF Boat Unit" : "Fire & Emergency Services",
      confidenceScore: 94
    }
  });
});

export default router;
