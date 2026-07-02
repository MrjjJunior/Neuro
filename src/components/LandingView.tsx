import { useState, FormEvent } from 'react';
import { 
  Activity, 
  UserPlus, 
  ShieldAlert, 
  Flame, 
  Lock, 
  Video, 
  Layers, 
  TrendingUp, 
  Sparkles,
  ClipboardList
} from 'lucide-react';

interface LandingViewProps {
  onStartScan: (patientName: string) => void;
  onNavigateToDashboard: () => void;
}

export default function LandingView({ onStartScan, onNavigateToDashboard }: LandingViewProps) {
  const [patientName, setPatientName] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;
    onStartScan(patientName.trim());
  };

  return (
    <div id="landing-screen" className="max-w-4xl mx-auto px-6 py-10 md:py-16 space-y-12 text-gray-200">
      
      {/* Brand Hero Heading */}
      <section className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-400/5 border border-cyan-400/20 text-cyan-400 text-[10px] font-mono tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5" /> Hackathon Edition — Impact Track
        </div>
        <h1 className="text-4xl md:text-5xl font-serif italic text-white font-light tracking-tight">
          NeuroGaze AI
        </h1>
        <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 mt-2">
          Pupillary Light Reflex & Facial Symmetry Triage Platform
        </p>
        <p className="text-sm text-white/60 font-sans leading-relaxed pt-2 max-w-lg mx-auto font-light">
          On-device pupillary light reflex and facial landmark symmetry screening. Rapid risk classification in under 60 seconds using front-facing cameras.
        </p>
      </section>

      {/* Primary Interaction Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Quick Triage Scan Form */}
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white flex items-center gap-2.5">
              <UserPlus className="w-4 h-4 text-cyan-400" /> Start Rapid Triage
            </h2>
            <p className="text-xs text-white/40 leading-relaxed font-light">
              Enter a subject's name or reference ID to immediately initialize the front-camera calibration and the flash-constriction reflex sequence.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2 font-mono">Patient / Subject Identifier</label>
              <input 
                id="quick-patient-name"
                type="text" 
                required
                placeholder="e.g. Patient Alpha"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition font-sans"
              />
            </div>
            
            <button 
              id="btn-quick-start-scan"
              type="submit" 
              className="w-full py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_35px_rgba(34,211,238,0.45)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Video className="w-4 h-4" /> Initialize Camera & Scan
            </button>
          </form>
        </div>

        {/* Fleet Dashboard Access Card */}
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white flex items-center gap-2.5">
              <ClipboardList className="w-4 h-4 text-cyan-400" /> Clinical Records Hub
            </h2>
            <p className="text-xs text-white/40 leading-relaxed font-light">
              Manage clinical archives, view historical metrics, map progression graphs over successive patient scans, and review triage outcomes.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
              <span className="text-xs font-light text-white/60">Archived Records</span>
              <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-500/20 px-2.5 py-0.5 rounded">5 Patient Profiles</span>
            </div>
            <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
              <span className="text-xs font-light text-white/60">Emergency Red Alerts</span>
              <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded">1 Active Pathology</span>
            </div>
          </div>

          <button 
            id="btn-open-dashboard"
            onClick={onNavigateToDashboard}
            className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Activity className="w-4 h-4 text-cyan-400" /> Open Fleet Dashboard
          </button>
        </div>

      </div>

      {/* Feature Highlighting Grid */}
      <section className="space-y-6 pt-4">
        <div className="border-t border-white/5 pt-8 text-center">
          <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-white/30">Platform Diagnostic Capabilities</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-3 hover:border-white/10 transition-colors">
            <div className="p-2 w-9 h-9 rounded-xl bg-cyan-400/10 text-cyan-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.1em]">Sub-Millimeter Pupillometry</h4>
            <p className="text-xs text-white/50 leading-relaxed font-light">
              Computes absolute pupil diameter (calibrated at baseline) at high framerate, charting real-time light constriction velocity.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-3 hover:border-white/10 transition-colors">
            <div className="p-2 w-9 h-9 rounded-xl bg-cyan-400/10 text-cyan-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.1em]">Landmark Bilateral Symmetry</h4>
            <p className="text-xs text-white/50 leading-relaxed font-light">
              Maps bilateral coordinates for critical cranial facial alignment (eyebrows, eyes, eyelids, mouth corners) to isolate unilateral drooping.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-3 hover:border-white/10 transition-colors">
            <div className="p-2 w-9 h-9 rounded-xl bg-cyan-400/10 text-cyan-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.1em]">Pathology Demo Suite</h4>
            <p className="text-xs text-white/50 leading-relaxed font-light">
              Trigger pre-configured acute pathology states during live presentation to deterministically trigger emergency red triage alerts.
            </p>
          </div>

        </div>
      </section>

      {/* Privacy Guarantee & Hardware disclaimer */}
      <footer className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center text-center gap-3 text-[10px] font-mono tracking-widest text-white/30 uppercase">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-cyan-400" />
          <span>On-Device Edge Computation: All data remains securely in browser memory.</span>
        </div>
        <div className="flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-white/30" />
          <span>Screening aid only. Always refer to professional clinical procedures.</span>
        </div>
      </footer>

    </div>
  );
}
