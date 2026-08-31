// Comprehensive Authoritative Mock Data for ResQNet Odisha Platform
// Center: Odisha (Bhubaneswar, Cuttack, Puri, Rourkela, Sambalpur, Berhampur)

export const INITIAL_INCIDENTS = [
  {
    id: "INC-1024",
    title: "Severe Inundation & Trapped Families in Daya River Basin",
    type: "FLOOD",
    severity: "CRITICAL",
    priorityScore: 95,
    confidenceScore: 94,
    location: {
      name: "Rasulgarh / Daya River Canal Basin, Bhubaneswar",
      lat: 20.2915,
      lng: 85.8640,
      district: "Khordha",
      block: "Bhubaneswar Urban",
      address: "Plot 45, Canal Road, Rasulgarh, Bhubaneswar"
    },
    peopleAffected: 35,
    peopleTrapped: 8,
    vulnerablePeople: 5,
    waitingTimeMinutes: 15,
    reportCount: 18,
    status: "UNASSIGNED",
    assignedResourceId: null,
    assignedShelterId: null,
    description: "Water level rose 5.5 feet rapidly due to Daya river spillway overflow. 8 family members including 3 elderly citizens and 2 infants are trapped on 1st floor balcony.",
    image: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
    reportedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    reporter: { name: "Subrat Mohapatra", phone: "+91 94370 12345" }
  },
  {
    id: "INC-1027",
    title: "Old Masonry Wall Collapse Near Mahanadi Embankment",
    type: "BUILDING_DAMAGE",
    severity: "CRITICAL",
    priorityScore: 89,
    confidenceScore: 90,
    location: {
      name: "Bidanasi Embankment Sector, Cuttack",
      lat: 20.4720,
      lng: 85.8450,
      district: "Cuttack",
      block: "Cuttack Municipal Corporation",
      address: "Sector 6, Bidanasi Ring Road, Cuttack"
    },
    peopleAffected: 16,
    peopleTrapped: 4,
    vulnerablePeople: 2,
    waitingTimeMinutes: 22,
    reportCount: 11,
    status: "UNASSIGNED",
    assignedResourceId: null,
    assignedShelterId: null,
    description: "Two-story heritage commercial building wall collapsed due to continuous heavy rain. 4 shop workers trapped under timber and brick debris.",
    image: "https://images.unsplash.com/photo-1590055531615-f16d36ffe8ec?auto=format&fit=crop&w=800&q=80",
    reportedAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    reporter: { name: "Debashis Panda", phone: "+91 98610 54321" }
  },
  {
    id: "INC-1030",
    title: "Emergency Power & ICU Water Ingress at Capital Sub-Centre",
    type: "MEDICAL",
    severity: "CRITICAL",
    priorityScore: 94,
    confidenceScore: 98,
    location: {
      name: "Unit 6 Community Health Centre, Bhubaneswar",
      lat: 20.2680,
      lng: 85.8190,
      district: "Khordha",
      block: "Bhubaneswar Urban",
      address: "Unit 6 Health Complex, Capital Area"
    },
    peopleAffected: 24,
    peopleTrapped: 6,
    vulnerablePeople: 14,
    waitingTimeMinutes: 8,
    reportCount: 20,
    status: "UNASSIGNED",
    assignedResourceId: null,
    assignedShelterId: null,
    description: "Basement backup diesel generator submerged in 4ft flash flood water. ICU oxygen supply on battery backup (35 mins remaining). Requires immediate evacuation squad and portable dewatering pump.",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",
    reportedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    reporter: { name: "Dr. Priyambada Sahoo", phone: "+91 94371 99887" }
  },
  {
    id: "INC-1021",
    title: "NH-16 Subway Waterlogging & Stranded Commuters",
    type: "ROAD_BLOCKAGE",
    severity: "HIGH",
    priorityScore: 76,
    confidenceScore: 86,
    location: {
      name: "Khandagiri Junction Underpass, Bhubaneswar",
      lat: 20.2570,
      lng: 85.7860,
      district: "Khordha",
      block: "Bhubaneswar Urban",
      address: "Khandagiri Chowk Underpass, NH-16"
    },
    peopleAffected: 18,
    peopleTrapped: 3,
    vulnerablePeople: 1,
    waitingTimeMinutes: 30,
    reportCount: 9,
    status: "UNASSIGNED",
    assignedResourceId: null,
    assignedShelterId: null,
    description: "Underpass flooded with 5ft storm water. An ambulance and two cars stranded in middle of subway; passengers on car roofs.",
    image: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80",
    reportedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    reporter: { name: "Biswajit Nayak", phone: "+91 97760 11223" }
  },
  {
    id: "INC-1018",
    title: "Barunei Hill Foothills Mudflow & Slope Erosion",
    type: "LANDSLIDE",
    severity: "HIGH",
    priorityScore: 81,
    confidenceScore: 88,
    location: {
      name: "Barunei Foothills Road, Khordha",
      lat: 20.1780,
      lng: 85.6790,
      district: "Khordha",
      block: "Khordha Sadar",
      address: "Barunei Temple Access Road"
    },
    peopleAffected: 28,
    peopleTrapped: 5,
    vulnerablePeople: 4,
    waitingTimeMinutes: 40,
    reportCount: 14,
    status: "UNASSIGNED",
    assignedResourceId: null,
    assignedShelterId: null,
    description: "Heavy hillside run-off caused mudslide over 4 rural dwellings. Primary approach road obstructed by rockfall and mud.",
    image: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=800&q=80",
    reportedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    reporter: { name: "Manoranjan Das", phone: "+91 98612 88990" }
  },
  {
    id: "INC-1015",
    title: "Transformer Fire & Severed 33kV Line In Standing Water",
    type: "FIRE",
    severity: "HIGH",
    priorityScore: 74,
    confidenceScore: 92,
    location: {
      name: "Badambadi Bus Terminal Hub, Cuttack",
      lat: 20.4560,
      lng: 85.8750,
      district: "Cuttack",
      block: "Cuttack Municipal",
      address: "Link Road, Badambadi, Cuttack"
    },
    peopleAffected: 45,
    peopleTrapped: 0,
    vulnerablePeople: 3,
    waitingTimeMinutes: 18,
    reportCount: 16,
    status: "UNASSIGNED",
    assignedResourceId: null,
    assignedShelterId: null,
    description: "Lightning strike caused explosion of substation transformer. Sparks spreading to roadside kiosks; live snapped cable in standing water.",
    image: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80",
    reportedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    reporter: { name: "Smruti Ranjan Jena", phone: "+91 94372 44556" }
  },
  {
    id: "INC-1012",
    title: "Cyclone Gale Wind Damage & Fallen Banyan Tree Blocking Hospital",
    type: "CYCLONE",
    severity: "HIGH",
    priorityScore: 70,
    confidenceScore: 89,
    location: {
      name: "Puri District Headquarters Hospital Gate",
      lat: 19.8150,
      lng: 85.8280,
      district: "Puri",
      block: "Puri Municipality",
      address: "VIP Road, Near DHH Puri"
    },
    peopleAffected: 50,
    peopleTrapped: 0,
    vulnerablePeople: 8,
    waitingTimeMinutes: 35,
    reportCount: 12,
    status: "UNASSIGNED",
    assignedResourceId: null,
    assignedShelterId: null,
    description: "Gale gusts exceeding 95 km/h uprooted massive centuries-old banyan tree, crushing ambulance bay and blocking all incoming emergency traffic.",
    image: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=800&q=80",
    reportedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    reporter: { name: "Dr. Alok Pattnaik", phone: "+91 94373 77889" }
  },
  {
    id: "INC-1008",
    title: "Village Embankment Breach Threatening Lowland Hamlet",
    type: "FLOOD",
    severity: "CRITICAL",
    priorityScore: 92,
    confidenceScore: 91,
    location: {
      name: "Kushabhadra River Embankment, Nimapada",
      lat: 20.0650,
      lng: 85.9850,
      district: "Puri",
      block: "Nimapada",
      address: "Embankment Point 12, Kushabhadra Basin"
    },
    peopleAffected: 65,
    peopleTrapped: 12,
    vulnerablePeople: 9,
    waitingTimeMinutes: 20,
    reportCount: 15,
    status: "UNASSIGNED",
    assignedResourceId: null,
    assignedShelterId: null,
    description: "20-meter breach occurred on river embankment. Flood water rushing into village agricultural homesteads; 12 people stranded at high point.",
    image: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
    reportedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    reporter: { name: "Sarpanch Raghunath Behera", phone: "+91 94375 66778" }
  }
];

