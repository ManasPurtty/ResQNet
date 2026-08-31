import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CitizenNavbar } from '../components/CitizenNavbar';
import { useAppState } from '../context/StateContext';
import {
  AlertCircle,
  MapPin,
  Camera,
  Users,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Navigation,
  Upload
} from 'lucide-react';

export const ReportEmergency = () => {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const { addCitizenReport } = useAppState();

  const [formData, setFormData] = useState({
    type: 'FLOOD',
    severity: 'CRITICAL',
    peopleAffected: 6,
    peopleTrapped: 3,
    vulnerablePeople: 2,
    locationName: routeLocation.state?.defaultLocationName || 'Rasulgarh Daya Canal Basin, Bhubaneswar',
    address: 'Near Canal Road, Rasulgarh',
    description: '',
    image: null,
    imagePreview: null,
    reporterName: '',
    phone: '',
    lat: routeLocation.state?.defaultLat || 20.2915,
    lng: routeLocation.state?.defaultLng || 85.8640,
    district: 'Khordha'
  });

  const [locationStatus, setLocationStatus] = useState(
    routeLocation.state?.defaultLat
      ? '📍 Location pre-filled from your GPS locator'
      : 'Detecting GPS location in Odisha...'
  );
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);

  // Auto Geolocation if not pre-filled
  useEffect(() => {
    if (routeLocation.state?.defaultLat) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(prev => ({
            ...prev,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            locationName: `GPS (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`
          }));
          setLocationStatus('📍 Location detected automatically via GPS');
        },
        () => {
          setLocationStatus('📍 Default Odisha location selected (Rasulgarh Canal Basin)');
        }
      );
    }
  }, []);

  // Handle Description change + simulated AI classification
  const handleDescriptionChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, description: val }));

    if (val.length > 12) {
      setIsAiAnalyzing(true);
      setTimeout(() => {
        setIsAiAnalyzing(false);
        setAiSuggestions({
          detectedType: val.toLowerCase().includes('water') || val.toLowerCase().includes('flood') ? 'FLOOD' : val.toLowerCase().includes('wind') ? 'CYCLONE' : 'EMERGENCY',
          suggestedPriority: 'Critical',
          peopleTrappedDetected: val.toLowerCase().includes('trap') || val.toLowerCase().includes('roof') ? 'Yes' : 'No'
        });
      }, 400);
    }
  };

  // Image Upload handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image: file, imagePreview: url }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const createdIncident = addCitizenReport({
      ...formData,
      image: formData.imagePreview || "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80"
    });

    navigate('/report/success', { state: { incident: createdIncident } });
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col font-sans">
      <CitizenNavbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="bg-red-950 text-red-400 border border-red-800 text-xs font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            ODISHA CITIZEN DISASTER REPORTING
          </span>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-white">
            REPORT AN EMERGENCY
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm">
            Your emergency report is routed directly to the Odisha State Disaster Operation Center (OSDMA / ODRAF).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: LOCATION */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-sm text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" />
                Step 1 — Emergency Location (Odisha)
              </span>
              <span className="text-[11px] text-emerald-400 font-mono font-medium">
                {locationStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Area / Landmark in Odisha</label>
                <input
                  type="text"
                  required
                  value={formData.locationName}
                  onChange={e => setFormData({ ...formData, locationName: e.target.value })}
                  className="w-full bg-[#151e32] border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  placeholder="e.g. Rasulgarh Canal Road, Bhubaneswar"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">District</label>
                <select
                  value={formData.district}
                  onChange={e => setFormData({ ...formData, district: e.target.value })}
                  className="w-full bg-[#151e32] border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                >
                  {['Khordha', 'Cuttack', 'Puri', 'Kendrapara', 'Jagatsinghpur', 'Balasore', 'Ganjam', 'Sambalpur'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* STEP 2: EMERGENCY TYPE */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <span className="font-heading font-bold text-sm text-gray-200 uppercase tracking-wider block">
              Step 2 — Emergency Type
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'FLOOD', label: 'Flood / Inundation', icon: '🌊' },
                { id: 'CYCLONE', label: 'Cyclone', icon: '🌪️' },
                { id: 'LANDSLIDE', label: 'Landslide', icon: '⛰️' },
                { id: 'BUILDING_DAMAGE', label: 'Building Collapse', icon: '🏚️' },
                { id: 'ROAD_BLOCKAGE', label: 'Road Blockage', icon: '🚧' },
                { id: 'MEDICAL', label: 'Medical Emergency', icon: '🚑' },
                { id: 'FIRE', label: 'Fire Hazard', icon: '🔥' },
                { id: 'OTHER', label: 'Other Hazard', icon: '⚠️' }
              ].map(item => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setFormData({ ...formData, type: item.id })}
                  className={`p-3 rounded-xl border text-left flex flex-col items-center justify-center gap-1 transition-all ${
                    formData.type === item.id
                      ? 'bg-red-950/80 border-red-500 text-white shadow-lg shadow-red-600/20 scale-105'
                      : 'bg-[#151e32] border-gray-800 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-heading font-bold text-xs">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 3: SEVERITY LEVEL */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <span className="font-heading font-bold text-sm text-gray-200 uppercase tracking-wider block">
              Step 3 — Severity Level
            </span>

            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'CRITICAL', label: 'Critical', color: 'bg-red-600 border-red-400' },
                { id: 'HIGH', label: 'High', color: 'bg-orange-600 border-orange-400' },
                { id: 'MEDIUM', label: 'Medium', color: 'bg-yellow-600 border-yellow-400' },
                { id: 'LOW', label: 'Low', color: 'bg-emerald-600 border-emerald-400' }
              ].map(sev => (
                <button
                  type="button"
                  key={sev.id}
                  onClick={() => setFormData({ ...formData, severity: sev.id })}
                  className={`py-3 rounded-xl border font-heading font-bold text-xs text-white text-center transition-all ${
                    formData.severity === sev.id
                      ? `${sev.color} shadow-lg scale-105`
                      : 'bg-[#151e32] border-gray-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  {sev.label}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 4: PEOPLE COUNTS */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <span className="font-heading font-bold text-sm text-gray-200 uppercase tracking-wider block">
              Step 4 — People Needing Rescue
            </span>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">People Affected</label>
                <input
                  type="number"
                  min="1"
                  value={formData.peopleAffected}
                  onChange={e => setFormData({ ...formData, peopleAffected: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-full bg-[#151e32] border border-gray-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-red-500 text-center"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">People Trapped</label>
                <input
                  type="number"
                  min="0"
                  value={formData.peopleTrapped}
                  onChange={e => setFormData({ ...formData, peopleTrapped: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full bg-[#151e32] border border-gray-700 rounded-xl px-3 py-2 text-sm text-red-400 font-mono font-bold focus:outline-none focus:border-red-500 text-center"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Vulnerable (Elderly/Child)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.vulnerablePeople}
                  onChange={e => setFormData({ ...formData, vulnerablePeople: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full bg-[#151e32] border border-gray-700 rounded-xl px-3 py-2 text-sm text-amber-400 font-mono font-bold focus:outline-none focus:border-red-500 text-center"
                />
              </div>
            </div>
          </div>

          {/* STEP 5: PHOTO UPLOAD */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <span className="font-heading font-bold text-sm text-gray-200 uppercase tracking-wider block">
              Step 5 — Incident Photo (Optional)
            </span>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#151e32] hover:bg-gray-800 border border-gray-700 text-xs font-semibold text-gray-200 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Upload Photo</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>

              {formData.imagePreview && (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-blue-500">
                  <img src={formData.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* STEP 6: DESCRIPTION + AI ASSISTANT */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <span className="font-heading font-bold text-sm text-gray-200 uppercase tracking-wider block">
              Step 6 — Incident Description
            </span>

            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={handleDescriptionChange}
              placeholder="Describe what is happening (e.g. Daya river overflowed, 3 people trapped on roof, road blocked...)"
              className="w-full bg-[#151e32] border border-gray-700 rounded-xl p-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
            />

            {/* AI Assistant Output Card */}
            {aiSuggestions && (
              <div className="bg-blue-950/40 border border-blue-800/80 rounded-xl p-3 text-xs space-y-1 font-mono text-blue-200">
                <div className="flex items-center gap-1.5 font-bold text-blue-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Assistant Auto-Summarization
                </div>
                <div className="flex justify-between text-[11px] text-gray-300">
                  <span>Detected Type: <b>{aiSuggestions.detectedType}</b></span>
                  <span>Suggested Priority: <b className="text-red-400">{aiSuggestions.suggestedPriority}</b></span>
                  <span>People Trapped: <b>{aiSuggestions.peopleTrappedDetected}</b></span>
                </div>
              </div>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl font-heading font-black text-base bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-2xl shadow-red-600/40 border border-red-400/30 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <AlertCircle className="w-6 h-6 animate-pulse" />
            <span>🚨 REPORT EMERGENCY TO ODISHA EOC</span>
          </button>
        </form>
      </main>
    </div>
  );
};
