import { useState, useEffect, useRef } from 'react';
import { ScanResult } from '../types';
import { createScanResult } from '../utils/cvEngine';
import { 
  Camera, 
  RotateCcw, 
  Settings, 
  Sparkles, 
  Activity, 
  ShieldAlert, 
  ChevronRight, 
  CheckCircle2, 
  X,
  Eye,
  Zap,
  Info
} from 'lucide-react';

interface ScanViewProps {
  patientName: string;
  patientId: string;
  onScanComplete: (result: ScanResult) => void;
  onCancel: () => void;
}

type ScanPhase = 'CALIBRATING' | 'BASELINE' | 'FLASH' | 'RECOVERY' | 'ANALYZING' | 'IDLE';

export default function ScanView({ patientName, patientId, onScanComplete, onCancel }: ScanViewProps) {
  const [phase, setPhase] = useState<ScanPhase>('IDLE');
  const [progress, setProgress] = useState(0);
  const [selectedPathology, setSelectedPathology] = useState<'GREEN' | 'YELLOW' | 'RED'>('GREEN');
  const [useVirtualFeed, setUseVirtualFeed] = useState(false);
  const [cameraState, setCameraState] = useState<'requesting' | 'active' | 'denied' | 'virtual'>('requesting');
  const [fps, setFps] = useState(30);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Simulation and dynamic state tracking
  const [liveLeftDiameter, setLiveLeftDiameter] = useState(4.4);
  const [liveRightDiameter, setLiveRightDiameter] = useState(4.4);
  const [facialAlignmentScore, setFacialAlignmentScore] = useState(98);
  const [faceDetected, setFaceDetected] = useState(true);

  // Time tracker for phase timing
  const scanStartTimeRef = useRef<number>(0);
  const phaseRef = useRef<ScanPhase>('IDLE');

  // Trigger camera access
  useEffect(() => {
    phaseRef.current = 'IDLE';
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraState('requesting');
    try {
      if (streamRef.current) {
        stopCamera();
      }

      // Try actual camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraState('active');
      setUseVirtualFeed(false);
    } catch (err) {
      console.warn("Camera permission denied or unavailable in sandbox iframe. Fallback to Virtual Medical Feed.", err);
      setCameraState('virtual');
      setUseVirtualFeed(true);
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Run computer vision drawing loop
  useEffect(() => {
    if (cameraState === 'requesting') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameCount = 0;
    let lastTime = performance.now();

    const drawLoop = (now: number) => {
      // Calculate FPS
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }

      const width = canvas.width;
      const height = canvas.height;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // If we have actual video, draw it as a faint background
      if (!useVirtualFeed && videoRef.current && videoRef.current.readyState >= 2) {
        ctx.save();
        // Faint medical-gray color overlay on real video feed
        ctx.drawImage(videoRef.current, 0, 0, width, height);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.45)'; // Tint Navy
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      } else {
        // Draw Virtual Medical IR-Scanner background
        ctx.fillStyle = '#0b0f19';
        ctx.fillRect(0, 0, width, height);

        // Medical scangrid lines
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 30) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += 30) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Circular focal radar grid
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 140, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 220, 0, Math.PI * 2);
        ctx.stroke();

        // Medical crosshairs
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
        ctx.beginPath();
        ctx.moveTo(width / 2 - 20, height / 2);
        ctx.lineTo(width / 2 + 20, height / 2);
        ctx.moveTo(width / 2, height / 2 - 20);
        ctx.lineTo(width / 2, height / 2 + 20);
        ctx.stroke();
      }

      // Calculate dynamic pupil diameters based on Phase and Pathology
      let currentLeft = 4.4;
      let currentRight = 4.4;

      if (phaseRef.current === 'BASELINE' || phaseRef.current === 'CALIBRATING') {
        currentLeft = 4.4 + Math.sin(now / 150) * 0.03 + (Math.random() - 0.5) * 0.01;
        currentRight = (selectedPathology === 'RED' ? 5.0 : 4.4) + Math.sin(now / 140) * 0.03 + (Math.random() - 0.5) * 0.01;
      } else if (phaseRef.current === 'FLASH') {
        // Severe constriction
        const elapsed = now - scanStartTimeRef.current - 1500;
        const progress = Math.min(1, elapsed / 500);
        
        const targetLeftMin = 2.0;
        const targetRightMin = selectedPathology === 'RED' ? 4.8 : selectedPathology === 'YELLOW' ? 3.0 : 2.0;

        currentLeft = 4.4 - (4.4 - targetLeftMin) * Math.sin(progress * (Math.PI / 2));
        currentRight = (selectedPathology === 'RED' ? 5.0 : 4.4) - ((selectedPathology === 'RED' ? 5.0 : 4.4) - targetRightMin) * Math.sin(progress * (Math.PI / 2));
      } else if (phaseRef.current === 'RECOVERY' || phaseRef.current === 'ANALYZING') {
        const elapsed = now - scanStartTimeRef.current - 2000;
        const progress = Math.min(1, elapsed / 2000);

        const minLeft = 2.0;
        const minRight = selectedPathology === 'RED' ? 4.8 : selectedPathology === 'YELLOW' ? 3.0 : 2.0;

        const baseR = selectedPathology === 'RED' ? 5.0 : 4.4;

        currentLeft = minLeft + (4.4 - minLeft) * 0.35 * progress;
        currentRight = minRight + (baseR - minRight) * (selectedPathology === 'RED' ? 0.08 : 0.28) * progress;
      }

      setLiveLeftDiameter(parseFloat(currentLeft.toFixed(2)));
      setLiveRightDiameter(parseFloat(currentRight.toFixed(2)));

      // Dynamic facial droop tracker display
      const targetSymmetry = selectedPathology === 'RED' ? 71.3 : selectedPathology === 'YELLOW' ? 89.1 : 97.4;
      setFacialAlignmentScore(parseFloat((targetSymmetry + Math.sin(now / 200) * 0.4).toFixed(1)));

      // DRAW BIO-TELEMETRY WIREFRAME OVERLAY (Green/Teal Matrix Theme)
      const centerX = width / 2;
      const centerY = height / 2;

      // Draw vector face contour
      ctx.strokeStyle = phaseRef.current === 'FLASH' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(34, 197, 94, 0.35)';
      ctx.lineWidth = 1.5;
      
      // Face shape curve
      ctx.beginPath();
      ctx.moveTo(centerX - 100, centerY - 140);
      ctx.bezierCurveTo(centerX - 150, centerY - 80, centerX - 130, centerY + 100, centerX, centerY + 160);
      ctx.bezierCurveTo(centerX + 130, centerY + 100, centerX + 150, centerY - 80, centerX + 100, centerY - 140);
      ctx.closePath();
      ctx.stroke();

      // Facial central midline
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 160);
      ctx.lineTo(centerX, centerY + 180);
      ctx.stroke();
      ctx.setLineDash([]);

      // Symmetric reference lines (eyebrow, eyes, nose, mouth)
      const eyebrowY = centerY - 60;
      const eyeY = centerY - 25;
      const noseY = centerY + 30;
      const mouthY = selectedPathology === 'RED' ? centerY + 85 : centerY + 80; // Slanted mouth in pathological case!
      const mouthLeftY = centerY + 80;
      const mouthRightY = selectedPathology === 'RED' ? centerY + 90 : centerY + 80; // Right droop

      ctx.strokeStyle = 'rgba(34, 197, 94, 0.15)';
      
      // Eyebrows
      ctx.beginPath();
      ctx.moveTo(centerX - 90, eyebrowY);
      ctx.lineTo(centerX - 20, eyebrowY - 5);
      ctx.moveTo(centerX + 20, eyebrowY - 5);
      ctx.lineTo(centerX + 90, selectedPathology === 'RED' ? eyebrowY + 8 : eyebrowY); // Drooped eyebrow
      ctx.stroke();

      // Eyes positions
      const eyeLX = centerX - 55;
      const eyeRX = centerX + 55;

      // Draw Eyeball Boundaries
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
      ctx.beginPath();
      ctx.arc(eyeLX, eyeY, 16, 0, Math.PI * 2);
      ctx.arc(eyeRX, eyeY, 16, 0, Math.PI * 2);
      ctx.stroke();

      // Draw Irises (Outer Pupil Bounding Ring)
      ctx.fillStyle = 'rgba(34, 197, 94, 0.08)';
      ctx.beginPath();
      ctx.arc(eyeLX, eyeY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(eyeRX, eyeY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw Dynamic Pupils (Black solid centers)
      const pupilScaleFactor = 2.4; // conversion of mm to drawn pixels
      const drawRadiusL = Math.max(2, currentLeft * pupilScaleFactor);
      const drawRadiusR = Math.max(2, currentRight * pupilScaleFactor);

      ctx.fillStyle = '#020617'; // Pupil blackness
      ctx.beginPath();
      ctx.arc(eyeLX, eyeY, drawRadiusL, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.9)';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(eyeRX, eyeY, drawRadiusR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.9)';
      ctx.stroke();

      // Pupil reflex metrics labels
      ctx.fillStyle = '#22c55e';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`L: ${currentLeft.toFixed(2)}mm`, eyeLX - 25, eyeY - 24);
      ctx.fillText(`R: ${currentRight.toFixed(2)}mm`, eyeRX - 25, eyeY - 24);

      // Nose bridge and tip
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.35)';
      ctx.beginPath();
      ctx.moveTo(centerX, eyeY - 10);
      ctx.lineTo(centerX - 5, noseY - 5);
      ctx.lineTo(centerX + 5, noseY - 5);
      ctx.closePath();
      ctx.stroke();

      // Mouth landmark
      ctx.beginPath();
      ctx.moveTo(centerX - 40, mouthLeftY);
      ctx.quadraticCurveTo(centerX, mouthY + (selectedPathology === 'RED' ? 5 : 8), centerX + 40, mouthRightY);
      ctx.stroke();

      // Draw landmark mesh connection dots
      ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
      const points = [
        [centerX - 55, eyeY], [centerX + 55, eyeY], // centers
        [centerX - 90, eyebrowY], [centerX - 55, eyebrowY - 4], [centerX - 20, eyebrowY - 5], // left eyebrow
        [centerX + 20, eyebrowY - 5], [centerX + 55, selectedPathology === 'RED' ? eyebrowY + 4 : eyebrowY - 4], [centerX + 90, selectedPathology === 'RED' ? eyebrowY + 8 : eyebrowY], // right eyebrow
        [centerX - 40, mouthLeftY], [centerX, mouthY], [centerX + 40, mouthRightY], // mouth
        [centerX - 5, noseY - 5], [centerX + 5, noseY - 5], [centerX, eyeY - 10] // nose
      ];

      points.forEach(([px, py]) => {
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Scanline effect
      ctx.fillStyle = 'rgba(99, 102, 241, 0.04)';
      const scanY = (now / 6) % height;
      ctx.fillRect(0, scanY, width, 4);

      // Draw bounding lock frame
      ctx.strokeStyle = phaseRef.current === 'FLASH' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(99, 102, 241, 0.4)';
      ctx.lineWidth = 2;
      const cornerSize = 25;
      const pad = 15;

      // Top Left Corner
      ctx.beginPath();
      ctx.moveTo(pad + cornerSize, pad);
      ctx.lineTo(pad, pad);
      ctx.lineTo(pad, pad + cornerSize);
      ctx.stroke();

      // Top Right Corner
      ctx.beginPath();
      ctx.moveTo(width - pad - cornerSize, pad);
      ctx.lineTo(width - pad, pad);
      ctx.lineTo(width - pad, pad + cornerSize);
      ctx.stroke();

      // Bottom Left Corner
      ctx.beginPath();
      ctx.moveTo(pad + cornerSize, height - pad);
      ctx.lineTo(pad, height - pad);
      ctx.lineTo(pad, height - pad - cornerSize);
      ctx.stroke();

      // Bottom Right Corner
      ctx.beginPath();
      ctx.moveTo(width - pad - cornerSize, height - pad);
      ctx.lineTo(width - pad, height - pad);
      ctx.lineTo(width - pad, height - pad - cornerSize);
      ctx.stroke();

      animationFrameRef.current = requestAnimationFrame(drawLoop);
    };

    animationFrameRef.current = requestAnimationFrame(drawLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cameraState, useVirtualFeed, selectedPathology, phase]);

  // Timed screening sequence execution
  const startScreeningSequence = () => {
    setPhase('CALIBRATING');
    phaseRef.current = 'CALIBRATING';
    setProgress(5);
    scanStartTimeRef.current = performance.now();

    // 0ms - 1000ms: Calibrating lighting and pose
    setTimeout(() => {
      setPhase('BASELINE');
      phaseRef.current = 'BASELINE';
      setProgress(25);
    }, 1000);

    // 1000ms - 2200ms: Recording baseline settling parameters
    setTimeout(() => {
      setPhase('FLASH');
      phaseRef.current = 'FLASH';
      setProgress(50);
    }, 2200);

    // 2200ms - 2700ms: Flash stimulus active (500ms duration)
    setTimeout(() => {
      setPhase('RECOVERY');
      phaseRef.current = 'RECOVERY';
      setProgress(75);
    }, 2700);

    // 2700ms - 4200ms: Recovery kinetics track
    setTimeout(() => {
      setPhase('ANALYZING');
      phaseRef.current = 'ANALYZING';
      setProgress(95);
    }, 4200);

    // 4200ms - 5200ms: Final synthesis compiling
    setTimeout(() => {
      setPhase('IDLE');
      phaseRef.current = 'IDLE';
      setProgress(100);

      // Create high-fidelity clinically structured report
      const result = createScanResult(patientName, patientId, selectedPathology, true);
      onScanComplete(result);
    }, 5200);
  };

  return (
    <div id="scan-view-panel" className="max-w-5xl mx-auto px-4 py-6 text-gray-200 space-y-6 relative h-full z-10">
      
      {/* FULL-SCREEN FLASH STIMULUS OVERLAY */}
      {phase === 'FLASH' && (
        <div id="flash-stimulus-bright" className="fixed inset-0 bg-white z-50 animate-fade-out pointer-events-none flex items-center justify-center">
          <div className="text-black font-mono font-bold text-2xl uppercase tracking-[0.2em] bg-white px-10 py-5 rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.8)] scale-110 border border-white/20">
            STIMULATING RETINA...
          </div>
        </div>
      )}

      {/* Screen Header */}
      <header className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${cameraState === 'active' ? 'bg-cyan-400' : 'bg-amber-400'} animate-pulse`}></span>
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
              {cameraState === 'active' ? `Device HD Camera: Active (${fps} FPS)` : `Virtual Infrared Simulator Active (${fps} FPS)`}
            </span>
          </div>
          <h1 className="text-base font-bold text-white uppercase tracking-wider mt-1.5">
            Active Screening: {patientName}
          </h1>
          <p className="text-[10px] text-white/40 font-mono tracking-wider mt-0.5">ID Reference: {patientId}</p>
        </div>
        <button 
          id="btn-abort-scan"
          onClick={onCancel}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/75 border border-white/10 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </header>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Panel: Camera Viewport */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/60 aspect-video shadow-2xl flex items-center justify-center">
            
            {/* Real HTML5 Video element */}
            <video 
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover hidden"
            />

            {/* Rendering Overlay Canvas */}
            <canvas 
              ref={canvasRef}
              width={640}
              height={360}
              className="w-full h-full object-cover z-10"
            />

            {/* Tracking Status Badge */}
            {faceDetected && (
              <div className="absolute top-4 left-4 z-20 px-3.5 py-1.5 rounded-full bg-cyan-400/5 border border-cyan-400/30 text-cyan-400 text-[9px] font-mono font-bold tracking-widest flex items-center gap-1.5 backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                <CheckCircle2 className="w-3.5 h-3.5 animate-pulse" /> TARGET LOCK OK
              </div>
            )}

            {/* Scan Sequence Sub-State Progress Info Overlay */}
            {phase !== 'IDLE' && (
              <div className="absolute bottom-4 left-4 right-4 z-20 p-5 rounded-2xl bg-black/80 border border-white/10 backdrop-blur-md flex flex-col gap-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-cyan-400 font-bold tracking-widest text-[9px] flex items-center gap-1.5 uppercase">
                    <Activity className="w-3.5 h-3.5 animate-spin" />
                    {phase === 'CALIBRATING' && 'CALIBRATING POSE & LIGHTING...'}
                    {phase === 'BASELINE' && 'RECORDING PRE-STIMULUS REFLEX...'}
                    {phase === 'FLASH' && 'TRIGGERING FLASH STIMULATION (500ms)...'}
                    {phase === 'RECOVERY' && 'RECORDING RESPONSE & DILATION RECOVERY...'}
                    {phase === 'ANALYZING' && 'COMPUTING DEVIATION GRADIENTS...'}
                  </span>
                  <span className="font-mono text-white/80 font-bold text-[10px]">{progress}%</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Core Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {phase === 'IDLE' ? (
              <button
                id="btn-trigger-scan-sequence"
                onClick={startScreeningSequence}
                className="flex-1 py-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_35px_rgba(34,211,238,0.45)] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-black animate-pulse" /> Start Clinical Screening (4s)
              </button>
            ) : (
              <div className="flex-1 py-4 rounded-xl bg-black/40 border border-white/10 text-center font-mono text-xs text-cyan-400 font-bold tracking-[0.2em] flex items-center justify-center gap-2.5">
                <Activity className="w-4 h-4 animate-spin" /> SCANNING UNDERWAY — KEEP STEADY
              </div>
            )}

            <button
              id="btn-trigger-recalibrate"
              onClick={startCamera}
              disabled={phase !== 'IDLE'}
              className="px-5 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-[0.2em] transition-all border border-white/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            >
              <RotateCcw className="w-4 h-4" /> Reset Camera
            </button>
          </div>
        </div>

        {/* Right Panel: Biometric Stats & Developer Sandbox */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Live Biometric Telemetry */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4 backdrop-blur-md">
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/40 flex items-center gap-1.5 mb-2">
              <Eye className="w-4 h-4 text-cyan-400" /> Live Feed Telemetry
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-center">
                <p className="text-[9px] text-white/30 font-mono tracking-widest">LEFT PUPIL</p>
                <p className="text-xl font-mono font-bold text-white mt-0.5">{liveLeftDiameter.toFixed(2)}<span className="text-[10px] text-white/40 font-sans ml-0.5">mm</span></p>
              </div>
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-center">
                <p className="text-[9px] text-white/30 font-mono tracking-widest">RIGHT PUPIL</p>
                <p className="text-xl font-mono font-bold text-white mt-0.5">{liveRightDiameter.toFixed(2)}<span className="text-[10px] text-white/40 font-sans ml-0.5">mm</span></p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex justify-between text-xs items-center">
                <span className="text-white/50 font-light">Facial Symmetry Index</span>
                <span className="font-mono font-bold text-cyan-400 text-xs">{facialAlignmentScore}%</span>
              </div>
              <div className="flex justify-between text-xs items-center">
                <span className="text-white/50 font-light">Eye-to-Iris Distance</span>
                <span className="font-mono text-white/70 text-xs">11.72mm (Calibrated)</span>
              </div>
              <div className="flex justify-between text-xs items-center">
                <span className="text-white/50 font-light">Optic Capture Target</span>
                <span className="font-mono text-cyan-400 font-semibold text-xs flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span> Mapped
                </span>
              </div>
            </div>
          </div>

          {/* STAGE DEMO MODE CONTROLLER (Phase 5 Required) */}
          <div className="p-6 rounded-2xl border border-cyan-500/20 bg-cyan-950/5 shadow-[0_0_25px_rgba(34,211,238,0.05)] space-y-4 relative overflow-hidden">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
                <Sparkles className="w-4 h-4 text-cyan-400" /> Hackathon Demo Toggles
              </div>
              <h3 className="text-xs font-bold text-white tracking-wide mt-1 uppercase">Pre-Scan Scenario Sandbox</h3>
              <p className="text-[11px] text-white/50 leading-relaxed mt-1 font-light">
                Wire up a deterministic diagnostic outcome to test how the diagnostic waveform charts and risk banners render.
              </p>
            </div>

            <div className="space-y-2">
              <button
                id="dev-toggle-pathology-green"
                onClick={() => setSelectedPathology('GREEN')}
                className={`w-full p-3 rounded-xl border text-left text-xs transition flex items-center justify-between cursor-pointer ${
                  selectedPathology === 'GREEN' 
                    ? 'bg-cyan-400/5 border-cyan-400/30 text-cyan-300 font-semibold shadow-sm' 
                    : 'bg-black/40 border-white/5 text-white/40 hover:bg-black/60'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400"></span> Normal Reflex (GREEN Score)
                </span>
                {selectedPathology === 'GREEN' && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
              </button>

              <button
                id="dev-toggle-pathology-yellow"
                onClick={() => setSelectedPathology('YELLOW')}
                className={`w-full p-3 rounded-xl border text-left text-xs transition flex items-center justify-between cursor-pointer ${
                  selectedPathology === 'YELLOW' 
                    ? 'bg-amber-500/5 border-amber-500/30 text-amber-300 font-semibold shadow-sm' 
                    : 'bg-black/40 border-white/5 text-white/40 hover:bg-black/60'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span> Borderline Reaction (YELLOW Score)
                </span>
                {selectedPathology === 'YELLOW' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
              </button>

              <button
                id="dev-toggle-pathology-red"
                onClick={() => setSelectedPathology('RED')}
                className={`w-full p-3 rounded-xl border text-left text-xs transition flex items-center justify-between cursor-pointer ${
                  selectedPathology === 'RED' 
                    ? 'bg-rose-500/5 border-rose-500/30 text-rose-300 font-semibold shadow-sm' 
                    : 'bg-black/40 border-white/5 text-white/40 hover:bg-black/60'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-500"></span> Acute Pathology / Stroke (RED Score)
                </span>
                {selectedPathology === 'RED' && <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />}
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2.5 text-[11px] text-white/50 leading-relaxed font-light">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>Acute Pathology Mode</strong> simulates severe Right Eye Anisocoria (blown sluggish right pupil) and unilateral right facial droop in the diagnostic mesh overlay.
              </span>
            </div>
          </div>

          {/* Quick instructions box */}
          <div className="p-5 rounded-2xl border border-white/5 bg-black/20 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Scanning Protocol</h4>
            <ul className="text-[11px] text-white/50 space-y-2 list-disc pl-4 leading-relaxed font-light">
              <li>Place the patient's face centered within the guide.</li>
              <li>Maintain high/ambient lighting to establish a stable baseline.</li>
              <li>Instruct the patient to stare directly at the screen center.</li>
              <li>Press "Start Scan" and hold the device perfectly steady throughout.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
