# ResQNet — Real-Time Disaster Early-Warning & Resource Coordination Platform

> **"From fragmented disaster reports to coordinated action."**  
> *Sense. Understand. Prioritize. Allocate. Respond.*

ResQNet is a production-quality, real-time disaster-management decision-support platform designed for citizens and disaster-management authorities. Its core purpose is to transform incoming citizen disaster reports into prioritized incidents and recommend the best available rescue resources in real time.

---

## 🚀 Core Value Proposition

$$\text{Citizen Report} \longrightarrow \text{Incident Detection} \longrightarrow \text{Priority Score} \longrightarrow \text{Best Resource Recommendation} \longrightarrow \text{Authority Assignment} \longrightarrow \text{Rescue} \longrightarrow \text{Shelter}$$

ResQNet visually and algorithmically answers the five critical questions emergency operations commanders face during a crisis:
1. **Where is the disaster?**
2. **How serious is it?**
3. **Who needs help most urgently?**
4. **Which resource should respond?**
5. **Where should affected people be evacuated?**

---

## 🛠️ Technology Stack

- **Frontend & UI**: React 18, Vite, Tailwind CSS v3, Lucide React
- **Geospatial & Maps**: Leaflet, OpenStreetMap (CartoDB Dark Canvas Tiles), Custom HTML glowing markers, Hazard polygon layers, Heatmap density circles, Polyline route rendering
- **Analytics & Data**: Recharts (Bar, Pie, Area charts)
- **State & Real-Time**: Centralized State Context, Event Bus, Live Simulation Heartbeat, Web Audio API Emergency Chimes
- **Demo Engine**: Automated 10-step hackathon presentation player

---

## 📋 Features

### 👤 Citizen Portal
- **Emergency Reporting (`/report`)**: Simple 6-step guided filing with browser GPS auto-detection, emergency type grid (Flood, Cyclone, Landslide, Building Collapse, Road Blockage, Medical, Fire), severity selection, trapped/vulnerable population counters, photo upload preview, description text area, and AI assistant auto-tagging preview.
- **Report Tracking (`/my-reports`)**: Real-time progress timeline (`Report received` → `Authority notified` → `Rescue team assigned` → `Rescue in progress` → `Completed`).
- **Confirmation Screen (`/report/success`)**: Provides unique Incident Reference (`INC-1024`), computed priority score, initial status, and direct tracking buttons.

### 🏢 Authority Emergency Operations Center (EOC)
- **Command Center Dashboard (`/authority/dashboard`)**:
  - Full-screen operational layout with system status banner (`● SYSTEM OPERATIONAL`), active disaster ticker (`FLOOD RESPONSE — ACTIVE`), **LIVE SIMULATION** toggle, and **DEMO MODE (30-Sec Script)** auto-player.
  - Dominant interactive Leaflet map featuring custom glowing markers, flood hazard zone polygon, heatmap density overlay, animated route polylines connecting assigned rescue teams to incidents, layer controls, and map legend.
  - **Live Incident Feed**: Incident cards sorted by priority score with `LIVE` badges, trapped counts, distance calculation, search and severity filters.
  - **Priority Engine Score Breakdown**: Displays 5-factor priority calculation gauge (Severity, People Affected, Waiting Time, Vulnerability, Report Confidence).
  - **Resource Match Recommendation Engine**: Calculates best rescue unit match using formula:
    $$\text{Score} = 45\% \text{Priority} + 25\% \text{Capability Match} + 20\% \text{Distance Proximity} + 10\% \text{Availability}$$
  - **One-Click Deployment**: `ASSIGN TEAM` button updates team status to `ASSIGNED`, plots route polyline on map, and triggers toast notifications.
  - **Shelter Recommendation**: Recommends nearest shelter matching free capacity and medical/food facilities with `ASSIGN SHELTER` action.
  - **SMS / IVR Fallback Feed**: Ingests low-connectivity SMS and IVR reports with one-click incident conversion.
- **Directory & Resource Pages**:
  - **Incidents Directory (`/authority/incidents`)**: Filterable table view of all active incidents.
  - **Resource Management (`/authority/resources`)**: Status controls (`AVAILABLE`, `ASSIGNED`, `BUSY`, `UNAVAILABLE`), capacity meters, and capability tags.
  - **Shelter Management (`/authority/shelters`)**: Capacity progress bars, facility checklists, and status controls (`OPEN`, `NEAR CAPACITY`, `FULL`, `CLOSED`).
  - **Weather Alerts (`/authority/alerts`)**: Official IMD emergency alert feed with hazard map view and `SIMULATE NEW ALERT` trigger.
  - **Command Analytics (`/authority/analytics`)**: Recharts KPI charts for Incidents by Type, Incidents by Severity, Response Velocity Trend over time, and Resource Utilization breakdown.

---

## 🔑 Demo Credentials

Authority login route: `/authority/login`

- **Email**: `resqnet.demo.admin@gmail.com`
- **Password**: `Admin@123`

---

## 🏃 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
```bash
# Clone repository
git clone https://github.com/saurav-pal231/ResQNet.git

# Navigate into project directory
cd ResQNet

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open `http://localhost:3000` in your browser.

### Frontend Deployment

Production frontend builds use `https://resqnet-uav3.onrender.com` as the API origin by default.
On Render, set `VITE_API_URL` to `https://resqnet-uav3.onrender.com` before deploying the frontend.
To use a different backend, set `VITE_API_URL` to the backend origin before running `npm run build`.
The retired `https://resqnet-tuv3.onrender.com` deployment is automatically replaced with the working production origin in production builds.

The backend accepts requests from the deployed frontend and the local Vite development ports.
Set `CLIENT_URLS` to a comma-separated list of additional allowed frontend origins.
Do not include `/api` at the end of this value.

### Production Build
```bash
npm run build
```

---

## 📄 License
MIT License. Built for Smart India Hackathon.
