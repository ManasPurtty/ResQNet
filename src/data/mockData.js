// Comprehensive Mock Data for ResQNet Disaster Response Platform

export const INITIAL_INCIDENTS = [
  {
    id: "INC-1024",
    title: "Severe Urban Flooding & People Trapped on Roofs",
    type: "FLOOD",
    severity: "CRITICAL",
    priorityScore: 94,
    confidenceScore: 91,
    location: {
      name: "Saidapet Riverbank Area, Zone 10",
      lat: 13.0213,
      lng: 80.2231,
      address: "14 West Canal Bank Road, Saidapet"
    },
    peopleAffected: 17,
    peopleTrapped: 8,
    vulnerablePeople: 2,
    waitingTimeMinutes: 18,
    reportCount: 17,
    status: "UNASSIGNED", // UNASSIGNED, RESOURCE_ASSIGNED, RESCUE_IN_PROGRESS, RESOLVED
    assignedResourceId: null,
    assignedShelterId: null,
    description: "Water level rose 5 feet in 20 minutes due to Adyar river overflow. Eight residents including two elderly individuals are trapped on the 1st floor roof balcony with fast flowing water below.",
    image: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
    reportedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    reporter: { name: "Anand Kumar", phone: "+91 98765 43210" }
  },
  {
    id: "INC-1027",
    title: "Structural Wall Collapse & Debris Entrapment",
    type: "BUILDING_DAMAGE",
    severity: "CRITICAL",
    priorityScore: 87,
    confidenceScore: 88,
    location: {
      name: "Velachery Main Market Zone",
      lat: 12.9790,
      lng: 80.2180,
      address: "78 Bypass Road, Velachery"
    },
    peopleAffected: 14,
    peopleTrapped: 5,
    vulnerablePeople: 1,
    waitingTimeMinutes: 25,
    reportCount: 12,
    status: "UNASSIGNED",
    assignedResourceId: null,
    assignedShelterId: null,
    description: "Two-story commercial building rear wall collapsed under heavy rain. 5 shopkeepers trapped under lightweight masonry debris.",
    image: "https://images.unsplash.com/photo-1590055531615-f16d36ffe8ec?auto=format&fit=crop&w=800&q=80",
    reportedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    reporter: { name: "Suresh Raina", phone: "+91 98401 12345" }
  },
  {
    id: "INC-1030",
    title: "Submerged Hospital Generator & ICU Power Failure",
    type: "MEDICAL",
    severity: "CRITICAL",
    priorityScore: 92,
    confidenceScore: 96,
    location: {
      name: "Guindy Industrial Belt Medical Hub",
      lat: 13.0100,
      lng: 80.2120,
      address: "Plot 42, SIDCO Estate, Guindy"
    },
    peopleAffected: 28,
    peopleTrapped: 12,
    vulnerablePeople: 12,
    waitingTimeMinutes: 10,
    reportCount: 22,
    status: "UNASSIGNED",
    assignedResourceId: null,
    assignedShelterId: null,
    description: "Basement emergency generator submerged in 4ft flood water. Critical ICU patients require immediate mobile power backup and medical evacuation squad.",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",
    reportedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    reporter: { name: "Dr. Lakshmi Prasad", phone: "+91 94440 99887" }
  },
  {
    id: "INC-1021",
    title: "Underpass Inundation & Submerged Vehicles",
    type: "ROAD_BLOCKAGE",
    severity: "HIGH",
    priorityScore: 73,
    confidenceScore: 84,
    location: {
      name: "T. Nagar Railway Subway",
      lat: 13.0400,
      lng: 80.2330,
      address: "Usman Road Underpass, T. Nagar"
    },
    peopleAffected: 9,
    peopleTrapped: 3,
    vulnerablePeople: 0,
    waitingTimeMinutes: 32,
    reportCount: 8,
    status: "UNASSIGNED",
    assignedResourceId: null,
    assignedShelterId: null,
    description: "Subway flooded with 6ft water. Two cars submerged; passengers managed to climb onto car roofs waiting for tow and rescue.",
    image: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80",
    reportedAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    reporter: { name: "Karthik Raja", phone: "+91 97900 11223" }
  },
  {
    id: "INC-1018",
    title: "Landslide Slope Failure near Hillside Settlement",
    type: "LANDSLIDE",
    severity: "HIGH",
    priorityScore: 78,
    confidenceScore: 85,
    location: {
      name: "St. Thomas Mount Foothills",
      lat: 13.0020,
      lng: 80.1980,
      address: "Mount Ridge Colony, Guindy"
    },
    peopleAffected: 22,
    peopleTrapped: 4,
    vulnerablePeople: 3,
    waitingTimeMinutes: 45,
    reportCount: 14,
    status: "UNASSIGNED",
    assignedResourceId: null,
    assignedShelterId: null,
    description: "Mudslide washed out soil behind 4 informal dwellings. Access road cut off by boulders and fallen power lines.",
    image: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=800&q=80",
    reportedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    reporter: { name: "Murugan V", phone: "+91 98840 55667" }
  },
  {
    id: "INC-1015",
    title: "Transformer Fire & Live Electrical Wire Hazard",
    type: "FIRE",
    severity: "HIGH",
    priorityScore: 71,
    confidenceScore: 92,
    location: {
      name: "Anna Nagar Roundtana Zone",
      lat: 13.0850,
      lng: 80.2100,
      address: "2nd Avenue, Anna Nagar West"
    },
    peopleAffected: 35,
    peopleTrapped: 0,
    vulnerablePeople: 5,
    waitingTimeMinutes: 14,
    reportCount: 19,
    status: "UNASSIGNED",
    assignedResourceId: null,
    assignedShelterId: null,
    description: "High voltage transformer burst into flames following lightning strike. Sparks igniting nearby trees; power line lying in standing water.",
    image: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80",
    reportedAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    reporter: { name: "Priya Sundaram", phone: "+91 91760 33445" }
  },
  {
    id: "INC-1012",
    title: "Stranded Bus in Waterlogged Arterial Road",
    type: "FLOOD",
    severity: "HIGH",
    priorityScore: 68,
    confidenceScore: 89,
    location: {
      name: "Koyambedu Junction",
      lat: 13.0690,
      lng: 80.1940,
      address: "Inner Ring Road, Koyambedu"
    },
    peopleAffected: 42,
    peopleTrapped: 0,
    vulnerablePeople: 4,
    waitingTimeMinutes: 38,
    reportCount: 11,
    status: "UNASSIGNED",
    assignedResourceId: null,
    assignedShelterId: null,
    description: "Public transport bus engine stalled in 3.5ft water. Passengers safe inside but stranded with water slowly rising.",
    image: "https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=800&q=80",
    reportedAt: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
    reporter: { name: "Ramesh Babu", phone: "+91 98410 77889" }
  },
  {
    id: "INC-1009",
    title: "Roof Sheet Storm Blow-off & Wind Damage",
    type: "CYCLONE",
    severity: "MEDIUM",
    priorityScore: 56,
    confidenceScore: 82,
    location: {
      name: "Mylapore Heritage Precinct",
      lat: 13.0333,
      lng: 80.2667,
      address: "Kutchery Road, Mylapore"
    },
    peopleAffected: 15,
    peopleTrapped: 0,
    vulnerablePeople: 2,
    waitingTimeMinutes: 52,
    reportCount: 6,
    status: "UNASSIGNED",
    assignedResourceId: null,
    assignedShelterId: null,
    description: "Gale force winds blew off tin roofing sheets from three adjacent homes. Families taking shelter in nearby school porch.",
    image: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=800&q=80",
    reportedAt: new Date(Date.now() - 52 * 60 * 1000).toISOString(),
    reporter: { name: "Geetha S", phone: "+91 93810 44556" }
  },
  {
    id: "INC-1006",
    title: "Senior Citizen Residence Isolation",
    type: "FLOOD",
    severity: "MEDIUM",
    priorityScore: 54,
    confidenceScore: 85,
    location: {
      name: "Adyar Gandhi Nagar",
      lat: 13.0067,
      lng: 80.2572,
      address: "4th Main Road, Adyar"
    },
    peopleAffected: 3,
    peopleTrapped: 0,
    vulnerablePeople: 3,
    waitingTimeMinutes: 60,
    reportCount: 4,
    status: "UNASSIGNED",
    assignedResourceId: null,
    assignedShelterId: null,
    description: "Ground floor surrounded by 2ft water. Food and drinking water supplies depleted; residents need evacuation to shelter.",
    image: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
    reportedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    reporter: { name: "Venkatraman K", phone: "+91 94441 22334" }
  },
  {
    id: "INC-1004",
    title: "Fallen Banyan Tree Blocking Hospital Gate",
    type: "ROAD_BLOCKAGE",
    severity: "MEDIUM",
    priorityScore: 48,
    confidenceScore: 90,
    location: {
      name: "Royapettah General Area",
      lat: 13.0520,
      lng: 80.2610,
      address: "Westcott Road, Royapettah"
    },
    peopleAffected: 60,
    peopleTrapped: 0,
    vulnerablePeople: 0,
    waitingTimeMinutes: 70,
    reportCount: 9,
    status: "UNASSIGNED",
    assignedResourceId: null,
    assignedShelterId: null,
    description: "Large tree uprooted blocking secondary ambulance entrance. Requires chainsaw clearance crew.",
    image: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80",
    reportedAt: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
    reporter: { name: "Security Officer David", phone: "+91 98841 88990" }
  },
  {
    id: "INC-1002",
    title: "Drainage Backflow in Low-lying Street",
    type: "OTHER",
    severity: "LOW",
    priorityScore: 35,
    confidenceScore: 78,
    location: {
      name: "Kodambakkam Housing Board",
      lat: 13.0500,
      lng: 80.2200,
      address: "Station Road, Kodambakkam"
    },
    peopleAffected: 20,
    peopleTrapped: 0,
    vulnerablePeople: 1,
    waitingTimeMinutes: 90,
    reportCount: 3,
    status: "UNASSIGNED",
    assignedResourceId: null,
    assignedShelterId: null,
    description: "Sewage mixing with rain water on street. No immediate life safety threat; needs suction pump deployment.",
    image: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
    reportedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    reporter: { name: "Saroja M", phone: "+91 97100 66778" }
  },
  {
    id: "INC-1001",
    title: "Streetlight Pole Leaning Dangerously",
    type: "OTHER",
    severity: "LOW",
    priorityScore: 28,
    confidenceScore: 75,
    location: {
      name: "Ashok Nagar 11th Avenue",
      lat: 13.0360,
      lng: 80.2110,
      address: "11th Ave, Ashok Nagar"
    },
    peopleAffected: 5,
    peopleTrapped: 0,
    vulnerablePeople: 0,
    waitingTimeMinutes: 110,
    reportCount: 2,
    status: "UNASSIGNED",
    assignedResourceId: null,
    assignedShelterId: null,
    description: "Electric utility pole tilted 30 degrees following ground erosion. Electricity grid notified.",
    image: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80",
    reportedAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    reporter: { name: "Deepak S", phone: "+91 98402 33445" }
  }
];