export const INITIAL_RESOURCES = [
  // ===================================================
  // FIRE STATIONS — Real Odisha Fire & Emergency Services
  // ===================================================
  {
    id: "FIRE-STATION-01",
    name: "Kalpana Square Fire Station, Bhubaneswar",
    stationType: "Fire Station",
    type: "FIRE_STATION",
    category: "RESCUE_TEAM",
    status: "AVAILABLE",
    capacity: 15,
    currentLoad: 0,
    district: "Khordha",
    capabilities: ["First Aid", "Search & Rescue", "Chainsaw Clearance", "Dewatering Pump", "Paramedic"],
    location: {
      name: "Kalpana Square Fire Station, Master Canteen Road, Bhubaneswar",
      lat: 20.2578,
      lng: 85.8419
    },
    etaMinutes: 6,
    distanceKm: 2.1,
    contactPerson: "Station Officer B. N. Mishra",
    phone: "+91 94370 10101",
    vehicleType: "RESCUE_TEAM"
  },
  {
    id: "FIRE-STATION-02",
    name: "Unit-IV Fire Station, Saheed Nagar, Bhubaneswar",
    stationType: "Fire Station",
    type: "FIRE_STATION",
    category: "RESCUE_TEAM",
    status: "AVAILABLE",
    capacity: 14,
    currentLoad: 0,
    district: "Khordha",
    capabilities: ["Search & Rescue", "Chainsaw Clearance", "Flood Rescue", "Dewatering Pump"],
    location: {
      name: "Unit-IV Fire Station, Saheed Nagar, Bhubaneswar",
      lat: 20.2840,
      lng: 85.8480
    },
    etaMinutes: 5,
    distanceKm: 1.8,
    contactPerson: "Station Officer S. K. Patnaik",
    phone: "+91 94370 10102",
    vehicleType: "RESCUE_TEAM"
  },
  {
    id: "FIRE-STATION-03",
    name: "Chandrasekharpur Fire Station, Bhubaneswar",
    stationType: "Fire Station",
    type: "FIRE_STATION",
    category: "RESCUE_TEAM",
    status: "AVAILABLE",
    capacity: 18,
    currentLoad: 0,
    district: "Khordha",
    capabilities: ["Flood Rescue", "Building Collapse", "Chainsaw Clearance", "Heavy Rescue Equipment"],
    location: {
      name: "Chandrasekharpur Fire Station, Bhubaneswar",
      lat: 20.3290,
      lng: 85.8185
    },
    etaMinutes: 9,
    distanceKm: 3.9,
    contactPerson: "Leading Fireman K. K. Sutar",
    phone: "+91 94370 10103",
    vehicleType: "RESCUE_TEAM"
  },
  {
    id: "FIRE-STATION-04",
    name: "Bidanasi Fire Station, Cuttack",
    stationType: "Fire Station",
    type: "FIRE_STATION",
    category: "RESCUE_TEAM",
    status: "AVAILABLE",
    capacity: 16,
    currentLoad: 0,
    district: "Cuttack",
    capabilities: ["Flood Rescue", "Building Collapse", "Dewatering Pumps", "Inflatable Boats"],
    location: {
      name: "Bidanasi Fire Station, Ring Road, Cuttack",
      lat: 20.4698,
      lng: 85.8417
    },
    etaMinutes: 7,
    distanceKm: 2.3,
    contactPerson: "Station Officer T. K. Sahoo",
    phone: "+91 94370 10104",
    vehicleType: "RESCUE_TEAM"
  },
  {
    id: "FIRE-STATION-05",
    name: "Puri Beach Fire & Marine Rescue Station",
    stationType: "Fire Station",
    type: "FIRE_STATION",
    category: "RESCUE_TEAM",
    status: "AVAILABLE",
    capacity: 20,
    currentLoad: 0,
    district: "Puri",
    capabilities: ["Flood Rescue", "Boat", "Coastal Rescue", "First Aid", "Life Jackets"],
    location: {
      name: "Puri Beach Road Fire Station, near Swargadwar, Puri",
      lat: 19.7985,
      lng: 85.8215
    },
    etaMinutes: 8,
    distanceKm: 2.8,
    contactPerson: "Fire Commander P. C. Sen",
    phone: "+91 94370 10105",
    vehicleType: "RESCUE_TEAM"
  },

  // ODRAF Special Rescue Units
  {
    id: "ODRAF-TEAM-04",
    name: "ODRAF Unit #04 (7th Bn BBSR)",
    stationType: "ODRAF Base",
    type: "ODRAF",
    category: "RESCUE_TEAM",
    status: "AVAILABLE",
    capacity: 25,
    currentLoad: 0,
    district: "Khordha",
    capabilities: ["Flood Rescue", "Boat", "First Aid", "Diving Equipment", "Structural Search"],
    location: {
      name: "7th OSAP Battalion Base, Bhubaneswar",
      lat: 20.3010,
      lng: 85.8390
    },
    etaMinutes: 8,
    distanceKm: 2.7,
    contactPerson: "Asst. Commandant R. C. Pradhan",
    phone: "+91 94370 20004",
    vehicleType: "RESCUE_TEAM"
  },
  {
    id: "ODRAF-TEAM-01",
    name: "ODRAF Unit #01 (6th Bn Cuttack)",
    stationType: "ODRAF Base",
    type: "ODRAF",
    category: "RESCUE_TEAM",
    status: "AVAILABLE",
    capacity: 30,
    currentLoad: 0,
    district: "Cuttack",
    capabilities: ["Flood Rescue", "Boat", "Building Collapse", "Heavy Equipment"],
    location: {
      name: "OMP Square HQ, 6th Battalion, Cuttack",
      lat: 20.4650,
      lng: 85.8950
    },
    etaMinutes: 14,
    distanceKm: 5.8,
    contactPerson: "Inspector Dilip Samal",
    phone: "+91 94370 20001",
    vehicleType: "RESCUE_TEAM"
  },

  // ===================================================
  // ROURKELA / SUNDARGARH LOCAL FIRE STATIONS
  // ===================================================
  {
    id: "FIRE-STATION-RK-01",
    name: "Panposh Fire Station, Rourkela",
    stationType: "Fire Station",
    type: "FIRE_STATION",
    category: "RESCUE_TEAM",
    status: "AVAILABLE",
    capacity: 20,
    currentLoad: 0,
    district: "Sundargarh",
    capabilities: ["Flood Rescue", "Search & Rescue", "Dewatering Pump", "Chainsaw Clearance"],
    location: {
      name: "Panposh Road Fire Station, Rourkela",
      lat: 22.2450,
      lng: 84.8820
    },
    etaMinutes: 4,
    distanceKm: 1.5,
    contactPerson: "Station Officer M. R. Swamy",
    phone: "+91 94376 10101",
    vehicleType: "RESCUE_TEAM"
  },
  {
    id: "FIRE-STATION-RK-02",
    name: "Rourkela Town Fire Station, Uditnagar",
    stationType: "Fire Station",
    type: "FIRE_STATION",
    category: "RESCUE_TEAM",
    status: "AVAILABLE",
    capacity: 18,
    currentLoad: 0,
    district: "Sundargarh",
    capabilities: ["Industrial Rescue", "Building Collapse", "First Aid", "Heavy Cutters"],
    location: {
      name: "Uditnagar Main Fire Station, Rourkela",
      lat: 22.2310,
      lng: 84.8560
    },
    etaMinutes: 6,
    distanceKm: 2.2,
    contactPerson: "Station Officer K. C. Pradhan",
    phone: "+91 94376 10102",
    vehicleType: "RESCUE_TEAM"
  },
  {
    id: "FIRE-STATION-RK-03",
    name: "Bisra Road Fire Station, Sector 19, Rourkela",
    stationType: "Fire Station",
    type: "FIRE_STATION",
    category: "RESCUE_TEAM",
    status: "AVAILABLE",
    capacity: 16,
    currentLoad: 0,
    district: "Sundargarh",
    capabilities: ["Flood Rescue", "Search & Rescue", "First Aid"],
    location: {
      name: "Bisra Road Fire Station, Sector 19, Rourkela",
      lat: 22.2590,
      lng: 84.9080
    },
    etaMinutes: 3,
    distanceKm: 1.1,
    contactPerson: "Station Officer A. K. Behera",
    phone: "+91 94376 10103",
    vehicleType: "RESCUE_TEAM"
  },

  // ===================================================
  // ROURKELA / SUNDARGARH LOCAL HOSPITALS & AMBULANCES
  // ===================================================
  {
    id: "HOSP-AMB-RK-01",
    name: "Rourkela Government Hospital (RGH) Ambulance #12",
    hospitalName: "Rourkela Government Hospital (RGH)",
    stationType: "Government Hospital",
    type: "AMBULANCE",
    category: "AMBULANCE",
    status: "AVAILABLE",
    capacity: 4,
    currentLoad: 0,
    district: "Sundargarh",
    capabilities: ["Medical ICU", "Paramedic", "First Aid", "Trauma Unit"],
    location: {
      name: "Rourkela Govt Hospital Trauma Centre, Panposh Road",
      lat: 22.2510,
      lng: 84.9020
    },
    etaMinutes: 3,
    distanceKm: 1.2,
    contactPerson: "Dr. S. K. Barik (Chief Medical Officer)",
    phone: "+91 94376 10812",
    vehicleType: "AMBULANCE"
  },
  {
    id: "HOSP-AMB-RK-02",
    name: "Ispat General Hospital (IGH) Emergency Ambulance, Rourkela",
    hospitalName: "Ispat General Hospital (IGH), Sector 19",
    stationType: "Public Sector Hospital",
    type: "AMBULANCE",
    category: "AMBULANCE",
    status: "AVAILABLE",
    capacity: 4,
    currentLoad: 0,
    district: "Sundargarh",
    capabilities: ["Medical ICU", "Paramedic", "Advanced Cardiac Life Support", "Burns Unit"],
    location: {
      name: "IGH Emergency Ambulance Dock, Sector 19, Rourkela",
      lat: 22.2610,
      lng: 84.8750
    },
    etaMinutes: 5,
    distanceKm: 1.8,
    contactPerson: "Dr. P. K. Rath (Head of Emergency)",
    phone: "+91 94376 10813",
    vehicleType: "AMBULANCE"
  },
  {
    id: "HOSP-AMB-RK-03",
    name: "CWS Hospital Ambulance Unit, Sector 5, Rourkela",
    hospitalName: "CWS Hospital, Rourkela",
    stationType: "Specialized Hospital",
    type: "AMBULANCE",
    category: "AMBULANCE",
    status: "AVAILABLE",
    capacity: 4,
    currentLoad: 0,
    district: "Sundargarh",
    capabilities: ["Medical ICU", "Paramedic", "First Aid"],
    location: {
      name: "CWS Hospital Emergency Dock, Sector 5, Rourkela",
      lat: 22.2430,
      lng: 84.8890
    },
    etaMinutes: 4,
    distanceKm: 1.4,
    contactPerson: "Dr. Ananya Mishra (EMO)",
    phone: "+91 94376 10814",
    vehicleType: "AMBULANCE"
  },

  // ===================================================
  // HOSPITALS — Real Odisha Government & Teaching Hospitals (Bhubaneswar, Cuttack, Puri)
  // ===================================================
  {
    id: "HOSP-AMB-01",
    name: "Capital Hospital, Bhubaneswar (108 ALS Ambulance #14)",
    hospitalName: "Capital Hospital, Bhubaneswar",
    stationType: "Government Hospital",
    type: "AMBULANCE",
    category: "AMBULANCE",
    status: "AVAILABLE",
    capacity: 4,
    currentLoad: 0,
    district: "Khordha",
    capabilities: ["Medical ICU", "Paramedic", "First Aid", "Triage Unit"],
    location: {
      name: "Capital Hospital Emergency Bay, Unit-6, Bhubaneswar",
      lat: 20.2614,
      lng: 85.8244
    },
    etaMinutes: 5,
    distanceKm: 1.9,
    contactPerson: "Dr. Sandhyarani Tripathy (EMO)",
    phone: "+91 94370 10814",
    vehicleType: "AMBULANCE"
  },
  {
    id: "HOSP-AMB-02",
    name: "AIIMS Bhubaneswar Trauma Centre Ambulance",
    hospitalName: "AIIMS Bhubaneswar",
    stationType: "Central Government Hospital",
    type: "AMBULANCE",
    category: "AMBULANCE",
    status: "AVAILABLE",
    capacity: 4,
    currentLoad: 0,
    district: "Khordha",
    capabilities: ["Medical ICU", "Paramedic", "Advanced Trauma", "First Aid"],
    location: {
      name: "AIIMS Bhubaneswar Hospital Complex, Sijua, Patrapada",
      lat: 20.2312,
      lng: 85.7725
    },
    etaMinutes: 12,
    distanceKm: 7.2,
    contactPerson: "Dr. R. K. Mohanty (Emergency Head)",
    phone: "+91 94370 10815",
    vehicleType: "AMBULANCE"
  },
  {
    id: "HOSP-AMB-03",
    name: "SCB Medical College & Hospital Ambulance, Cuttack",
    hospitalName: "SCB Medical College & Hospital, Cuttack",
    stationType: "State Government Hospital",
    type: "AMBULANCE",
    category: "AMBULANCE",
    status: "AVAILABLE",
    capacity: 4,
    currentLoad: 0,
    district: "Cuttack",
    capabilities: ["Medical ICU", "Paramedic", "First Aid", "Burns Unit"],
    location: {
      name: "SCB Medical College & Hospital, Mangalabag, Cuttack",
      lat: 20.4780,
      lng: 85.8882
    },
    etaMinutes: 6,
    distanceKm: 2.1,
    contactPerson: "Dr. Tapas Mallick (Trauma Lead)",
    phone: "+91 94370 10822",
    vehicleType: "AMBULANCE"
  },
  {
    id: "HOSP-AMB-04",
    name: "Puri District Headquarters Hospital (DHH) Ambulance",
    hospitalName: "Puri District Headquarters Hospital (DHH)",
    stationType: "Government Hospital",
    type: "AMBULANCE",
    category: "AMBULANCE",
    status: "AVAILABLE",
    capacity: 4,
    currentLoad: 0,
    district: "Puri",
    capabilities: ["Medical ICU", "Paramedic", "First Aid"],
    location: {
      name: "Puri DHH Emergency Hospital Gate, Grand Road, Puri",
      lat: 19.8155,
      lng: 85.8278
    },
    etaMinutes: 4,
    distanceKm: 1.5,
    contactPerson: "Dr. Alok Pattnaik (CMO)",
    phone: "+91 94370 10808",
    vehicleType: "AMBULANCE"
  },

  // RELIEF SUPPLY FLEET
  {
    id: "SUPPLY-TRUCK-01",
    name: "OSDMA Logistics & Relief Supply Fleet #03",
    type: "SUPPLY_VEHICLE",
    category: "SUPPLY_VEHICLE",
    status: "AVAILABLE",
    capacity: 100,
    currentLoad: 0,
    district: "Khordha",
    capabilities: ["Evacuation Assistance", "Food Distribution", "Mobile Diesel Generator"],
    location: {
      name: "Mancheswar Industrial Estate Depot, Bhubaneswar",
      lat: 20.3150,
      lng: 85.8620
    },
    etaMinutes: 11,
    distanceKm: 3.8,
    contactPerson: "Logistics Officer Kailash Rout",
    phone: "+91 94370 33003",
    vehicleType: "RELIEF_VEHICLE"
  }
];



