// Centralized Authoritative Odisha Disaster Management Dataset
// Coordinates and administrative data centered on Odisha (Khordha, Cuttack, Puri, Sundargarh, Sambalpur, Berhampur)

export const ODISHA_INCIDENTS = [
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
  }
];

export const ODISHA_RESCUE_RESOURCES = [
  // FIRE STATIONS (RESCUE TEAMS ACROSS DIFFERENT ODISHA AREAS)
  {
    id: "FIRE-STATION-01",
    name: "Kalpana Fire & Emergency Services Station (Bhubaneswar)",
    type: "FIRE_STATION",
    category: "RESCUE_TEAM",
    status: "AVAILABLE",
    capacity: 15,
    district: "Khordha",
    location: {
      name: "Kalpana Square Fire Station, Bhubaneswar",
      lat: 20.2580,
      lng: 85.8420
    },
    equipment: ["Water Tender (4500L)", "Hydraulic Rescue Tool Set", "Smoke Exhausters", "Emergency Ambulance"],
    capabilities: ["First Aid", "Search & Rescue", "Chainsaw Clearance", "Medical ICU", "Paramedic"],
    authorizedContact: {
      name: "Station Officer B. N. Mishra",
      phone: "+91 94370 10101",
      designation: "Station Fire Officer"
    },
    vehicleType: "RESCUE_TEAM"
  },
  {
    id: "FIRE-STATION-03",
    name: "Chandrasekharpur Fire Station & Rescue Depot",
    type: "FIRE_STATION",
    category: "RESCUE_TEAM",
    status: "AVAILABLE",
    capacity: 18,
    district: "Khordha",
    location: {
      name: "CSPur Fire Station, North Bhubaneswar",
      lat: 20.3290,
      lng: 85.8180
    },
    equipment: ["Multi-Purpose Foam Tender", "Tree Cutters", "Submersible Dewatering Pumps"],
    capabilities: ["Flood Rescue", "Building Collapse", "Chainsaw Clearance"],
    authorizedContact: {
      name: "Leading Fireman K. K. Sutar",
      phone: "+91 94370 10103",
      designation: "Officer-In-Charge"
    },
    vehicleType: "RESCUE_TEAM"
  },
  {
    id: "FIRE-STATION-05",
    name: "Bidanasi Fire Station (Cuttack)",
    type: "FIRE_STATION",
    category: "RESCUE_TEAM",
    status: "AVAILABLE",
    capacity: 16,
    district: "Cuttack",
    location: {
      name: "Bidanasi Fire Depot, Ring Road, Cuttack",
      lat: 20.4700,
      lng: 85.8420
    },
    equipment: ["Flood Rescue Gear", "Dewatering High-Head Pumps", "Inflatable Boats"],
    capabilities: ["Flood Rescue", "Building Collapse", "Dewatering Pumps"],
    authorizedContact: {
      name: "Station Officer T. K. Sahoo",
      phone: "+91 94370 10105",
      designation: "Station Fire Officer"
    },
    vehicleType: "RESCUE_TEAM"
  },
  {
    id: "FIRE-STATION-07",
    name: "Puri Beach Fire & Marine Rescue Station",
    type: "FIRE_STATION",
    category: "RESCUE_TEAM",
    status: "AVAILABLE",
    capacity: 20,
    district: "Puri",
    location: {
      name: "Sea Beach Road Fire Station, Puri",
      lat: 19.8050,
      lng: 85.8220
    },
    equipment: ["Deep Water Inflatable Boats", "Life Jackets", "Coastal Rescue Gear"],
    capabilities: ["Flood Rescue", "Boat", "Coastal Rescue", "First Aid"],
    authorizedContact: {
      name: "Fire Commander P. C. Sen",
      phone: "+91 94370 10107",
      designation: "Fire Station Commander"
    },
    vehicleType: "RESCUE_TEAM"
  },
  // ===================================================
  // ROURKELA / SUNDARGARH LOCAL FIRE STATIONS & HOSPITALS
  // ===================================================
  {
    id: "FIRE-STATION-RK-01",
    name: "Panposh Fire Station, Rourkela",
    type: "FIRE_STATION",
    category: "RESCUE_TEAM",
    status: "AVAILABLE",
    capacity: 20,
    district: "Sundargarh",
    location: {
      name: "Panposh Road Fire Station, Rourkela",
      lat: 22.2450,
      lng: 84.8820
    },
    equipment: ["Flood Rescue Gear", "High-capacity Dewatering Pumps", "Heavy Extrication Cutter"],
    capabilities: ["Flood Rescue", "Search & Rescue", "Dewatering Pump", "Chainsaw Clearance"],
    authorizedContact: {
      name: "Station Officer M. R. Swamy",
      phone: "+91 94376 10101",
      designation: "Station Fire Officer"
    },
    vehicleType: "RESCUE_TEAM"
  },
  {
    id: "FIRE-STATION-RK-02",
    name: "Rourkela Town Fire Station, Uditnagar",
    type: "FIRE_STATION",
    category: "RESCUE_TEAM",
    status: "AVAILABLE",
    capacity: 18,
    district: "Sundargarh",
    location: {
      name: "Uditnagar Main Fire Station, Rourkela",
      lat: 22.2310,
      lng: 84.8560
    },
    equipment: ["Water Tender", "Industrial Rescue Gear", "Hydraulic Cutters"],
    capabilities: ["Industrial Rescue", "Building Collapse", "First Aid", "Heavy Cutters"],
    authorizedContact: {
      name: "Station Officer K. C. Pradhan",
      phone: "+91 94376 10102",
      designation: "Station Fire Lead"
    },
    vehicleType: "RESCUE_TEAM"
  },
  {
    id: "FIRE-STATION-RK-03",
    name: "Bisra Road Fire Station, Sector 19, Rourkela",
    type: "FIRE_STATION",
    category: "RESCUE_TEAM",
    status: "AVAILABLE",
    capacity: 16,
    district: "Sundargarh",
    location: {
      name: "Bisra Road Fire Station, Sector 19, Rourkela",
      lat: 22.2590,
      lng: 84.9080
    },
    equipment: ["Emergency First Response Vehicle", "Tree Cutters"],
    capabilities: ["Flood Rescue", "Search & Rescue", "First Aid"],
    authorizedContact: {
      name: "Station Officer A. K. Behera",
      phone: "+91 94376 10103",
      designation: "Station Officer"
    },
    vehicleType: "RESCUE_TEAM"
  },
  {
    id: "HOSP-AMB-RK-01",
    name: "Rourkela Government Hospital (RGH) Ambulance #12",
    type: "AMBULANCE",
    category: "AMBULANCE",
    status: "AVAILABLE",
    capacity: 4,
    district: "Sundargarh",
    location: {
      name: "Rourkela Govt Hospital Trauma Centre, Panposh Road",
      lat: 22.2510,
      lng: 84.9020
    },
    equipment: ["ALS Resuscitation Kit", "Oxygen Tank", "Defibrillator"],
    capabilities: ["Medical ICU", "Paramedic", "First Aid", "Trauma Unit"],
    authorizedContact: {
      name: "Dr. S. K. Barik",
      phone: "+91 94376 10812",
      designation: "Chief Medical Officer"
    },
    vehicleType: "AMBULANCE"
  },
  {
    id: "HOSP-AMB-RK-02",
    name: "Ispat General Hospital (IGH) Emergency Ambulance, Rourkela",
    type: "AMBULANCE",
    category: "AMBULANCE",
    status: "AVAILABLE",
    capacity: 4,
    district: "Sundargarh",
    location: {
      name: "IGH Emergency Ambulance Dock, Sector 19, Rourkela",
      lat: 22.2610,
      lng: 84.8750
    },
    equipment: ["ALS Life Support Unit", "Cardiac Monitor"],
    capabilities: ["Medical ICU", "Paramedic", "Advanced Cardiac Life Support", "Burns Unit"],
    authorizedContact: {
      name: "Dr. P. K. Rath",
      phone: "+91 94376 10813",
      designation: "Head of Emergency"
    },
    vehicleType: "AMBULANCE"
  },
  {
    id: "HOSP-AMB-RK-03",
    name: "CWS Hospital Ambulance Unit, Sector 5, Rourkela",
    type: "AMBULANCE",
    category: "AMBULANCE",
    status: "AVAILABLE",
    capacity: 4,
    district: "Sundargarh",
    location: {
      name: "CWS Hospital Emergency Dock, Sector 5, Rourkela",
      lat: 22.2430,
      lng: 84.8890
    },
    equipment: ["Basic Life Support Kit", "Oxygen Cylinder"],
    capabilities: ["Medical ICU", "Paramedic", "First Aid"],
    authorizedContact: {
      name: "Dr. Ananya Mishra",
      phone: "+91 94376 10814",
      designation: "Emergency Medical Officer"
    },
    vehicleType: "AMBULANCE"
  },

  // ===================================================
  // BHUBANESWAR, CUTTACK & PURI HOSPITALS
  // ===================================================
  {
    id: "HOSP-AMB-01",
    name: "Capital Hospital 108 Mobile ICU #14 (Bhubaneswar)",
    type: "AMBULANCE",
    category: "AMBULANCE",
    status: "AVAILABLE",
    capacity: 4,
    district: "Khordha",
    location: {
      name: "Capital Hospital Emergency Dispatch, Unit 6, Bhubaneswar",
      lat: 20.2614,
      lng: 85.8244
    },
    equipment: ["Transport Ventilator", "Defibrillator", "Oxygen Cylinders"],
    capabilities: ["Medical ICU", "Paramedic", "First Aid"],
    authorizedContact: {
      name: "Dr. Sandhyarani Tripathy",
      phone: "+91 94370 10814",
      designation: "Emergency Medical Officer"
    },
    vehicleType: "AMBULANCE"
  },
  {
    id: "HOSP-AMB-02",
    name: "AIIMS Bhubaneswar Trauma Centre Ambulance",
    type: "AMBULANCE",
    category: "AMBULANCE",
    status: "AVAILABLE",
    capacity: 4,
    district: "Khordha",
    location: {
      name: "AIIMS Bhubaneswar Hospital Complex, Sijua, Patrapada",
      lat: 20.2312,
      lng: 85.7725
    },
    equipment: ["Advanced Trauma Kit", "Transport Ventilator"],
    capabilities: ["Medical ICU", "Paramedic", "Advanced Trauma", "First Aid"],
    authorizedContact: {
      name: "Dr. R. K. Mohanty",
      phone: "+91 94370 10815",
      designation: "Emergency Head"
    },
    vehicleType: "AMBULANCE"
  },
  {
    id: "HOSP-AMB-03",
    name: "SCB Medical College Trauma ICU Ambulance #22 (Cuttack)",
    type: "AMBULANCE",
    category: "AMBULANCE",
    status: "AVAILABLE",
    capacity: 4,
    district: "Cuttack",
    location: {
      name: "SCB Medical College & Hospital Trauma Hub, Cuttack",
      lat: 20.4780,
      lng: 85.8882
    },
    equipment: ["ALS Life Support", "Spine Board", "Splints"],
    capabilities: ["Medical ICU", "Paramedic", "First Aid"],
    authorizedContact: {
      name: "Dr. Tapas Mallick",
      phone: "+91 94370 10822",
      designation: "Paramedic Lead"
    },
    vehicleType: "AMBULANCE"
  },
  {
    id: "HOSP-AMB-04",
    name: "Puri District Hospital Ambulance Unit #08",
    type: "AMBULANCE",
    category: "AMBULANCE",
    status: "AVAILABLE",
    capacity: 4,
    district: "Puri",
    location: {
      name: "Puri DHH Emergency Hospital Gate, Grand Road, Puri",
      lat: 19.8155,
      lng: 85.8278
    },
    equipment: ["ALS Medical Kit", "Oxygen Unit"],
    capabilities: ["Medical ICU", "Paramedic", "First Aid"],
    authorizedContact: {
      name: "Dr. Alok Pattnaik",
      phone: "+91 94370 10808",
      designation: "Chief Medical Officer"
    },
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
    district: "Khordha",
    location: {
      name: "Mancheswar Industrial Estate Depot",
      lat: 20.3150,
      lng: 85.8620
    },
    equipment: ["Dry Food Packets", "Water Pouches", "Blankets"],
    capabilities: ["Evacuation Assistance", "Food Distribution"],
    authorizedContact: {
      name: "Logistics Officer Kailash Rout",
      phone: "+91 94370 33003",
      designation: "OSDMA Depot Manager"
    },
    vehicleType: "RELIEF_VEHICLE"
  }
];