export const INITIAL_RESOURCES = [
  {
    id: "TEAM-04",
    name: "NDRF Battalion Team #04",
    type: "RESCUE_TEAM", // RESCUE_TEAM, AMBULANCE, BOAT, MEDICAL, SUPPLY_VEHICLE
    status: "AVAILABLE", // AVAILABLE, ASSIGNED, BUSY, UNAVAILABLE
    capacity: 15,
    currentLoad: 0,
    capabilities: ["Flood Rescue", "Boat", "First Aid", "Diving Equipment", "Structural Search"],
    location: {
      name: "Saidapet Staging Station",
      lat: 13.0280,
      lng: 80.2290
    },
    etaMinutes: 7,
    distanceKm: 2.1,
    contactPerson: "Commander R. K. Singh",
    phone: "+91 94450 11004"
  },
  {
    id: "TEAM-03",
    name: "State Disaster Response Force #03",
    type: "RESCUE_TEAM",
    status: "AVAILABLE",
    capacity: 12,
    currentLoad: 0,
    capabilities: ["Flood Rescue", "Boat", "Medical First Responder"],
    location: {
      name: "Guindy Fire Station Base",
      lat: 13.0080,
      lng: 80.2050
    },
    etaMinutes: 11,
    distanceKm: 3.4,
    contactPerson: "Capt. Arvind Swamy",
    phone: "+91 94450 11003"
  },
  {
    id: "TEAM-08",
    name: "Coast Guard Marine Rescue Squad #08",
    type: "BOAT",
    status: "AVAILABLE",
    capacity: 20,
    currentLoad: 0,
    capabilities: ["Flood Rescue", "Motorized Inflatable Boats", "Deep Water Rescue", "Air Evac Signals"],
    location: {
      name: "Adyar Boat Club Dock",
      lat: 13.0180,
      lng: 80.2450
    },
    etaMinutes: 9,
    distanceKm: 2.8,
    contactPerson: "Lt. Cmdr. Vikram Sen",
    phone: "+91 94450 11008"
  },
  {
    id: "TEAM-02",
    name: "Fire & Rescue Services Heavy Extrication #02",
    type: "RESCUE_TEAM",
    status: "AVAILABLE",
    capacity: 10,
    currentLoad: 0,
    capabilities: ["Building Collapse", "Heavy Equipment", "Chainsaw Clearance", "Search & Rescue"],
    location: {
      name: "Kilpauk Fire Depot",
      lat: 13.0780,
      lng: 80.2410
    },
    etaMinutes: 16,
    distanceKm: 6.2,
    contactPerson: "Officer Joseph M.",
    phone: "+91 94450 11002"
  },
  {
    id: "MED-01",
    name: "108 Mobile ICU Medical Unit #01",
    type: "AMBULANCE",
    status: "AVAILABLE",
    capacity: 4,
    currentLoad: 0,
    capabilities: ["Medical ICU", "Ventilator Support", "Triage Unit", "Paramedic"],
    location: {
      name: "Royapettah GH Dispatch",
      lat: 13.0550,
      lng: 80.2580
    },
    etaMinutes: 14,
    distanceKm: 4.8,
    contactPerson: "Dr. Nithya R.",
    phone: "+91 94450 10801"
  },
  {
    id: "TEAM-06",
    name: "Civil Defence Corps Volunteer Team #06",
    type: "RESCUE_TEAM",
    status: "AVAILABLE",
    capacity: 15,
    currentLoad: 0,
    capabilities: ["Evacuation Assistance", "Community First Aid", "Food Distribution"],
    location: {
      name: "Anna Nagar Community Hall",
      lat: 13.0820,
      lng: 80.2150
    },
    etaMinutes: 20,
    distanceKm: 7.5,
    contactPerson: "Lead Volunteer Manoj",
    phone: "+91 94450 11006"
  },
  {
    id: "SUP-02",
    name: "Mobile Logistics & Power Supply Truck #02",
    type: "SUPPLY_VEHICLE",
    status: "AVAILABLE",
    capacity: 50,
    currentLoad: 0,
    capabilities: ["Mobile Diesel Generator", "High-capacity Water Pumps", "Floodlights"],
    location: {
      name: "T. Nagar Depot",
      lat: 13.0420,
      lng: 80.2310
    },
    etaMinutes: 10,
    distanceKm: 2.9,
    contactPerson: "Eng. Balaji N.",
    phone: "+91 94450 22002"
  },
  {
    id: "MED-02",
    name: "Disaster Field Hospital Unit #02",
    type: "MEDICAL",
    status: "BUSY",
    capacity: 30,
    currentLoad: 24,
    capabilities: ["Field Surgery", "Mass Casualty Triage", "Emergency Medicines"],
    location: {
      name: "Koyambedu Staging Area",
      lat: 13.0680,
      lng: 80.1980
    },
    etaMinutes: 25,
    distanceKm: 8.1,
    contactPerson: "Dr. Sathish K.",
    phone: "+91 94450 10802"
  }
];

