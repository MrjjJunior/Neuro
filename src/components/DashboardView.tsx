import { useState, FormEvent } from 'react';
import { MOCK_PATIENTS, createScanResult } from '../utils/cvEngine';
import { ClinicPatient, ScanResult } from '../types';
import { 
  Users, 
  Search, 
  Plus, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Activity, 
  TrendingUp, 
  Calendar,
  FileSpreadsheet,
  Clock
} from 'lucide-react';

interface DashboardViewProps {
  onStartScan: (patientName: string, patientId: string) => void;
  onViewPastResult: (result: ScanResult) => void;
}

export default function DashboardView({ onStartScan, onViewPastResult }: DashboardViewProps) {
  const [patients, setPatients] = useState<ClinicPatient[]>(MOCK_PATIENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', age: '', gender: 'Male' });

  // Quick statistics
  const totalScans = patients.reduce((acc, p) => acc + p.scansCount, 0);
  const activeAlerts = patients.filter(p => p.riskLevel === 'RED').length;
  const borderlineCases = patients.filter(p => p.riskLevel === 'YELLOW').length;

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPatient = (e: FormEvent) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.age) return;

    const patientId = `PAT-${Math.floor(1000 + Math.random() * 9000)}`;
    const added: ClinicPatient = {
      id: patientId,
      name: newPatient.name,
      age: parseInt(newPatient.age),
      gender: newPatient.gender,
      lastScanDate: 'Today',
      riskLevel: 'GREEN',
      scansCount: 0
    };

    setPatients([added, ...patients]);
    setNewPatient({ name: '', age: '', gender: 'Male' });
    setShowAddPatientModal(false);
  };

  const handleQuickScan = (patient: ClinicPatient) => {
    onStartScan(patient.name, patient.id);
  };

  const handleViewMockScan = (patientName: string, patientId: string, risk: 'GREEN' | 'YELLOW' | 'RED') => {
    const result = createScanResult(patientName, patientId, risk);
    onViewPastResult(result);
  };

  return (
    <div id="clinic-dashboard" className="w-full h-full text-gray-200 flex flex-col relative z-10">
      {/* Header Panel */}
      <header className="border-b border-white/5 bg-black/20 backdrop-blur-md px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse"></span>
            <span className="text-[10px] text-white/40 font-mono tracking-[0.2em] uppercase">Clinical Fleet Hub</span>
          </div>
          <h1 className="text-sm font-bold uppercase tracking-[0.15em] text-white flex items-center gap-2.5 mt-1">
            <Users className="w-4 h-4 text-cyan-400" /> NeuroGaze Clinical Records
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            id="btn-add-patient-trigger"
            onClick={() => setShowAddPatientModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-[10px] font-bold uppercase tracking-[0.15em] cursor-pointer text-white"
          >
            <Plus className="w-4 h-4" /> Add Patient
          </button>
        </div>
      </header>

      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {/* Metric Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 relative overflow-hidden backdrop-blur-md">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Total Registered</p>
              <h3 className="text-2xl font-mono font-bold text-white mt-0.5">{patients.length}</h3>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 relative overflow-hidden backdrop-blur-md">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Acute Pathology</p>
              <h3 className="text-2xl font-mono font-bold text-rose-400 mt-0.5">{activeAlerts}</h3>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 relative overflow-hidden backdrop-blur-md">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Borderline Cases</p>
              <h3 className="text-2xl font-mono font-bold text-amber-500 mt-0.5">{borderlineCases}</h3>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 relative overflow-hidden backdrop-blur-md">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">System Scans Run</p>
              <h3 className="text-2xl font-mono font-bold text-cyan-400 mt-0.5">{totalScans}</h3>
            </div>
          </div>

        </section>

        {/* Patients Table & Quick Actions */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white flex items-center gap-2.5">
              <FileSpreadsheet className="w-4.5 h-4.5 text-white/40" /> Patient Directory
            </h2>
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                id="patient-search-input"
                type="text" 
                placeholder="Search patient name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
          </div>

          {/* Directory Table */}
          <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/20">
            <table className="w-full border-collapse text-left text-xs text-white/80">
              <thead>
                <tr className="border-b border-white/5 bg-white/5 text-[10px] uppercase tracking-[0.2em] font-medium text-white/40">
                  <th className="p-4 font-semibold">Patient Profile</th>
                  <th className="p-4 font-semibold">Demographics</th>
                  <th className="p-4 font-semibold">Last Assessment</th>
                  <th className="p-4 font-semibold">Risk Level</th>
                  <th className="p-4 font-semibold">Total Scans</th>
                  <th className="p-4 text-right font-semibold">Rapid Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-white/30 font-light font-sans">
                      No registered patients match your search.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => {
                    const statusColors = {
                      GREEN: { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
                      YELLOW: { text: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
                      RED: { text: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', icon: <ShieldAlert className="w-3.5 h-3.5 animate-pulse" /> },
                    }[patient.riskLevel];

                    return (
                      <tr key={patient.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-white">{patient.name}</div>
                          <div className="text-[10px] text-white/40 font-mono tracking-wider mt-0.5">{patient.id}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-white/80">{patient.age} yrs</div>
                          <div className="text-[10px] text-white/40 mt-0.5">{patient.gender}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-white/70">
                            <Calendar className="w-3.5 h-3.5 text-white/30" />
                            {patient.lastScanDate}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColors.bg} ${statusColors.text}`}>
                            {statusColors.icon}
                            {patient.riskLevel}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-white/40">{patient.scansCount} Assessment(s)</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            <button
                              id={`btn-init-scan-${patient.id}`}
                              onClick={() => handleQuickScan(patient)}
                              className="px-3.5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-[10px] font-bold uppercase tracking-[0.15em] shadow-[0_0_15px_rgba(34,211,238,0.15)] hover:shadow-[0_0_25px_rgba(34,211,238,0.35)] transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <Clock className="w-3.5 h-3.5" /> Initiate Scan
                            </button>
                            {patient.scansCount > 0 && (
                              <button
                                id={`btn-view-scan-${patient.id}`}
                                onClick={() => handleViewMockScan(patient.name, patient.id, patient.riskLevel)}
                                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors flex items-center gap-0.5 cursor-pointer"
                              >
                                View Report <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Technical Explainer Callout */}
        <section className="p-6 rounded-2xl bg-cyan-950/10 border border-cyan-500/20 flex flex-col md:flex-row gap-5 items-start backdrop-blur-md">
          <div className="p-3 rounded-xl bg-cyan-400/10 text-cyan-400 self-start md:self-auto">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-bold font-mono text-cyan-300 uppercase tracking-[0.2em]">Advanced Diagnostic Context: Reflex Symmetry & Stroke Screening</h4>
            <p className="text-xs text-white/60 leading-relaxed max-w-4xl font-light">
              NeuroGaze AI assesses pupillary light reflex (PLR) symmetry (detecting anisocoria) and facial landmark alignments (detecting droop associated with cranial nerve III palsies or hemiparesis). A typical PLR response involves baseline settling, high-intensity photo-stimulation, and asymmetric constriction velocity tracking. The screening leverages sub-millimeter visual calibrations mapped to the average human iris baseline (11.7mm).
            </p>
          </div>
        </section>
      </div>

      {/* Add Patient Modal */}
      {showAddPatientModal && (
        <div className="fixed inset-0 bg-[#050608]/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-black/80 border border-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white mb-1">Register New Patient</h2>
            <p className="text-[11px] text-white/40 mb-6 font-light">Create a clinical record before commencing rapid pupillary light screening.</p>

            <form onSubmit={handleAddPatient} className="space-y-5">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] text-white/40 mb-2 font-mono">Full Name</label>
                <input 
                  id="modal-patient-name"
                  type="text" 
                  required
                  placeholder="e.g. Kenneth Cole"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] text-white/40 mb-2 font-mono">Age (Years)</label>
                  <input 
                    id="modal-patient-age"
                    type="number" 
                    required
                    min="1"
                    max="120"
                    placeholder="e.g. 64"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] text-white/40 mb-2 font-mono">Gender</label>
                  <select 
                    id="modal-patient-gender"
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 font-sans cursor-pointer"
                  >
                    <option value="Male" className="bg-[#050608]">Male</option>
                    <option value="Female" className="bg-[#050608]">Female</option>
                    <option value="Other" className="bg-[#050608]">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5 mt-6">
                <button 
                  id="btn-modal-cancel"
                  type="button"
                  onClick={() => setShowAddPatientModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors text-white/80 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  id="btn-modal-submit"
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-[10px] font-bold uppercase tracking-[0.15em] shadow-[0_0_15px_rgba(34,211,238,0.25)] hover:shadow-[0_0_25px_rgba(34,211,238,0.45)] transition-all cursor-pointer"
                >
                  Create Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