export const ODISHA_GOVERNMENT_SCHOOLS = [
  // Rourkela / Sundargarh Schools
  {
    id: "SCHOOL-ROURKELA-01",
    schoolName: "Rourkela Sector 2 Government High School",
    type: "GOVERNMENT_HIGH_SCHOOL",
    district: "Sundargarh",
    block: "Rourkela Municipal Corporation",
    location: {
      name: "Sector 2, Rourkela Township, Sundargarh",
      lat: 22.2530,
      lng: 84.8980
    },
    capacity: 700,
    occupied: 120,
    available: 580,
    facilities: ["Drinking Water Tank (10,000L)", "Auditorium Hall", "Power Generator Backup", "Mid-Day Meal Kitchen", "Medical First Aid Post"],
    status: "OPEN",
    authorizedEmergencyContact: {
      name: "Sri P. K. Mohanta",
      role: "Headmaster / Shelter In-Charge",
      phone: "+91 94376 11223"
    },
    staff: [
      { id: "STF-RK-01", name: "Sri P. K. Mohanta", role: "Shelter Coordinator", authorizedContact: "+91 94376 11223", availability: "AVAILABLE", dutyStatus: "ACCEPTED" }
    ],
    demographics: { men: 30, women: 45, children: 30, elderly: 15 }
  },
  {
    id: "SCHOOL-ROURKELA-02",
    schoolName: "Sector 6 Government High School, Rourkela",
    type: "GOVERNMENT_HIGH_SCHOOL",
    district: "Sundargarh",
    block: "Rourkela Municipal Corporation",
    location: {
      name: "Sector 6 Central Campus, Rourkela",
      lat: 22.2460,
      lng: 84.8720
    },
    capacity: 650,
    occupied: 90,
    available: 560,
    facilities: ["Clean Borewell Water", "Solar Inverter Power", "Separate Sanitation Blocks"],
    status: "OPEN",
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
    schoolName: "Uditnagar Government High School, Rourkela",
    type: "GOVERNMENT_HIGH_SCHOOL",
    district: "Sundargarh",
    block: "Rourkela Municipal Corporation",
    location: {
      name: "Uditnagar Main Road, Rourkela",
      lat: 22.2280,
      lng: 84.8510
    },
    capacity: 600,
    occupied: 110,
    available: 490,
    facilities: ["RO Filtered Water", "High-capacity Kitchen", "Wheelchair Ramps"],
    status: "OPEN",
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
    schoolName: "Panposh Government High School Relief Centre",
    type: "GOVERNMENT_HIGH_SCHOOL",
    district: "Sundargarh",
    block: "Rourkela Sadar",
    location: {
      name: "Panposh Chowk Sector, Rourkela",
      lat: 22.2410,
      lng: 84.8350
    },
    capacity: 550,
    occupied: 80,
    available: 470,
    facilities: ["Drinking Water RO", "Toilets", "Emergency Generator"],
    status: "OPEN",
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
    schoolName: "Rourkela Municipal High School (Sector 19)",
    type: "GOVERNMENT_HIGH_SCHOOL",
    district: "Sundargarh",
    block: "Rourkela Municipal Corporation",
    location: {
      name: "Sector 19, Rourkela Steel Township",
      lat: 22.2620,
      lng: 84.9120
    },
    capacity: 800,
    occupied: 150,
    available: 650,
    facilities: ["Large Dining Hall", "Pure Drinking Water", "Solar Backup"],
    status: "OPEN",
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

  // Bhubaneswar / Khordha Schools
  {
    id: "SCHOOL-SHELTER-01",
    schoolName: "Capital High School (Unit-III), Bhubaneswar",
    type: "GOVERNMENT_HIGH_SCHOOL",
    district: "Khordha",
    block: "Bhubaneswar Urban",
    location: {
      name: "Unit 3, Kharavela Nagar, Bhubaneswar",
      lat: 20.2800,
      lng: 85.8450
    },
    capacity: 650,
    occupied: 180,
    available: 470,
    facilities: ["Drinking Water RO Plant", "Separate Toilets", "Solar Rooftop & Generator", "Wheelchair Ramps"],
    status: "ACTIVE",
    authorizedEmergencyContact: {
      name: "Smt. Manjushree Mohanty",
      role: "Headmistress / Shelter In-Charge",
      phone: "+91 94371 44331"
    },
    staff: [
      { id: "STF-01", name: "Smt. Manjushree Mohanty", role: "Shelter Coordinator", authorizedContact: "+91 94371 44331", availability: "AVAILABLE", dutyStatus: "ACCEPTED" }
    ],
    demographics: { men: 45, women: 65, children: 42, elderly: 28 }
  },
  {
    id: "SCHOOL-SHELTER-02",
    schoolName: "Buxi Jagabandhu Bidyadhar (BJB) High School",
    type: "GOVERNMENT_HIGH_SCHOOL",
    district: "Khordha",
    block: "Bhubaneswar Urban",
    location: {
      name: "BJB Nagar, Lewis Road, Bhubaneswar",
      lat: 20.2520,
      lng: 85.8380
    },
    capacity: 800,
    occupied: 320,
    available: 480,
    facilities: ["Clean Water Borewell", "High-capacity Kitchen"],
    status: "ACTIVE",
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
    id: "SCHOOL-SHELTER-04",
    schoolName: "Ravenshaw Collegiate School, Cuttack",
    type: "GOVERNMENT_HIGH_SCHOOL",
    district: "Cuttack",
    block: "Cuttack Municipal",
    location: {
      name: "Old Collectorate Road, Cuttack",
      lat: 20.4670,
      lng: 85.8720
    },
    capacity: 900,
    occupied: 210,
    available: 690,
    facilities: ["Large Dining Shed", "Pure Drinking Water"],
    status: "OPEN",
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
    schoolName: "Puri Zilla School & Cyclone Relief Shelter",
    type: "GOVERNMENT_HIGH_SCHOOL",
    district: "Puri",
    block: "Puri Municipality",
    location: {
      name: "Grand Road / Kacheri Chowk, Puri",
      lat: 19.8110,
      lng: 85.8340
    },
    capacity: 1000,
    occupied: 0,
    available: 1000,
    facilities: ["Reinforced Multi-purpose Hall", "Overhead Water Tank 10,000L"],
    status: "STANDBY",
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

export const ODISHA_SUPPLY_CENTERS = [
  {
    id: "SUPPLY-ODISHA-01",
    name: "OSDMA Central Disaster Logistics Hub (Mancheswar)",
    location: { name: "Mancheswar Industrial Area, Bhubaneswar", lat: 20.3180, lng: 85.8610 },
    district: "Khordha",
    inventory: {
      foodRations: 35000,
      drinkingWaterLiters: 95000,
      medicalKits: 3200,
      blankets: 14000
    },
    status: "OPERATIONAL"
  }
];

export const ODISHA_ALERTS = [
  {
    id: "ALERT-OD-901",
    title: "CYCLONIC STORM 'DANA' — RED WARNING FOR ODISHA COAST",
    source: "IMD & OSDMA",
    severity: "EXTREME",
    affectedRegion: "Puri, Jagatsinghpur, Kendrapara, Khordha, Cuttack & Balasore",
    issuedAt: "06:30 AM Today",
    validUntil: "11:59 PM Tomorrow",
    details: "Severe Cyclonic Storm over Bay of Bengal moving NW at 18 km/h.",
    coordinates: [
      [20.3500, 85.7000],
      [20.5500, 85.9500],
      [20.3000, 86.4000],
      [19.7500, 85.9500]
    ]
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
    location: { lat: 20.2820, lng: 85.8610, name: "Rasulgarh - Daya Canal Bypass Road" },
    description: "4.5ft standing water across 600m road section.",
    passableForVehicles: ["RESCUE_TEAM"]
  }
];

export const ODISHA_HAZARD_ZONE_POLYGON = [
  [20.3300, 85.8200],
  [20.3400, 85.8800],
  [20.2700, 85.8950],
  [20.2300, 85.8600],
  [20.2200, 85.8100]
];

export const ODISHA_SMS_IVR_REPORTS = [
  {
    id: "SMS-OD-401",
    channel: "SMS",
    phone: "+91 94370 88221",
    rawText: "FLOOD 8 CRITICAL Rasulgarh canal bank. Water entered 1st floor.",
    timestamp: "2 mins ago",
    parsed: {
      type: "FLOOD",
      peopleAffected: 8,
      peopleTrapped: 5,
      severity: "CRITICAL",
      locationName: "Rasulgarh Canal Bank Road"
    }
  }
];
