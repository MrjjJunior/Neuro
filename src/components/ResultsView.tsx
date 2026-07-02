import { useState, useRef, useEffect } from 'react';
import { ScanResult, PupillaryResponsePoint } from '../types';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceArea,
  Legend
} from 'recharts';

const RefArea = ReferenceArea as any;
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft, 
  FileText, 
  Database, 
  Share2, 
  Eye, 
  Scale, 
  User, 
  Activity, 
  Clock, 
  Layers
} from 'lucide-react';

interface ResultsViewProps {
  result: ScanResult;
  onBackToHome: () => void;
}

export default function ResultsView({ result, onBackToHome }: ResultsViewProps) {
  const [activeTab, setActiveTab] = useState<'PLR' | 'facial' | 'notes'>('PLR');
  const [exporting, setExporting] = useState(false);
  const [integrating, setIntegrating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Set up clean theme colors based on risk score
  const config = {
    GREEN: {
      themeColor: 'emerald',
      bannerBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      badgeColor: 'bg-emerald-500 text-slate-950',
      accentText: 'text-emerald-400',
      title: 'LOW RISK SCREENING ASSIGNED',
      shortDesc: 'Bilateral pupil reflexes are symmetric and brisk. Facial alignment shows within-bounds lateral symmetry.'
    },
    YELLOW: {
      themeColor: 'amber',
      bannerBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      badgeColor: 'bg-amber-500 text-slate-950',
      accentText: 'text-amber-400',
      title: 'MODERATE SLUGGISHNESS DETECTED',
      shortDesc: 'Borderline asymmetry detected in pupil reflex constriction or sluggish latency. Continued assessment is advised.'
    },
    RED: {
      themeColor: 'rose',
      bannerBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse',
      badgeColor: 'bg-rose-500 text-slate-950',
      accentText: 'text-rose-400',
      title: 'CRITICAL SYMMETRY ALERT DETECTED',
      shortDesc: 'Marked unilateral pupillary light reflex deficit (anisocoria) or significant unilateral facial landmark drooping.'
    }
  }[result.riskScore];

  const handleExportPDF = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      triggerBanner('Clinical PDF assessment successfully compiled and downloaded to local filesystem.');
    }, 1200);
  };

  const handleIntegrateEHR = () => {
    setIntegrating(true);
    setTimeout(() => {
      setIntegrating(false);
      triggerBanner('Diagnostic payload successfully synchronized with Electronic Health Record system (FHIR-JSON standard).');
    }, 1500);
  };

  const triggerBanner = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  return (
    <div id="results-dashboard-screen" className="max-w-6xl mx-auto px-4 py-6 text-gray-200 space-y-6 relative z-10">
      
      {/* Toast Notification */}
      {successMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-black border border-cyan-500/30 text-cyan-400 text-xs font-semibold shadow-[0_0_25px_rgba(34,211,238,0.2)] flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" /> {successMessage}
        </div>
      )}

      {/* Screen Header & Back */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <button 
            id="btn-back-to-home"
            onClick={onBackToHome}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/40 font-mono tracking-[0.2em] uppercase">Triage Assessment Report</span>
            </div>
            <h1 className="text-base font-bold text-white uppercase tracking-wider mt-1">
              Subject: {result.patientName}
            </h1>
            <p className="text-[10px] text-white/40 font-mono tracking-wider mt-0.5">ID: {result.patientId} &bull; Recorded: {result.timestamp}</p>
          </div>
        </div>

        {/* Rapid Export Toolbar */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            id="btn-export-clinical-pdf"
            disabled={exporting}
            onClick={handleExportPDF}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[10px] font-bold uppercase tracking-[0.15em] transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            {exporting ? 'Compiling Report...' : 'Export PDF'}
          </button>
          <button
            id="btn-integrate-ehr"
            disabled={integrating}
            onClick={handleIntegrateEHR}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-[10px] font-bold uppercase tracking-[0.15em] transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
          >
            <Database className="w-4 h-4 text-black" />
            {integrating ? 'Syncing...' : 'Sync to EHR'}
          </button>
        </div>
      </header>

      {/* RISK ALIGNMENT TRIAGE BANNER */}
      <div id="triage-alert-banner" className={`p-6 rounded-2xl border ${config.bannerBg} flex items-start gap-4 shadow-2xl backdrop-blur-md`}>
        <div className="mt-1">
          {result.riskScore === 'RED' ? (
            <ShieldAlert className="w-8 h-8 text-rose-500 shrink-0" />
          ) : result.riskScore === 'YELLOW' ? (
            <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
          ) : (
            <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-widest ${config.badgeColor}`}>
              {result.riskScore} LEVEL
            </span>
            <h2 className="text-xs font-bold tracking-widest uppercase font-mono text-white">{config.title}</h2>
          </div>
          <p className="text-xs text-white/70 leading-relaxed max-w-4xl font-light">{config.shortDesc}</p>
        </div>
      </div>

      {/* Primary Analytical Grid (Side-by-side charts vs face meshes) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Waveform Chart and Metric Details (8/12 grid) */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          
          {/* Main Visual Tabs */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md flex-1 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Dynamic Assessment Waveforms</h3>
              </div>
              <div className="bg-black/40 p-0.5 rounded-xl border border-white/10 flex items-center">
                <button
                  id="tab-view-plr"
                  onClick={() => setActiveTab('PLR')}
                  className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-[0.1em] transition cursor-pointer ${
                    activeTab === 'PLR' ? 'bg-cyan-400 text-black shadow-sm' : 'text-white/40 hover:text-white'
                  }`}
                >
                  Pupillary Reflex
                </button>
                <button
                  id="tab-view-facial"
                  onClick={() => setActiveTab('facial')}
                  className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-[0.1em] transition cursor-pointer ${
                    activeTab === 'facial' ? 'bg-cyan-400 text-black shadow-sm' : 'text-white/40 hover:text-white'
                  }`}
                >
                  Bilateral Symmetry
                </button>
              </div>
            </div>

            {/* TAB 1: PLR Recharts Waveform */}
            {activeTab === 'PLR' && (
              <div className="space-y-4">
                <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex flex-col sm:flex-row justify-between gap-3 text-[10px] font-mono tracking-wider text-white/40 uppercase">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
                    <span>Left Pupil Waveform</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-teal-400"></span>
                    <span>Right Pupil Waveform</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-8 bg-white/5 border-l border-r border-cyan-500/20 rounded"></span>
                    <span>Photo-Stimulus Band (1500-2000ms)</span>
                  </div>
                </div>

                <div className="h-[280px] w-full bg-black/20 p-2 rounded-xl border border-white/5">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={result.timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" />
                      <XAxis 
                        dataKey="time" 
                        stroke="rgba(255, 255, 255, 0.3)" 
                        fontSize={9} 
                        fontFamily="monospace"
                        tickFormatter={(value) => `${value}ms`}
                      />
                      <YAxis 
                        stroke="rgba(255, 255, 255, 0.3)" 
                        fontSize={9} 
                        fontFamily="monospace"
                        domain={[1.5, 5.5]}
                        tickFormatter={(value) => `${value}mm`}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#050608', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', fontSize: '10px', color: '#f3f4f6', fontFamily: 'monospace' }}
                        labelFormatter={(label) => `Time: ${label} ms`}
                      />
                      
                      <RefArea 
                        x1={1500} 
                        x2={2000} 
                        fill="rgba(34, 211, 238, 0.05)" 
                        stroke="rgba(34, 211, 238, 0.2)"
                        strokeWidth={1}
                        label={{ value: 'STIMULUS', fill: 'rgba(34, 211, 238, 0.5)', fontSize: 9, position: 'top', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '0.15em' }}
                      />

                      <Line 
                        type="monotone" 
                        dataKey="leftDiameter" 
                        name="Left Pupil" 
                        stroke="#22d3ee" // Elegant Cyan
                        strokeWidth={2.5} 
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="rightDiameter" 
                        name="Right Pupil" 
                        stroke="#14b8a6" // Teal Accent
                        strokeWidth={2.5} 
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* TAB 2: Facial Symmetry indices */}
            {activeTab === 'facial' && (
              <div className="space-y-5 py-2">
                <div className="p-5 bg-black/40 rounded-xl border border-white/5 space-y-4">
                  <h4 className="text-[10px] font-mono font-bold text-white uppercase tracking-widest flex items-center gap-1.5 mb-3">
                    <Scale className="w-4 h-4 text-cyan-400" /> Structural Alignment Ratios
                  </h4>

                  <div className="space-y-4 text-xs">
                    
                    {/* Eyebrow Elevation */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-light">
                        <span className="text-white/60">Eyebrow Lateral Elevation Symmetry</span>
                        <span className={`font-mono font-bold ${result.symmetry.eyebrowSymmetry > 90 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {result.symmetry.eyebrowSymmetry}%
                        </span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className={`h-full rounded-full ${result.symmetry.eyebrowSymmetry > 90 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          style={{ width: `${result.symmetry.eyebrowSymmetry}%` }}
                        />
                      </div>
                    </div>

                    {/* Eyelid Opening */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-light">
                        <span className="text-white/60">Palpebral Fissure (Eyelid Opening) Symmetry</span>
                        <span className={`font-mono font-bold ${result.symmetry.eyelidSymmetry > 90 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {result.symmetry.eyelidSymmetry}%
                        </span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className={`h-full rounded-full ${result.symmetry.eyelidSymmetry > 90 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          style={{ width: `${result.symmetry.eyelidSymmetry}%` }}
                        />
                      </div>
                    </div>

                    {/* Mouth Alignment */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-light">
                        <span className="text-white/60">Oral Commissure (Mouth Corner) Alignment</span>
                        <span className={`font-mono font-bold ${result.symmetry.mouthSymmetry > 90 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {result.symmetry.mouthSymmetry}%
                        </span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className={`h-full rounded-full ${result.symmetry.mouthSymmetry > 90 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          style={{ width: `${result.symmetry.mouthSymmetry}%` }}
                        />
                      </div>
                    </div>

                  </div>
                </div>

                <div className="p-3.5 bg-black/40 border border-white/5 rounded-xl text-xs text-white/50 leading-relaxed flex gap-2.5 font-light">
                  <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>
                    Asymmetric alignment below 85% is highly correlated with unilateral motor paralysis (e.g., acute middle cerebral artery stroke or Bell's Palsy).
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* BILATERAL QUANTITATIVE METRIC COMPARISONS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Eye Diagnostics */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <h4 className="text-[10px] font-bold text-white uppercase tracking-widest font-mono">Left Eye (Baseline Calibration)</h4>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <p className="text-[9px] text-white/30 font-mono tracking-wider">BASELINE DIAMETER</p>
                  <p className="text-base font-bold font-mono text-white mt-0.5">{result.leftEye.diameter.toFixed(2)}<span className="text-[10px] text-white/40 font-sans ml-0.5">mm</span></p>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <p className="text-[9px] text-white/30 font-mono tracking-wider">LATENCY TO REACT</p>
                  <p className="text-base font-bold font-mono text-white mt-0.5">{result.leftEye.latency}<span className="text-[10px] text-white/40 font-sans ml-0.5">ms</span></p>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <p className="text-[9px] text-white/30 font-mono tracking-wider">CONSTRICTION RATE</p>
                  <p className="text-base font-bold font-mono text-cyan-400 mt-0.5">{result.leftEye.constrictionRate.toFixed(1)}%</p>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <p className="text-[9px] text-white/30 font-mono tracking-wider">PEAK VELOCITY</p>
                  <p className="text-base font-bold font-mono text-cyan-400 mt-0.5">{result.leftEye.velocity.toFixed(2)}<span className="text-[10px] text-white/40 font-sans ml-0.5">mm/s</span></p>
                </div>
              </div>
            </div>

            {/* Right Eye Diagnostics */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Eye className="w-4 h-4 text-teal-400" />
                <h4 className="text-[10px] font-bold text-white uppercase tracking-widest font-mono">Right Eye (Assessment Pathway)</h4>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <p className="text-[9px] text-white/30 font-mono tracking-wider">BASELINE DIAMETER</p>
                  <p className="text-base font-bold font-mono text-white mt-0.5">{result.rightEye.diameter.toFixed(2)}<span className="text-[10px] text-white/40 font-sans ml-0.5">mm</span></p>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <p className="text-[9px] text-white/30 font-mono tracking-wider">LATENCY TO REACT</p>
                  <p className="text-base font-bold font-mono text-white mt-0.5">{result.rightEye.latency}<span className="text-[10px] text-white/40 font-sans ml-0.5">ms</span></p>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <p className="text-[9px] text-white/30 font-mono tracking-wider">CONSTRICTION RATE</p>
                  <p className={`text-base font-bold font-mono mt-0.5 ${result.rightEye.constrictionRate > 30 ? 'text-teal-400' : 'text-rose-400 font-bold animate-pulse'}`}>{result.rightEye.constrictionRate.toFixed(1)}%</p>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <p className="text-[9px] text-white/30 font-mono tracking-wider">PEAK VELOCITY</p>
                  <p className={`text-base font-bold font-mono mt-0.5 ${result.rightEye.velocity > 2.0 ? 'text-teal-400' : 'text-rose-400 font-bold animate-pulse'}`}>{result.rightEye.velocity.toFixed(2)}<span className="text-[10px] text-white/40 font-sans ml-0.5">mm/s</span></p>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Side: Face Landmark Droop Heatmap Visualizer (4/12 grid) */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          
          {/* Biometric Mesh Overlay Viewer */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between space-y-4 backdrop-blur-md">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" /> Spatial Mesh Offsets
              </h3>
              <p className="text-xs text-white/40 mt-1 font-light">Spatial deviation vectors mapped on isolated snapshot frame.</p>
            </div>

            {/* Diagnostic Heatmap Overlay Canvas */}
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/60 aspect-[4/5] flex items-center justify-center">
              
              {/* Virtual scanning graphic background */}
              <div className="absolute inset-0 bg-[#06080d] opacity-90 flex flex-col justify-between p-4 font-mono text-[8px] text-cyan-400">
                <div className="flex justify-between tracking-wider uppercase opacity-40">
                  <span>PATIENT METRIC RECORD</span>
                  <span>IR SCREEN</span>
                </div>
                <div className="self-center text-white/20 text-[9px] tracking-[0.25em] uppercase font-bold text-center">
                  BIOMETRIC HEATMAP VIEW
                </div>
                <div className="flex justify-between tracking-wider uppercase opacity-40">
                  <span>REFLECTANCE: 94.2%</span>
                  <span>CAL: 11.72mm</span>
                </div>
              </div>

              {/* Vector facial droop offset schema */}
              <svg className="w-5/6 h-5/6 z-10" viewBox="0 0 200 240">
                {/* Face Contour */}
                <path 
                  d="M40,50 Q20,100 30,170 Q50,210 100,230 Q150,210 170,170 Q180,100 160,50 Z" 
                  fill="none" 
                  stroke={result.riskScore === 'RED' ? '#f43f5e' : '#10b981'} 
                  strokeWidth="1.5"
                  opacity="0.4"
                />

                {/* Eyebrows (Slanted downward on Right side in Pathology scenario) */}
                <path d="M 50,65 L 85,60" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                <path 
                  d={result.riskScore === 'RED' ? "M 115,60 L 150,75" : "M 115,60 L 150,65"} 
                  fill="none" 
                  stroke={result.riskScore === 'RED' ? '#f43f5e' : '#10b981'} 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                />

                {/* Eyes circles */}
                <circle cx="65" cy="95" r="15" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.4" />
                <circle cx="135" cy="95" r="15" fill="none" stroke={result.riskScore === 'RED' ? '#f43f5e' : '#10b981'} strokeWidth="1" opacity="0.4" />

                {/* Irises */}
                <circle cx="65" cy="95" r="9" fill="none" stroke="#10b981" strokeWidth="1.5" />
                <circle cx="135" cy="95" r="9" fill="none" stroke={result.riskScore === 'RED' ? '#f43f5e' : '#10b981'} strokeWidth="1.5" />

                {/* Pupils (Uneven sizes in pathological case) */}
                <circle cx="65" cy="95" r="4.5" fill="#020617" stroke="#10b981" strokeWidth="1.5" />
                <circle 
                  cx="135" 
                  cy="95" 
                  r={result.riskScore === 'RED' ? 7.5 : 4.5} 
                  fill="#020617" 
                  stroke={result.riskScore === 'RED' ? '#f43f5e' : '#10b981'} 
                  strokeWidth="1.5" 
                />

                {/* Nose bridge */}
                <path d="M 100,90 L 96,140 L 104,140 Z" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.3" />

                {/* Mouth Line (Slanted in Red Mode) */}
                <path 
                  d={result.riskScore === 'RED' ? "M 65,175 Q 100,185 135,198" : "M 65,175 Q 100,185 135,175"} 
                  fill="none" 
                  stroke={result.riskScore === 'RED' ? '#f43f5e' : '#10b981'} 
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Crosshairs & Deviation Bounding boxes */}
                {result.riskScore === 'RED' && (
                  <>
                    {/* Drooped right mouth annotation */}
                    <rect x="125" y="185" width="20" height="20" fill="none" stroke="#f43f5e" strokeWidth="1" strokeDasharray="2,2" />
                    <line x1="135" y1="198" x2="155" y2="210" stroke="#f43f5e" strokeWidth="1" />
                    <text x="145" y="222" fill="#f43f5e" fontSize="7" fontFamily="monospace" fontWeight="bold">DROOP: -8.4px</text>

                    {/* Blown pupil annotation */}
                    <rect x="123" y="83" width="24" height="24" fill="none" stroke="#f43f5e" strokeWidth="1" strokeDasharray="2,2" />
                    <line x1="135" y1="83" x2="155" y2="70" stroke="#f43f5e" strokeWidth="1" />
                    <text x="145" y="62" fill="#f43f5e" fontSize="7" fontFamily="monospace" fontWeight="bold">ANISOCORIA</text>
                  </>
                )}
              </svg>

              {/* Calibration Grid Lines Overlay */}
              <div className="absolute inset-0 border border-white/5 pointer-events-none">
                <div className="absolute top-1/2 left-0 right-0 border-t border-white/5" />
                <div className="absolute left-1/2 top-0 bottom-0 border-l border-white/5" />
              </div>

              {/* Scorecard Badge overlay */}
              <div className="absolute bottom-3 left-3 bg-black/80 border border-white/10 px-2.5 py-1 rounded text-[9px] font-mono text-white/40">
                Facial Alignment: <span className={result.riskScore === 'RED' ? 'text-rose-400 font-bold' : 'text-emerald-400'}>{result.symmetry.facialSymmetry.toFixed(1)}%</span>
              </div>
            </div>

            {/* Heatmap Stats description */}
            <div className="space-y-1.5 text-xs text-white/50 leading-relaxed bg-black/40 p-3.5 rounded-xl border border-white/5 font-light">
              <span className="font-semibold text-white/90 block text-[10px] uppercase tracking-wider font-mono">Biometric Alignment Audit</span>
              {result.riskScore === 'RED' ? (
                <span>Asymmetric horizontal alignment identified on right cranial nerve branches. Significant droop vectors measured at oral commissure and palpebral lines.</span>
              ) : (
                <span>Bilateral facial alignment ratios are symmetrical and fall within healthy non-pathological margins. No significant lateral offset vectors identified.</span>
              )}
            </div>
          </div>

          {/* Clinical notes explainer panel */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-3 flex-1 flex flex-col justify-between backdrop-blur-md">
            <div className="space-y-2 text-left">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-cyan-400" /> Clinical Diagnosis Support
              </h3>
              <p className="text-xs text-white/70 leading-relaxed bg-black/40 p-4 rounded-xl border border-white/5 font-mono text-[11px] whitespace-pre-line">
                {result.notes}
              </p>
            </div>

            <div className="pt-4 border-t border-white/5 mt-4 text-[9px] font-mono tracking-wide text-white/30 leading-relaxed text-left uppercase">
              <strong>Regulatory Notice & Disclaimer:</strong> This is a decision-support, computer-vision risk screening aid, and does NOT substitute for professional medical advice, clinical diagnosis, or specialized neuro-imaging. Always contact local emergency medical response protocols immediately in the event of suspected stroke.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