export const INITIAL_SHELTERS = [
  // ===================================================
  // ROURKELA / SUNDARGARH LOCAL GOVERNMENT SCHOOLS
  // ===================================================
  {
    id: "SCHOOL-ROURKELA-01",
    name: "Rourkela Sector 2 Government High School",
    schoolName: "Rourkela Sector 2 Government High School",
    location: {
      name: "Sector 2, Rourkela Township, Sundargarh",
      lat: 22.2530,
      lng: 84.8980
    },
    district: "Sundargarh",
    block: "Rourkela Municipal Corporation",
    capacity: 700,
    occupied: 120,
    available: 580,
    facilities: ["Drinking Water Tank (10,000L)", "Auditorium Hall", "Power Generator Backup", "Mid-Day Meal Kitchen", "Medical First Aid Post"],
    status: "OPEN",
    contactPerson: "Sri P. K. Mohanta (Headmaster)",
    phone: "+91 94376 11223",
    authorizedEmergencyContact: {
      name: "Sri P. K. Mohanta",
      role: "Headmaster / Shelter In-Charge",
      phone: "+91 94376 11223"
    },
    staff: [
      { id: "STF-RK-01", name: "Sri P. K. Mohanta", role: "Shelter Coordinator", authorizedContact: "+91 94376 11223", availability: "AVAILABLE", dutyStatus: "ACCEPTED" },
      { id: "STF-RK-02", name: "Smt. Jayashree Nayak", role: "Registration Desk", authorizedContact: "+91 94376 11224", availability: "AVAILABLE", dutyStatus: "ACCEPTED" }
    ],
    demographics: { men: 30, women: 45, children: 30, elderly: 15 }
  },
  {
    id: "SCHOOL-ROURKELA-02",
    name: "Sector 6 Government High School, Rourkela",
    schoolName: "Sector 6 Government High School, Rourkela",
    location: {
      name: "Sector 6 Central Campus, Rourkela",
      lat: 22.2460,
      lng: 84.8720
    },
    district: "Sundargarh",
    block: "Rourkela Municipal Corporation",
    capacity: 650,
    occupied: 90,
    available: 560,
    facilities: ["Clean Borewell Water", "Solar Inverter Power", "Separate Sanitation Blocks", "Community Kitchen"],
    status: "OPEN",
    contactPerson: "Smt. Minati Pradhan (Principal)",
    phone: "+91 94376 22331",
    authorizedEmergencyContact: {
      name: "Smt. Minati Pradhan",
      role: "Principal / Coordinator",
      phone: "+91 94376 22331"
    },
    staff: [
      { id: "STF-RK-11", name: "Smt. Minati Pradhan", role: "Shelter Coordinator", authorizedContact: "+91 94376 22331", availability: "AVAILABLE", dutyStatus: "ACCEPTED" }
    ],
    demographics: { men: 25, women: 35, children: 20, elderly: 10 }
  },
  {
    id: "SCHOOL-ROURKELA-03",
    name: "Uditnagar Government High School, Rourkela",
    schoolName: "Uditnagar Government High School, Rourkela",
    location: {
      name: "Uditnagar Main Road, Rourkela",
      lat: 22.2280,
      lng: 84.8510
    },
    district: "Sundargarh",
    block: "Rourkela Municipal Corporation",
    capacity: 600,
    occupied: 110,
    available: 490,
    facilities: ["RO Filtered Water", "High-capacity Kitchen", "Wheelchair Ramps", "Emergency Lighting"],
    status: "OPEN",
    contactPerson: "Sri Ramesh Chandra Sahoo (Headmaster)",
    phone: "+91 94376 33441",
    authorizedEmergencyContact: {
      name: "Sri Ramesh Chandra Sahoo",
      role: "Headmaster",
      phone: "+91 94376 33441"
    },
    staff: [
      { id: "STF-RK-21", name: "Sri Ramesh Chandra Sahoo", role: "Shelter Coordinator", authorizedContact: "+91 94376 33441", availability: "AVAILABLE", dutyStatus: "ACCEPTED" }
    ],
    demographics: { men: 30, women: 40, children: 25, elderly: 15 }
  },
  {
    id: "SCHOOL-ROURKELA-04",
    name: "Panposh Government High School Relief Centre",
    schoolName: "Panposh Government High School",
    location: {
      name: "Panposh Chowk Sector, Rourkela",
      lat: 22.2410,
      lng: 84.8350
    },
    district: "Sundargarh",
    block: "Rourkela Sadar",
    capacity: 550,
    occupied: 80,
    available: 470,
    facilities: ["Drinking Water RO", "Toilets", "Emergency Generator", "First Aid Room"],
    status: "OPEN",
    contactPerson: "Sri Dilip Kumar Ray (Headmaster)",
    phone: "+91 94376 44551",
    authorizedEmergencyContact: {
      name: "Sri Dilip Kumar Ray",
      role: "Headmaster",
      phone: "+91 94376 44551"
    },
    staff: [
      { id: "STF-RK-31", name: "Sri Dilip Kumar Ray", role: "Shelter Coordinator", authorizedContact: "+91 94376 44551", availability: "AVAILABLE", dutyStatus: "ACCEPTED" }
    ],
    demographics: { men: 20, women: 30, children: 20, elderly: 10 }
  },
  {
    id: "SCHOOL-ROURKELA-05",
    name: "Rourkela Municipal High School (Sector 19)",
    schoolName: "Rourkela Municipal High School (Sector 19)",
    location: {
      name: "Sector 19, Rourkela Steel Township",
      lat: 22.2620,
      lng: 84.9120
    },
    district: "Sundargarh",
    block: "Rourkela Municipal Corporation",
    capacity: 800,
    occupied: 150,
    available: 650,
    facilities: ["Large Dining Hall", "Pure Drinking Water", "Solar Backup", "Medical Clinic"],
    status: "OPEN",
    contactPerson: "Smt. Sabita Mohapatra (Principal)",
    phone: "+91 94376 55661",
    authorizedEmergencyContact: {
      name: "Smt. Sabita Mohapatra",
      role: "Principal In-Charge",
      phone: "+91 94376 55661"
    },
    staff: [
      { id: "STF-RK-41", name: "Smt. Sabita Mohapatra", role: "Shelter Coordinator", authorizedContact: "+91 94376 55661", availability: "AVAILABLE", dutyStatus: "ACCEPTED" }
    ],
    demographics: { men: 40, women: 55, children: 35, elderly: 20 }
  },

  // ===================================================
  // BHUBANESWAR / KHORDHA LOCAL GOVERNMENT SCHOOLS
  // ===================================================
  {
    id: "SCHOOL-SHELTER-01",
    name: "Capital High School (Unit-III), Bhubaneswar",
    schoolName: "Capital High School (Unit-III), Bhubaneswar",
    location: {
      name: "Unit 3, Kharavela Nagar, Bhubaneswar",
      lat: 20.2800,
      lng: 85.8450
    },
    district: "Khordha",
    block: "Bhubaneswar Urban",
    capacity: 650,
    occupied: 180,
    available: 470,
    facilities: ["Drinking Water RO Plant", "Separate Toilets", "Solar Rooftop & Generator", "Wheelchair Ramps", "Mid-Day Meal Kitchen"],
    status: "OPEN",
    contactPerson: "Smt. Manjushree Mohanty (Headmistress)",
    phone: "+91 94371 44331",
    authorizedEmergencyContact: {
      name: "Smt. Manjushree Mohanty",
      role: "Headmistress / Shelter Coordinator",
      phone: "+91 94371 44331"
    },
    staff: [
      { id: "STF-01", name: "Smt. Manjushree Mohanty", role: "Shelter Coordinator", authorizedContact: "+91 94371 44331", availability: "AVAILABLE", dutyStatus: "ACCEPTED" },
      { id: "STF-02", name: "Sri Ranjan Kumar Das", role: "Registration Desk", authorizedContact: "+91 94371 44332", availability: "AVAILABLE", dutyStatus: "ACCEPTED" }
    ],
    demographics: { men: 45, women: 65, children: 42, elderly: 28 }
  },
  {
    id: "SCHOOL-SHELTER-02",
    name: "Buxi Jagabandhu Bidyadhar (BJB) High School",
    schoolName: "Buxi Jagabandhu Bidyadhar (BJB) High School",
    location: {
      name: "BJB Nagar, Lewis Road, Bhubaneswar",
      lat: 20.2520,
      lng: 85.8380
    },
    district: "Khordha",
    block: "Bhubaneswar Urban",
    capacity: 800,
    occupied: 320,
    available: 480,
    facilities: ["Clean Water Borewell", "High-capacity Kitchen", "Electricity Backup"],
    status: "OPEN",
    contactPerson: "Dr. Bijay Kumar Rath (Principal)",
    phone: "+91 94372 55661",
    authorizedEmergencyContact: {
      name: "Dr. Bijay Kumar Rath",
      role: "Principal / Coordinator",
      phone: "+91 94372 55661"
    },
    staff: [
      { id: "STF-11", name: "Dr. Bijay Kumar Rath", role: "Shelter Coordinator", authorizedContact: "+91 94372 55661", availability: "AVAILABLE", dutyStatus: "ACCEPTED" }
    ],
    demographics: { men: 85, women: 110, children: 75, elderly: 50 }
  },
  {
    id: "SCHOOL-SHELTER-03",
    name: "Rasulgarh Government High School Relief Centre",
    schoolName: "Rasulgarh Government High School",
    location: {
      name: "Rasulgarh Industrial Area, Bhubaneswar",
      lat: 20.2980,
      lng: 85.8680
    },
    district: "Khordha",
    block: "Bhubaneswar Urban",
    capacity: 500,
    occupied: 410,
    available: 90,
    facilities: ["Drinking Water RO", "Toilets", "Emergency Inverter"],
    status: "NEAR_CAPACITY",
    contactPerson: "Sri Anup Kumar Tripathy (Headmaster)",
    phone: "+91 94373 66771",
    authorizedEmergencyContact: {
      name: "Sri Anup Kumar Tripathy",
      role: "Headmaster",
      phone: "+91 94373 66771"
    },
    staff: [
      { id: "STF-21", name: "Sri Anup Kumar Tripathy", role: "Shelter Coordinator", authorizedContact: "+91 94373 66771", availability: "AVAILABLE", dutyStatus: "ACCEPTED" }
    ],
    demographics: { men: 115, women: 140, children: 95, elderly: 60 }
  },
  {
    id: "SCHOOL-SHELTER-07",
    name: "Chandrasekharpur Government High School",
    schoolName: "Chandrasekharpur Government High School",
    location: {
      name: "CSPur Sector 1, North Bhubaneswar",
      lat: 20.3250,
      lng: 85.8210
    },
    district: "Khordha",
    block: "Bhubaneswar Urban",
    capacity: 700,
    occupied: 150,
    available: 550,
    facilities: ["Drinking Water RO", "Large Playground Evac Zone", "Generator Set"],
    status: "OPEN",
    contactPerson: "Sri Prasant Mohanty (Headmaster)",
    phone: "+91 94373 88991",
    authorizedEmergencyContact: {
      name: "Sri Prasant Mohanty",
      role: "Headmaster",
      phone: "+91 94373 88991"
    },
    staff: [
      { id: "STF-71", name: "Sri Prasant Mohanty", role: "Shelter Coordinator", authorizedContact: "+91 94373 88991", availability: "AVAILABLE", dutyStatus: "ACCEPTED" }
    ],
    demographics: { men: 40, women: 55, children: 35, elderly: 20 }
  },

  // ===================================================
  // CUTTACK & PURI LOCAL GOVERNMENT SCHOOLS
  // ===================================================
  {
    id: "SCHOOL-SHELTER-04",
    name: "Ravenshaw Collegiate School, Cuttack",
    schoolName: "Ravenshaw Collegiate School, Cuttack",
    location: {
      name: "Old Collectorate Road, Cuttack",
      lat: 20.4670,
      lng: 85.8720
    },
    district: "Cuttack",
    block: "Cuttack Municipal",
    capacity: 900,
    occupied: 210,
    available: 690,
    facilities: ["Large Dining Shed", "Pure Drinking Water", "Multiple Clean Restrooms"],
    status: "OPEN",
    contactPerson: "Sri Sudhakar Acharya (Principal)",
    phone: "+91 94374 77881",
    authorizedEmergencyContact: {
      name: "Sri Sudhakar Acharya",
      role: "Principal In-Charge",
      phone: "+91 94374 77881"
    },
    staff: [
      { id: "STF-31", name: "Sri Sudhakar Acharya", role: "Shelter Coordinator", authorizedContact: "+91 94374 77881", availability: "AVAILABLE", dutyStatus: "ACCEPTED" }
    ],
    demographics: { men: 55, women: 75, children: 50, elderly: 30 }
  },
  {
    id: "SCHOOL-SHELTER-05",
    name: "Puri Zilla School & Cyclone Relief Shelter",
    schoolName: "Puri Zilla School & Cyclone Relief Shelter",
    location: {
      name: "Grand Road / Kacheri Chowk, Puri",
      lat: 19.8110,
      lng: 85.8340
    },
    district: "Puri",
    block: "Puri Municipality",
    capacity: 1000,
    occupied: 0,
    available: 1000,
    facilities: ["Reinforced Multi-purpose Hall", "Overhead Water Tank 10,000L", "Solar Battery Banks"],
    status: "OPEN",
    contactPerson: "Smt. Pratima Devi (Headmistress)",
    phone: "+91 94375 88991",
    authorizedEmergencyContact: {
      name: "Smt. Pratima Devi",
      role: "Headmistress",
      phone: "+91 94375 88991"
    },
    staff: [
      { id: "STF-41", name: "Smt. Pratima Devi", role: "Shelter Coordinator", authorizedContact: "+91 94375 88991", availability: "AVAILABLE", dutyStatus: "ACCEPTED" }
    ],
    demographics: { men: 0, women: 0, children: 0, elderly: 0 }
  }
];


