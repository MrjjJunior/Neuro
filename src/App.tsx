import { useState } from 'react';
import LandingView from './components/LandingView';
import DashboardView from './components/DashboardView';
import ScanView from './components/ScanView';
import ResultsView from './components/ResultsView';
import { ScanResult } from './types';
import { 
  Activity, 
  Database, 
  HelpCircle, 
  HeartHandshake, 
  Eye, 
  Layers, 
  TrendingUp, 
  Info,
  ShieldCheck,
  FileText
} from 'lucide-react';

type ActiveView = 'landing' | 'dashboard' | 'scan' | 'results';

export default function App() {
  const [currentView, setCurrentView] = useState<ActiveView>('landing');
  const [patientContext, setPatientContext] = useState({ name: '', id: '' });
  const [selectedScanResult, setSelectedScanResult] = useState<ScanResult | null>(null);

  // Navigators
  const navigateToScan = (patientName: string, patientId?: string) => {
    const id = patientId || `PAT-${Math.floor(1000 + Math.random() * 9000)}`;
    setPatientContext({ name: patientName, id });
    setCurrentView('scan');
  };

  const navigateToDashboard = () => {
    setCurrentView('dashboard');
  };

  const navigateToHome = () => {
    setCurrentView('landing');
    setPatientContext({ name: '', id: '' });
    setSelectedScanResult(null);
  };

  const handleScanComplete = (result: ScanResult) => {
    setSelectedScanResult(result);
    setCurrentView('results');
  };

  const handleViewPastResult = (result: ScanResult) => {
    setSelectedScanResult(result);
    setCurrentView('results');
  };

  return (
    <div className="min-h-screen bg-[#050608] font-sans text-gray-200 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-hidden">
      
      {/* Atmospheric Background Layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-900/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-900/15 blur-[100px]"></div>
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-cyan-900/5 blur-[80px]"></div>
      </div>

      {/* Platform Branding Header */}
      <header className="relative z-10 border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={navigateToHome}>
          <div className="w-9 h-9 rounded-full border border-cyan-500/30 flex items-center justify-center bg-cyan-950/20 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
            <Eye className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xs tracking-[0.2em] uppercase font-bold text-white flex items-center gap-1.5">
              NeuroGaze <span className="text-[9px] font-semibold text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded border border-cyan-500/20 font-mono tracking-normal">AI v1.4</span>
            </h2>
            <p className="text-[9px] tracking-wider text-white/40 uppercase font-mono">Neurological Screening Platform</p>
          </div>
        </div>

        {/* Global Nav tabs */}
        <nav className="hidden md:flex items-center gap-8 text-[10px] uppercase tracking-[0.2em] font-medium">
          <button 
            id="nav-quick-screener"
            onClick={navigateToHome}
            className={`transition cursor-pointer pb-1 border-b ${
              currentView === 'landing' || currentView === 'scan' ? 'text-cyan-400 border-cyan-400' : 'text-white/40 border-transparent hover:text-white'
            }`}
          >
            Quick Screener
          </button>
          <button 
            id="nav-records-archive"
            onClick={navigateToDashboard}
            className={`transition cursor-pointer pb-1 border-b ${
              currentView === 'dashboard' ? 'text-cyan-400 border-cyan-400' : 'text-white/40 border-transparent hover:text-white'
            }`}
          >
            Records Archive
          </button>
          <a 
            href="#clinical-about"
            className="text-white/40 border-b border-transparent hover:text-white transition pb-1"
          >
            Symmetry Guidelines
          </a>
        </nav>

        {/* Diagnostic Integrity Check Badge */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-[9px] font-mono font-bold tracking-widest flex items-center gap-1.5 shadow-[0_0_10px_rgba(34,211,238,0.05)]">
            <ShieldCheck className="w-3.5 h-3.5" /> SECURE EDGE CV
          </div>
        </div>
      </header>

      {/* Main App Container */}
      <main className="relative z-10 flex-1 w-full flex flex-col justify-center">
        {currentView === 'landing' && (
          <LandingView 
            onStartScan={(name) => navigateToScan(name)} 
            onNavigateToDashboard={navigateToDashboard}
          />
        )}
        
        {currentView === 'dashboard' && (
          <DashboardView 
            onStartScan={(name, id) => navigateToScan(name, id)}
            onViewPastResult={handleViewPastResult}
          />
        )}
 
        {currentView === 'scan' && (
          <ScanView 
            patientName={patientContext.name}
            patientId={patientContext.id}
            onScanComplete={handleScanComplete}
            onCancel={navigateToHome}
          />
        )}

        {currentView === 'results' && selectedScanResult && (
          <ResultsView 
            result={selectedScanResult}
            onBackToHome={navigateToHome}
          />
        )}
      </main>

      {/* Scientific Framework & Clinical Support Info section */}
      <section id="clinical-about" className="relative z-10 border-t border-white/5 bg-black/30 backdrop-blur-sm px-6 py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold font-mono text-cyan-400/80 uppercase tracking-[0.2em] flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-cyan-400" /> Pupillary Light Reflex
            </h4>
            <h3 className="text-sm font-bold text-white tracking-wide">Retinal Photoreceptive Screening</h3>
            <p className="text-xs text-white/60 leading-relaxed font-light">
              When intense light enters the retina, the optic nerve (CN II) transmits signals to the pretectal nucleus, initiating motor impulses along the oculomotor nerve (CN III) causing rapid pupil constriction. Discrepancy in latency, amplitude, or speed reveals deep-seated neurological pathology.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-[10px] font-bold font-mono text-cyan-400/80 uppercase tracking-[0.2em] flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-cyan-400" /> Facial Nerve Motor Alignments
            </h4>
            <h3 className="text-sm font-bold text-white tracking-wide">Bilateral landmark Symmetry</h3>
            <p className="text-xs text-white/60 leading-relaxed font-light">
              Acute ischemic incidents affecting cortical central pathways result in unilateral facial muscle paralysis (sparing the forehead). NeuroGaze AI tracks lateral alignments of palpebral fissures (eyelids) and oral commissures (mouth) to assist in recognizing facial hemiparesis.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-[10px] font-bold font-mono text-cyan-400/80 uppercase tracking-[0.2em] flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-cyan-400" /> Diagnostic Decision Support
            </h4>
            <h3 className="text-sm font-bold text-white tracking-wide">Edge-Calibrated Telemetry</h3>
            <p className="text-xs text-white/60 leading-relaxed font-light">
              Using a baseline physiological iris diameter reference (11.7mm), local pixel dimensions are converted to metric parameters. Computations of constriction velocity (mm/s), recovery dilation trends, and spatial facial angles are completed entirely locally in client memory.
            </p>
          </div>

        </div>
      </section>

      {/* Platform Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-black/50 px-6 py-4 flex flex-col sm:flex-row justify-between items-center text-center gap-3 text-[9px] font-mono tracking-widest text-white/40 uppercase">
        <div>
          &copy; 2026 NeuroGaze AI HealthTech Systems. Developed for clinical triage exploration.
        </div>
        <div className="flex gap-4">
          <span className="hover:text-cyan-400 transition cursor-pointer">HIPAA Compliance Standards</span>
          <span className="hover:text-cyan-400 transition cursor-pointer">FHIR EHR Schema Mapping</span>
          <span className="hover:text-cyan-400 transition cursor-pointer">Privacy Policy</span>
        </div>
      </footer>

    </div>
  );
}