export const INITIAL_SHELTERS = [
  {
    id: "SHELTER-03",
    name: "Saidapet Higher Secondary School Relief Camp",
    location: {
      name: "Saidapet Main",
      lat: 13.0240,
      lng: 80.2260
    },
    capacity: 500,
    occupied: 320,
    available: 180,
    facilities: ["Medical Kit", "Hot Meals", "Clean Drinking Water", "Power Generator", "Sanitation Kits"],
    status: "OPEN", // OPEN, NEAR_CAPACITY, FULL, CLOSED
    contactPerson: "Camp Officer Selvam",
    phone: "+91 98400 33303"
  },
  {
    id: "SHELTER-01",
    name: "Velachery Community Centre & Auditorium",
    location: {
      name: "Velachery Bypass",
      lat: 12.9820,
      lng: 80.2210
    },
    capacity: 800,
    occupied: 740,
    available: 60,
    facilities: ["Medical Kit", "Food", "Drinking Water", "Children Play Area"],
    status: "NEAR_CAPACITY",
    contactPerson: "Officer Revathi",
    phone: "+91 98400 33301"
  },
  {
    id: "SHELTER-02",
    name: "Guindy Indoor Sports Complex",
    location: {
      name: "Guindy Estate",
      lat: 13.0060,
      lng: 80.2080
    },
    capacity: 1000,
    occupied: 410,
    available: 590,
    facilities: ["Full Medical Clinic", "Hot Meals", "Drinking Water", "Bedding & Blankets", "Pet Enclosure"],
    status: "OPEN",
    contactPerson: "Director Ashok Kumar",
    phone: "+91 98400 33302"
  },
  {
    id: "SHELTER-04",
    name: "T. Nagar Lions Club Hall",
    location: {
      name: "T. Nagar",
      lat: 13.0420,
      lng: 80.2360
    },
    capacity: 350,
    occupied: 350,
    available: 0,
    facilities: ["Food", "Drinking Water", "Basic First Aid"],
    status: "FULL",
    contactPerson: "Coordinator Preeti",
    phone: "+91 98400 33304"
  },
  {
    id: "SHELTER-05",
    name: "Anna Nagar Community Marriage Centre",
    location: {
      name: "Anna Nagar West",
      lat: 13.0870,
      lng: 80.2130
    },
    capacity: 650,
    occupied: 180,
    available: 470,
    facilities: ["Medical Kit", "Hot Food Kitchen", "Clean Water", "Generators"],
    status: "OPEN",
    contactPerson: "Camp Lead Natarajan",
    phone: "+91 98400 33305"
  },
  {
    id: "SHELTER-06",
    name: "Mylapore Santhome Primary School",
    location: {
      name: "Santhome High Road",
      lat: 13.0300,
      lng: 80.2730
    },
    capacity: 400,
    occupied: 0,
    available: 400,
    facilities: ["Drinking Water", "First Aid", "Blankets"],
    status: "OPEN",
    contactPerson: "Principal Sister Mary",
    phone: "+91 98400 33306"
  }
];

