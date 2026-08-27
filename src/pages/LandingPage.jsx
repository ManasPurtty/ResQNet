import React from 'react';
import { Link } from 'react-router-dom';
import { CitizenNavbar } from '../components/CitizenNavbar';
import { CommandMap } from '../components/CommandMap';
import {
  Shield,
  AlertCircle,
  Radio,
  Sparkles,
  ArrowRight,
  Activity,
  Layers,
  MapPin,
  CheckCircle2,
  SignalHigh,
  Phone,
  BarChart3
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col font-sans">
      <CitizenNavbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Text */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800 text-blue-400 text-xs font-mono font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              REAL-TIME DISASTER MANAGEMENT PLATFORM
            </div>

            <h1 className="font-heading font-black text-4xl sm:text-5xl xl:text-6xl tracking-tight text-white leading-[1.1]">
              Real-Time Disaster Response.{' '}
              <span className="bg-gradient-to-r from-red-500 via-orange-400 to-blue-400 bg-clip-text text-transparent">
                Powered by Intelligence.
              </span>
            </h1>

            <p className="text-gray-300 text-base sm:text-lg leading-relaxed font-normal">
              ResQNet unifies citizen reports, official alerts, rescue resources and shelter capacity into one real-time command platform — helping authorities decide what to respond to, where to send resources, and when to act.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/report"
                className="px-6 py-3.5 rounded-xl font-heading font-bold text-sm bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-xl shadow-red-600/30 border border-red-400/30 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
              >
                <AlertCircle className="w-5 h-5 animate-pulse" />
                <span>Report an Emergency</span>
              </Link>

              <Link
                to="/authority/dashboard"
                className="px-6 py-3.5 rounded-xl font-heading font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-gray-700 shadow-xl transition-all flex items-center gap-2"
              >
                <Radio className="w-5 h-5 text-blue-400" />
                <span>Open Command Center</span>
              </Link>
            </div>

            {/* Quick stats strip */}
            <div className="pt-6 border-t border-gray-800/80 grid grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <div className="text-gray-400">Response Speed</div>
                <div className="text-xl font-bold text-emerald-400 font-heading">7 Min ETA</div>
              </div>
              <div>
                <div className="text-gray-400">Resource Match</div>
                <div className="text-xl font-bold text-blue-400 font-heading">94% Precision</div>
              </div>
              <div>
                <div className="text-gray-400">Fallback Channels</div>
                <div className="text-xl font-bold text-amber-400 font-heading">SMS & IVR</div>
              </div>
            </div>
          </div>

          {/* Right Hero Visual: Stylized Command Map Container */}
          <div className="lg:col-span-6 h-[480px] relative rounded-3xl overflow-hidden border border-gray-800 shadow-2xl shadow-blue-500/10">
            <CommandMap height="100%" interactive={false} />
            <div className="absolute top-4 left-4 z-20 bg-[#151e32]/90 backdrop-blur-md border border-gray-700/80 p-2.5 rounded-xl text-xs flex items-center gap-2 text-gray-200">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span className="font-mono font-bold">LIVE EOC PREVIEW — ZONE 10</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Core Steps Workflow Section */}
      <section className="py-16 bg-[#0b111e] border-t border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div>
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">
              END-TO-END COORDINATION PIPELINE
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-white mt-2">
              From Report to Relief in 5 Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              {
                step: '01',
                title: 'Sense',
                desc: 'Citizen reports + official IMD weather alerts ingested instantly.',
                icon: Radio,
                color: 'text-red-400 border-red-500/40 bg-red-950/20'
              },
              {
                step: '02',
                title: 'Understand',
                desc: 'Geospatial intelligence & duplicate report clustering.',
                icon: Layers,
                color: 'text-amber-400 border-amber-500/40 bg-amber-950/20'
              },
              {
                step: '03',
                title: 'Prioritize',
                desc: 'Dynamic 5-factor priority calculation engine (0–100 score).',
                icon: Sparkles,
                color: 'text-yellow-400 border-yellow-500/40 bg-yellow-950/20'
              },
              {
                step: '04',
                title: 'Allocate',
                desc: '4-factor rescue team recommendation matching formula.',
                icon: CheckCircle2,
                color: 'text-blue-400 border-blue-500/40 bg-blue-950/20'
              },
              {
                step: '05',
                title: 'Respond',
                desc: 'Real-time deployment, shelter routing, and tracking.',
                icon: Activity,
                color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20'
              }
            ].map(item => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className={`p-6 rounded-2xl border ${item.color} text-left space-y-3 relative group hover:-translate-y-1 transition-transform`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-black text-gray-500 opacity-60">
                      {item.step}
                    </span>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-white">{item.title}</h3>
                  <p className="text-xs text-gray-300 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why ResQNet? Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-white">
            Why ResQNet?
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm">
            Built for Smart India Hackathon to solve critical disaster management bottlenecks faced by authorities and citizens.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Real-time Citizen Reporting',
              desc: 'Simple guided 6-step emergency filing with auto-GPS detection, trapped/vulnerable counts, and photo uploads.',
              icon: AlertCircle
            },
            {
              title: 'Intelligent Resource Allocation',
              desc: 'Algorithmic matching based on team capability, distance, capacity, and incident urgency score.',
              icon: Sparkles
            },
            {
              title: 'Live Disaster Command Center',
              desc: 'Full-screen EOC dashboard with interactive Leaflet maps, heatmaps, risk zones, and live event ticker.',
              icon: Radio
            },
            {
              title: 'SMS / IVR Fallback Channel',
              desc: 'Ensures zero citizens are left behind when cellular internet networks collapse during cyclones or floods.',
              icon: SignalHigh
            }
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="bg-[#111827] border border-gray-800 rounded-2xl p-6 space-y-4 hover:border-blue-500/50 transition-colors shadow-xl"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-lg text-white">{card.title}</h3>
                <p className="text-xs text-gray-300 leading-relaxed">{card.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Final CTA Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-800/80 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl mx-auto space-y-3">
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-white">
              Ready to See ResQNet in Action?
            </h2>
            <p className="text-gray-300 text-sm">
              Demonstrate the complete disaster response flow in 30 seconds using our pre-built Command Center demo mode.
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <Link
              to="/authority/dashboard"
              className="px-8 py-4 rounded-2xl font-heading font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-2xl shadow-blue-600/40 border border-blue-400/30 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <Radio className="w-5 h-5" />
              <span>Enter Command Center</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0b111e] border-t border-gray-800 py-8 text-center text-xs text-gray-500">
        <p>ResQNet — Real-Time Disaster Early-Warning & Resource Coordination Platform</p>
        <p className="mt-1 font-mono text-[11px] text-gray-600">Smart India Hackathon Presentation Prototype</p>
      </footer>
    </div>
  );
};
