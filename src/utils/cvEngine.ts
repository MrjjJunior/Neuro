import { ScanResult, PupillaryResponsePoint, EyeMetrics, SymmetryMetrics, ClinicPatient } from '../types';

/**
 * Generates a realistic pupillary response time-series dataset.
 * Baseline (0 - 1500ms): Steady at baseline diameter.
 * Stimulus (1500 - 2000ms): Screen flash of 500ms.
 * Response & Constriction (1500 - 2200ms): Pupil shrinks to minimum.
 * Dilation/Recovery (2200 - 4000ms): Pupil slowly recovers toward baseline.
 */
export function generatePupillaryResponseData(
  type: 'GREEN' | 'RED' | 'YELLOW',
  isLeftNormal: boolean = true,
  isRightNormal: boolean = true
): PupillaryResponsePoint[] {
  const points: PupillaryResponsePoint[] = [];
  const duration = 4000; // 4 seconds
  const step = 50; // every 50ms

  // Parameters
  const baseL = 4.4; // left baseline in mm
  const baseR = type === 'RED' && !isRightNormal ? 5.0 : 4.4; // right baseline (blown right pupil)
  
  const minL = isLeftNormal ? 2.0 : 4.1; // left min
  const minR = isRightNormal ? 2.0 : 4.8; // right min (blown)

  const latencyL = isLeftNormal ? 220 : 380; // in ms
  const latencyR = isRightNormal ? 220 : 450; // sluggish right

  const timeToMinL = isLeftNormal ? 600 : 900; // duration from start of response to peak constriction
  const timeToMinR = isRightNormal ? 600 : 1100;

  for (let t = 0; t <= duration; t += step) {
    const stimulusActive = t >= 1500 && t <= 2000;
    
    // Compute Left Eye Diameter
    let leftD = baseL;
    if (t > 1500) {
      const responseTime = t - 1500;
      if (responseTime < latencyL) {
        leftD = baseL;
      } else {
        const activeResponseT = responseTime - latencyL;
        if (activeResponseT < timeToMinL) {
          // Constriction phase (sinusoidal ease-out)
          const fraction = activeResponseT / timeToMinL;
          leftD = baseL - (baseL - minL) * Math.sin(fraction * (Math.PI / 2));
        } else {
          // Recovery phase
          const recoveryT = activeResponseT - timeToMinL;
          const fraction = Math.min(1, recoveryT / 1500);
          leftD = minL + (baseL - minL) * 0.4 * fraction; // partial slow recovery
        }
      }
    }
    
    // Add small high-frequency muscle noise (physiological hippus)
    const noiseL = Math.sin(t / 120) * 0.05 + (Math.random() - 0.5) * 0.02;
    leftD += noiseL;

    // Compute Right Eye Diameter
    let rightD = baseR;
    if (t > 1500) {
      const responseTime = t - 1500;
      if (responseTime < latencyR) {
        rightD = baseR;
      } else {
        const activeResponseT = responseTime - latencyR;
        if (activeResponseT < timeToMinR) {
          const fraction = activeResponseT / timeToMinR;
          rightD = baseR - (baseR - minR) * Math.sin(fraction * (Math.PI / 2));
        } else {
          const recoveryT = activeResponseT - timeToMinR;
          const fraction = Math.min(1, recoveryT / 1500);
          rightD = minR + (baseR - minR) * 0.3 * fraction;
        }
      }
    }
    const noiseR = Math.sin(t / 110) * 0.04 + (Math.random() - 0.5) * 0.02;
    rightD += noiseR;

    points.push({
      time: t,
      leftDiameter: parseFloat(leftD.toFixed(3)),
      rightDiameter: parseFloat(rightD.toFixed(3)),
      stimulusActive,
    });
  }

  return points;
}

/**
 * Summarizes the raw pupillary response points into EyeMetrics
 */
export function summarizeEyeMetrics(
  points: PupillaryResponsePoint[],
  eye: 'left' | 'right',
  isNormal: boolean
): EyeMetrics {
  const isLeft = eye === 'left';
  const baselinePoints = points.filter(p => p.time < 1500);
  const baseline = baselinePoints.reduce((acc, p) => acc + (isLeft ? p.leftDiameter : p.rightDiameter), 0) / baselinePoints.length;
  
  const minDiameter = Math.min(...points.map(p => isLeft ? p.leftDiameter : p.rightDiameter));
  const constrictionRate = ((baseline - minDiameter) / baseline) * 100;
  
  // Constriction velocity (mm/s): change in diameter divided by time-to-constriction
  // Normal constriction happens quickly after stimulus response
  const velocity = isNormal ? parseFloat((3.8 + Math.random() * 0.6).toFixed(2)) : parseFloat((0.4 + Math.random() * 0.3).toFixed(2));
  const latency = isNormal ? Math.round(210 + Math.random() * 20) : Math.round(410 + Math.random() * 50);

  return {
    diameter: parseFloat(baseline.toFixed(2)),
    constrictionRate: parseFloat(constrictionRate.toFixed(1)),
    velocity,
    latency,
  };
}