export const INITIAL_SUPPLY_CENTERS = [
  {
    id: "SUPPLY-01",
    name: "Central Warehousing Corporation Hub #1",
    location: { name: "Koyambedu Logistics Park", lat: 13.0720, lng: 80.1910 },
    inventory: {
      foodRations: 12500, // packets
      drinkingWaterLiters: 45000,
      medicalKits: 1200,
      blankets: 5400,
      lifeJackets: 850
    },
    status: "OPERATIONAL"
  },
  {
    id: "SUPPLY-02",
    name: "Southern Zone Disaster Depot #2",
    location: { name: "Guindy Industrial Depot", lat: 13.0120, lng: 80.2010 },
    inventory: {
      foodRations: 8200,
      drinkingWaterLiters: 28000,
      medicalKits: 750,
      blankets: 3100,
      lifeJackets: 600
    },
    status: "OPERATIONAL"
  },
  {
    id: "SUPPLY-03",
    name: "Port Trust Emergency Relief Depot",
    location: { name: "Chennai Port Zone", lat: 13.0890, lng: 80.2910 },
    inventory: {
      foodRations: 18000,
      drinkingWaterLiters: 60000,
      medicalKits: 2000,
      blankets: 8000,
      lifeJackets: 1500
    },
    status: "OPERATIONAL"
  }
];

