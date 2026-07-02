export interface EyeMetrics {
  diameter: number; // in mm
  constrictionRate: number; // constriction %
  velocity: number; // velocity in mm/s
  latency: number; // latency to react in ms
}

export interface PupillaryResponsePoint {
  time: number; // in ms
  leftDiameter: number; // in mm
  rightDiameter: number; // in mm
  stimulusActive: boolean;
}

export interface SymmetryMetrics {
  facialSymmetry: number; // percentage (0-100)
  pupilSymmetry: number; // percentage (0-100)
  eyebrowSymmetry: number; // percentage
  mouthSymmetry: number; // percentage
  eyelidSymmetry: number; // percentage
}

export interface ScanResult {
  id: string;
  patientName: string;
  patientId: string;
  timestamp: string;
  riskScore: 'GREEN' | 'YELLOW' | 'RED';
  overallScore: number; // 0-100 index
  leftEye: EyeMetrics;
  rightEye: EyeMetrics;
  symmetry: SymmetryMetrics;
  timeSeries: PupillaryResponsePoint[];
  hasFacialDroop: boolean;
  hasAnisocoria: boolean; // unequal pupils
  notes: string;
  isSimulated: boolean;
}

export interface ClinicPatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  lastScanDate: string;
  riskLevel: 'GREEN' | 'YELLOW' | 'RED';
  scansCount: number;
}