export const INITIAL_SUPPLY_CENTERS = [
  {
    id: "SUPPLY-ODISHA-01",
    name: "OSDMA Central Disaster Logistics Hub (Mancheswar)",
    location: { name: "Mancheswar Industrial Area, Bhubaneswar", lat: 20.3180, lng: 85.8610 },
    district: "Khordha",
    inventory: {
      foodRations: 35000,
      drinkingWaterLiters: 95000,
      medicalKits: 3200,
      blankets: 14000,
      lifeJackets: 2500,
      tarpaulins: 8000
    },
    status: "OPERATIONAL"
  },
  {
    id: "SUPPLY-ODISHA-02",
    name: "Cuttack Civil Supplies & Relief Warehouse (Mahanadi Vihar)",
    location: { name: "Mahanadi Vihar Logistics Sector, Cuttack", lat: 20.4590, lng: 85.9120 },
    district: "Cuttack",
    inventory: {
      foodRations: 22000,
      drinkingWaterLiters: 60000,
      medicalKits: 1800,
      blankets: 8500,
      lifeJackets: 1200,
      tarpaulins: 4500
    },
    status: "OPERATIONAL"
  },
  {
    id: "SUPPLY-ODISHA-03",
    name: "Puri District Disaster Pre-positioning Hub",
    location: { name: "Talabania Sports & Emergency Complex, Puri", lat: 19.8220, lng: 85.8480 },
    district: "Puri",
    inventory: {
      foodRations: 18000,
      drinkingWaterLiters: 45000,
      medicalKits: 1400,
      blankets: 6000,
      lifeJackets: 1800,
      tarpaulins: 3800
    },
    status: "OPERATIONAL"
  }
];