/**
 * Creates a high-fidelity ScanResult template
 */
export function createScanResult(
  patientName: string,
  patientId: string,
  type: 'GREEN' | 'RED' | 'YELLOW',
  isSimulated: boolean = false
): ScanResult {
  const isLeftNormal = true;
  const isRightNormal = type !== 'RED'; // Right eye reacts abnormally in pathological stroke scenario (Third nerve palsy / Horner's / Anisocoria)

  const timeSeries = generatePupillaryResponseData(type, isLeftNormal, isRightNormal);
  const leftEye = summarizeEyeMetrics(timeSeries, 'left', isLeftNormal);
  const rightEye = summarizeEyeMetrics(timeSeries, 'right', isRightNormal);

  // Compute exact symmetry scores
  const pupilSymmetry = type === 'RED' ? 42.5 : type === 'YELLOW' ? 84.2 : 98.6;
  const facialSymmetry = type === 'RED' ? 71.3 : type === 'YELLOW' ? 89.1 : 97.4;
  const eyebrowSymmetry = type === 'RED' ? 74.0 : type === 'YELLOW' ? 91.5 : 98.1;
  const mouthSymmetry = type === 'RED' ? 68.2 : type === 'YELLOW' ? 86.4 : 96.9;
  const eyelidSymmetry = type === 'RED' ? 72.5 : type === 'YELLOW' ? 90.2 : 97.5;

  const symmetry: SymmetryMetrics = {
    facialSymmetry,
    pupilSymmetry,
    eyebrowSymmetry,
    mouthSymmetry,
    eyelidSymmetry,
  };

  const overallScore = Math.round((pupilSymmetry + facialSymmetry) / 2);
  const hasFacialDroop = type === 'RED';
  const hasAnisocoria = type === 'RED' || type === 'YELLOW';

  let notes = 'All parameters are within normal physiological bounds. Pupillary response is symmetric, brisk and responsive to light stimulus. Facial landmarks show high lateral alignment.';
  if (type === 'RED') {
    notes = 'CRITICAL ALERT: Significant pupillary asymmetry (anisocoria) detected. Right eye pupillary light reflex is severely depressed/non-reactive (constriction rate < 5%). Marked right-side facial asymmetry in eyebrow elevation and mouth corner elevation suggests acute unilateral facial paresis. Consistent with neurological compromise. Recommend immediate clinical intervention.';
  } else if (type === 'YELLOW') {
    notes = 'BORDERLINE RISK: Moderate asymmetry detected in pupillary constriction amplitude. Right pupil shows slightly sluggish response compared to the left. Facial landmarks are near-symmetrical. Suggests clinical follow-up or secondary screening.';
  }

  return {
    id: `scan_${Math.random().toString(36).substr(2, 9)}`,
    patientName,
    patientId,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
    riskScore: type,
    overallScore,
    leftEye,
    rightEye,
    symmetry,
    timeSeries,
    hasFacialDroop,
    hasAnisocoria,
    notes,
    isSimulated,
  };
}

/**
 * Initial clinical records database mock
 */
export const MOCK_PATIENTS: ClinicPatient[] = [
  { id: 'PAT-8241', name: 'Eleanor Vance', age: 67, gender: 'Female', lastScanDate: 'Jul 01, 2026', riskLevel: 'RED', scansCount: 2 },
  { id: 'PAT-1940', name: 'James Carter', age: 54, gender: 'Male', lastScanDate: 'Jun 28, 2026', riskLevel: 'GREEN', scansCount: 1 },
  { id: 'PAT-4932', name: 'Maria Rodriguez', age: 72, gender: 'Female', lastScanDate: 'Jun 25, 2026', riskLevel: 'YELLOW', scansCount: 3 },
  { id: 'PAT-7741', name: 'Amir Al-Sabah', age: 41, gender: 'Male', lastScanDate: 'Jun 20, 2026', riskLevel: 'GREEN', scansCount: 1 },
  { id: 'PAT-3058', name: 'Sarah Jenkins', age: 63, gender: 'Female', lastScanDate: 'Jun 19, 2026', riskLevel: 'GREEN', scansCount: 4 },
];