export const INITIAL_ALERTS = [
  {
    id: "ALERT-801",
    title: "EXTREME RAINFALL & FLASH FLOOD WARNING",
    source: "IMD (India Meteorological Department)",
    severity: "EXTREME", // EXTREME, SEVERE, MODERATE
    affectedRegion: "Eastern Coastal & Adyar / Cooum River Basin",
    issuedAt: "10:15 AM Today",
    validUntil: "06:00 PM Tomorrow",
    details: "Red alert issued. Heavy to extremely heavy rainfall (above 204.4 mm in 24 hrs) expected accompanied by squally winds up to 65 km/h. High risk of localized urban inundation and river overflow.",
    coordinates: [
      [13.0600, 80.2000],
      [13.0900, 80.2800],
      [13.0100, 80.2800],
      [12.9600, 80.2200],
      [13.0000, 80.1800]
    ]
  },
  {
    id: "ALERT-802",
    title: "CYCLONIC CIRCULATION SEVERE WEATHER WATCH",
    source: "Regional Specialized Meteorological Centre",
    severity: "SEVERE",
    affectedRegion: "Coastal Belt & Low-lying Wards",
    issuedAt: "08:30 AM Today",
    validUntil: "11:59 PM Today",
    details: "Deep depression over Bay of Bengal intensifying. Coastal communities advised to avoid low-lying waterfront areas. Storm surge of 0.8m anticipated during high tide.",
    coordinates: [
      [13.0900, 80.2500],
      [13.1200, 80.3000],
      [12.9500, 80.3000],
      [12.9400, 80.2500]
    ]
  },
  {
    id: "ALERT-803",
    title: "DAM DISCHARGE & RIVERBANK EVACUATION ADVISORY",
    source: "Water Resources Department & SDMA",
    severity: "SEVERE",
    affectedRegion: "Adyar Riverbanks — Saidapet & Kotturpuram",
    issuedAt: "11:45 AM Today",
    validUntil: "08:00 PM Today",
    details: "Chembarambakkam surplus water discharge increased to 8,000 cusecs. Residents living within 100 meters of Adyar river margin MUST evacuate immediately to designated relief shelters.",
    coordinates: [
      [13.0300, 80.2100],
      [13.0250, 80.2400],
      [13.0100, 80.2600],
      [13.0050, 80.2400],
      [13.0200, 80.2100]
    ]
  }
];