export const INITIAL_ALERTS = [
  {
    id: "ALERT-OD-901",
    title: "SEVERE CYCLONIC DEPRESSION — RED WARNING FOR ODISHA COAST",
    source: "IMD (India Meteorological Department) & OSDMA",
    severity: "EXTREME",
    affectedRegion: "Puri, Jagatsinghpur, Kendrapara, Khordha, Cuttack & Balasore",
    issuedAt: "06:30 AM Today",
    validUntil: "11:59 PM Tomorrow",
    details: "Deep depression over Bay of Bengal intensified into severe cyclonic storm moving NW at 18 km/h. Gale winds gusting to 110-120 km/h with heavy to extremely heavy rainfall (>250mm). Evacuation protocol activated for low-lying blocks.",
    coordinates: [
      [20.3500, 85.7000],
      [20.5500, 85.9500],
      [20.3000, 86.4000],
      [19.7500, 85.9500],
      [19.9000, 85.6500]
    ]
  },
  {
    id: "ALERT-OD-902",
    title: "DAYA & KUSHABHADRA RIVER FLASH FLOOD SPILL ALERT",
    source: "Odisha Water Resources Department (CE Basin Management)",
    severity: "SEVERE",
    affectedRegion: "Bhubaneswar Southern Margins, Pipili, Balianta & Nimapada",
    issuedAt: "09:15 AM Today",
    validUntil: "08:00 PM Today",
    details: "Mahanadi Naraj barrage discharge exceeded 7.5 lakh cusecs. Daya and Kushabhadra distributaries overflowing banks. Lowland roads closed. Pre-position rescue boats immediately.",
    coordinates: [
      [20.3100, 85.8300],
      [20.3000, 85.8900],
      [20.1500, 85.9200],
      [20.0800, 85.8200],
      [20.2200, 85.8000]
    ]
  }
];

export const SMS_IVR_REPORTS = [
  {
    id: "SMS-OD-401",
    channel: "SMS",
    phone: "+91 94370 88221",
    rawText: "FLOOD 8 CRITICAL Rasulgarh canal bank. Water entered 1st floor. 3 children 2 old people trapped.",
    timestamp: "2 mins ago",
    parsed: {
      type: "FLOOD",
      peopleAffected: 8,
      peopleTrapped: 5,
      severity: "CRITICAL",
      locationName: "Rasulgarh Canal Bank Road, Bhubaneswar"
    }
  }
];

export const ODISHA_ROAD_HAZARDS = [
  {
    id: "HAZ-01",
    name: "Daya River Embankment Spillway Waterlogging",
    type: "FLOOD_ROAD",
    severity: "CRITICAL",
    riskWeight: 10,
    radiusMeters: 350,
    location: {
      lat: 20.2820,
      lng: 85.8610,
      name: "Rasulgarh - Daya Canal Bypass Road"
    },
    description: "4.5ft standing water across 600m road section. Impassable for light vehicles, accessible only with heavy ODRAF machinery or boat.",
    passableForVehicles: ["RESCUE_TEAM"]
  },
  {
    id: "HAZ-02",
    name: "NH-16 Khandagiri Underpass Structural Inundation",
    type: "BLOCKED_ROAD",
    severity: "CRITICAL",
    riskWeight: Infinity,
    radiusMeters: 300,
    location: {
      lat: 20.2570,
      lng: 85.7860,
      name: "NH-16 Khandagiri Subway"
    },
    description: "5ft water submerging underpass; stranded vehicles blocking both lanes. ROAD COMPLETELY CLOSED.",
    passableForVehicles: []
  },
  {
    id: "HAZ-03",
    name: "Barunei Foothill Rockfall & Mudslide Obstruction",
    type: "LANDSLIDE_ROAD",
    severity: "HIGH",
    riskWeight: 10,
    radiusMeters: 400,
    location: {
      lat: 20.1820,
      lng: 85.6850,
      name: "Barunei Temple Access Corridor"
    },
    description: "Boulders and heavy mud deposit blocking road. Earthmover required for clearance.",
    passableForVehicles: ["RESCUE_TEAM"]
  }
];

export const HAZARD_ZONE_POLYGON = [
  [20.3300, 85.8200],
  [20.3400, 85.8800],
  [20.2700, 85.8950],
  [20.2300, 85.8600],
  [20.2200, 85.8100],
  [20.2600, 85.7800],
  [20.3000, 85.8000]
];