export const SMS_IVR_REPORTS = [
  {
    id: "SMS-401",
    channel: "SMS",
    phone: "+91 98765 00112",
    rawText: "Flood water near Saidapet railway station bridge. 5 people trapped inside auto rickshaw shop.",
    timestamp: "3 mins ago",
    parsed: {
      type: "FLOOD",
      peopleAffected: 5,
      peopleTrapped: 5,
      severity: "CRITICAL",
      locationName: "Saidapet Railway Station Bridge"
    }
  },
  {
    id: "SMS-402",
    channel: "IVR",
    phone: "+91 94440 88776",
    rawText: "Automated IVR Call: Press 1 (Flood) -> Press 4 (4-6 people) -> Audio Message: 'Senior citizen in bed unable to move, water reached 2ft'",
    timestamp: "8 mins ago",
    parsed: {
      type: "FLOOD",
      peopleAffected: 2,
      peopleTrapped: 1,
      severity: "HIGH",
      locationName: "Velachery 3rd Street"
    }
  },
  {
    id: "SMS-403",
    channel: "SMS",
    phone: "+91 98401 55443",
    rawText: "Building pillar cracked in T. Nagar shop. People ran outside, street blocked by fallen signboard.",
    timestamp: "14 mins ago",
    parsed: {
      type: "BUILDING_DAMAGE",
      peopleAffected: 10,
      peopleTrapped: 0,
      severity: "HIGH",
      locationName: "Usman Road, T. Nagar"
    }
  }
];

// Fictionalized River / Flood Hazard Zone Polygon (Adyar & Cooum basin overlay)
export const HAZARD_ZONE_POLYGON = [
  [13.0280, 80.2050],
  [13.0320, 80.2250],
  [13.0200, 80.2450],
  [13.0080, 80.2650],
  [12.9980, 80.2580],
  [13.0100, 80.2350],
  [13.0180, 80.2150],
  [13.0220, 80.2020]
];
