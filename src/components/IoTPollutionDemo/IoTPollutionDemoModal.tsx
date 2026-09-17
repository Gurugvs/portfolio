import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Activity,
  Wind,
  Volume2,
  VolumeX,
  Sliders,
  Terminal,
  Cpu,
  Bell,
  Thermometer,
  Droplets,
  Radio,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Code2,
  Sparkles,
} from "lucide-react";

interface IoTPollutionDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type EnvironmentPreset = "clean" | "urban" | "industrial" | "hazardous";

interface SensorData {
  aqi: number;
  co2: number;
  co: number;
  pm25: number;
  pm10: number;
  noiseDb: number;
  temperature: number;
  humidity: number;
  nh3: number;
}

const PRESET_VALUES: Record<EnvironmentPreset, SensorData> = {
  clean: {
    aqi: 28,
    co2: 410,
    co: 0.8,
    pm25: 8,
    pm10: 15,
    noiseDb: 38,
    temperature: 24.2,
    humidity: 52,
    nh3: 4,
  },
  urban: {
    aqi: 88,
    co2: 680,
    co: 4.2,
    pm25: 42,
    pm10: 68,
    noiseDb: 68,
    temperature: 28.5,
    humidity: 58,
    nh3: 18,
  },
  industrial: {
    aqi: 165,
    co2: 1250,
    co: 11.5,
    pm25: 115,
    pm10: 180,
    noiseDb: 86,
    temperature: 32.1,
    humidity: 65,
    nh3: 45,
  },
  hazardous: {
    aqi: 285,
    co2: 2400,
    co: 24.0,
    pm25: 240,
    pm10: 360,
    noiseDb: 98,
    temperature: 36.4,
    humidity: 72,
    nh3: 88,
  },
};

export const IoTPollutionDemoModal: React.FC<IoTPollutionDemoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "controls" | "serial" | "code">("dashboard");
  const [currentPreset, setCurrentPreset] = useState<EnvironmentPreset>("urban");
  const [isLiveStream, setIsLiveStream] = useState<boolean>(true);
  const [soundAlertEnabled, setSoundAlertEnabled] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Sensor state with base initialized from urban preset
  const [sensors, setSensors] = useState<SensorData>(PRESET_VALUES.urban);
  const [noiseThreshold, setNoiseThreshold] = useState<number>(80);
  const [aqiThreshold, setAqiThreshold] = useState<number>(150);

  // Serial logs
  const [logs, setLogs] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const buzzerOscRef = useRef<OscillatorNode | null>(null);
  const packetCountRef = useRef<number>(1420);

  // Sound Alarm helper (Web Audio API)
  const triggerBuzzer = (play: boolean) => {
    if (!soundAlertEnabled) return;
    try {
      if (play) {
        if (!audioCtxRef.current) {
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          audioCtxRef.current = new AudioContextClass();
        }
        if (audioCtxRef.current.state === "suspended") {
          audioCtxRef.current.resume();
        }
        if (!buzzerOscRef.current) {
          const osc = audioCtxRef.current.createOscillator();
          const gain = audioCtxRef.current.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(880, audioCtxRef.current.currentTime);
          gain.gain.setValueAtTime(0.08, audioCtxRef.current.currentTime);
          osc.connect(gain);
          gain.connect(audioCtxRef.current.destination);
          osc.start();
          buzzerOscRef.current = osc;
        }
      } else {
        if (buzzerOscRef.current) {
          buzzerOscRef.current.stop();
          buzzerOscRef.current.disconnect();
          buzzerOscRef.current = null;
        }
      }
    } catch {
      // Audio autoplay policy fallback
    }
  };

  // Check alarm conditions
  const isAlarmTriggered = sensors.noiseDb >= noiseThreshold || sensors.aqi >= aqiThreshold;

  useEffect(() => {
    triggerBuzzer(isAlarmTriggered);
    return () => triggerBuzzer(false);
  }, [isAlarmTriggered, soundAlertEnabled]);

  // Handle Preset Change
  const handlePresetSelect = (preset: EnvironmentPreset) => {
    setCurrentPreset(preset);
    setSensors(PRESET_VALUES[preset]);
    addLog(`[PRESET] Environment switched to '${preset.toUpperCase()}' mode.`);
  };

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${time}] ${msg}`, ...prev.slice(0, 99)]);
  };

  // Real-time jitter simulation loop
  useEffect(() => {
    if (!isOpen || !isLiveStream) return;

    const interval = setInterval(() => {
      packetCountRef.current += 1;
      setSensors((prev) => {
        const jitter = (val: number, percent = 0.03) => {
          const delta = (Math.random() - 0.5) * 2 * (val * percent);
          return Math.max(1, Number((val + delta).toFixed(1)));
        };

        const nextAqi = Math.round(jitter(prev.aqi, 0.02));
        const nextNoise = Math.min(120, Math.max(25, Number((prev.noiseDb + (Math.random() - 0.5) * 2.5).toFixed(1))));
        const nextCo2 = Math.round(jitter(prev.co2, 0.02));
        const nextCo = Number((prev.co + (Math.random() - 0.5) * 0.2).toFixed(1));
        const nextPm25 = Math.round(jitter(prev.pm25, 0.03));
        const nextPm10 = Math.round(jitter(prev.pm10, 0.03));
        const nextTemp = Number((prev.temperature + (Math.random() - 0.5) * 0.05).toFixed(1));
        const nextHumidity = Math.round(jitter(prev.humidity, 0.01));
        const nextNh3 = Math.round(jitter(prev.nh3, 0.02));

        return {
          aqi: nextAqi,
          noiseDb: nextNoise,
          co2: nextCo2,
          co: Math.max(0.1, nextCo),
          pm25: nextPm25,
          pm10: nextPm10,
          temperature: nextTemp,
          humidity: nextHumidity,
          nh3: nextNh3,
        };
      });

      // Serial log packet every 2.5 seconds
      if (packetCountRef.current % 2 === 0) {
        setSensors((current) => {
          const statusStr = current.aqi > aqiThreshold || current.noiseDb > noiseThreshold ? "CRITICAL_ALERT" : "NORMAL";
          addLog(
            `UART_TX #PKT_${packetCountRef.current}: AQI=${current.aqi} | NOISE=${current.noiseDb}dB | CO2=${current.co2}ppm | CO=${current.co}ppm | PM2.5=${current.pm25}ug/m3 | STAT=${statusStr}`
          );
          return current;
        });
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [isOpen, isLiveStream, aqiThreshold, noiseThreshold]);

  // Audio oscilloscope / waveform canvas animation
  useEffect(() => {
    if (!isOpen || activeTab !== "dashboard") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const renderWave = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const amplitude = Math.min(height / 2.2, (sensors.noiseDb / 100) * (height / 2.2));
      const frequency = 0.04 + (sensors.noiseDb / 100) * 0.05;

      // Glow backdrop
      ctx.shadowBlur = isAlarmTriggered ? 14 : 8;
      ctx.shadowColor = isAlarmTriggered ? "#ef4444" : "#8b5cf6";

      // Draw primary wave
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isAlarmTriggered ? "#ef4444" : "#a855f7";

      for (let x = 0; x < width; x++) {
        const y =
          height / 2 +
          Math.sin(x * frequency + phase) * amplitude * Math.sin((x / width) * Math.PI) +
          (Math.random() - 0.5) * (sensors.noiseDb > 75 ? 6 : 2);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Secondary ghost wave
      ctx.beginPath();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = isAlarmTriggered ? "rgba(239, 68, 68, 0.4)" : "rgba(59, 130, 246, 0.4)";
      for (let x = 0; x < width; x++) {
        const y =
          height / 2 +
          Math.cos(x * (frequency * 0.8) - phase * 1.2) * (amplitude * 0.6) * Math.sin((x / width) * Math.PI);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += 0.08 + (sensors.noiseDb / 100) * 0.05;
      animId = requestAnimationFrame(renderWave);
    };

    renderWave();
    return () => cancelAnimationFrame(animId);
  }, [isOpen, activeTab, sensors.noiseDb, isAlarmTriggered]);

  // AQI Rating and Color
  const aqiInfo = useMemo(() => {
    const aqi = sensors.aqi;
    if (aqi <= 50) return { label: "Good", color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30", bar: "bg-emerald-500" };
    if (aqi <= 100) return { label: "Moderate", color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/30", bar: "bg-amber-500" };
    if (aqi <= 150) return { label: "Unhealthy for Sensitive Groups", color: "text-orange-400", bg: "bg-orange-500/15 border-orange-500/30", bar: "bg-orange-500" };
    if (aqi <= 200) return { label: "Unhealthy", color: "text-rose-500", bg: "bg-rose-500/15 border-rose-500/30", bar: "bg-rose-500" };
    if (aqi <= 300) return { label: "Very Unhealthy", color: "text-purple-400", bg: "bg-purple-500/15 border-purple-500/30", bar: "bg-purple-500" };
    return { label: "Hazardous", color: "text-red-600", bg: "bg-red-600/20 border-red-600/40 animate-pulse", bar: "bg-red-600" };
  }, [sensors.aqi]);

  // Noise Status and Color
  const noiseInfo = useMemo(() => {
    const db = sensors.noiseDb;
    if (db < 50) return { label: "Quiet Room", color: "text-emerald-400", desc: "Safe ambient level" };
    if (db < 70) return { label: "Normal Conversation", color: "text-blue-400", desc: "Standard indoor / office" };
    if (db < 85) return { label: "Heavy Traffic / Urban", color: "text-amber-400", desc: "Elevated noise level" };
    return { label: "Hazardous / High Noise", color: "text-red-500", desc: "Buzzer siren threshold triggered" };
  }, [sensors.noiseDb]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9990] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`relative w-full ${
            isFullscreen ? "max-w-none h-full m-0 rounded-none" : "max-w-6xl max-h-[92vh] rounded-[2rem]"
          } bg-neutral-950/95 border border-white/15 text-foreground shadow-2xl overflow-hidden flex flex-col`}
        >
          {/* Top Status Header */}
          <div className="px-4 py-2.5 border-b border-white/10 bg-neutral-900/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    Air & Noise Pollution IoT Telemetry Live Simulator
                  </h3>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    ONLINE (115200 Baud)
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate max-w-xs sm:max-w-none">
                  Arduino Uno R3 • ESP8266 • MQ-135 • MQ-7 • KY-037 • DHT11
                </p>
              </div>
            </div>

            {/* Actions & Preset Bar */}
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={() => setSoundAlertEnabled(!soundAlertEnabled)}
                className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
                  soundAlertEnabled
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-white/5 text-neutral-400 border-white/10 hover:bg-white/10"
                }`}
                title="Toggle Web Audio Alarm Buzzer"
              >
                {soundAlertEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{soundAlertEnabled ? "Alarm Sound ON" : "Alarm Muted"}</span>
              </button>

              <button
                onClick={() => setIsLiveStream(!isLiveStream)}
                className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
                  isLiveStream
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-neutral-800 text-neutral-400 border-white/10"
                }`}
              >
                {isLiveStream ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isLiveStream ? "Streaming" : "Paused"}</span>
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 transition-colors"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-neutral-300 border border-white/10 transition-colors"
                title="Close Demo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Preset Environment Selector Bar */}
          <div className="px-4 py-1.5 bg-neutral-900/40 border-b border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-neutral-400">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-medium">Simulation Presets:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "clean", label: "🍃 Clean Nature Park", aqi: "28 AQI" },
                { id: "urban", label: "🚗 City Traffic", aqi: "88 AQI" },
                { id: "industrial", label: "🏭 Industrial Zone", aqi: "165 AQI" },
                { id: "hazardous", label: "⚠️ Toxic Gas / Emergency", aqi: "285 AQI" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePresetSelect(p.id as EnvironmentPreset)}
                  className={`px-2.5 py-1 rounded-md border font-medium transition-all ${
                    currentPreset === p.id
                      ? "bg-primary text-white border-primary shadow-md shadow-primary/25"
                      : "bg-white/5 text-neutral-300 border-white/10 hover:bg-white/10"
                  }`}
                >
                  {p.label} <span className="opacity-70 ml-1 text-[11px]">({p.aqi})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 bg-neutral-950 px-4 gap-1 pt-1.5">
            {[
              { id: "dashboard", label: "Live Telemetry Dashboard", icon: Activity },
              { id: "controls", label: "Interactive Hardware Sliders", icon: Sliders },
              { id: "serial", label: "Raw UART Serial Monitor", icon: Terminal },
              { id: "code", label: "Embedded C++ Firmware", icon: Code2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-1.5 border-t-2 ${
                    isActive
                      ? "border-primary bg-neutral-900/90 text-white shadow-sm"
                      : "border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-primary" : ""}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Modal Main Content Body */}
          <div className="p-4 overflow-y-auto flex-1 space-y-4">
            {/* TAB 1: LIVE DASHBOARD */}
            {activeTab === "dashboard" && (
              <div className="space-y-3">
                {/* Alarm Banner if Triggered */}
                {isAlarmTriggered && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 flex items-center justify-between gap-3 shadow-lg shadow-red-900/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center text-white animate-bounce shrink-0">
                        <Bell className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm sm:text-base text-red-100 flex items-center gap-2">
                          CRITICAL ENVIRONMENTAL ALARM ACTIVE
                        </h4>
                        <p className="text-xs text-red-300">
                          {sensors.aqi >= aqiThreshold ? `Air Quality Index exceeded safety threshold (${sensors.aqi} >= ${aqiThreshold}). ` : ""}
                          {sensors.noiseDb >= noiseThreshold ? `Decibel level exceeded threshold (${sensors.noiseDb}dB >= ${noiseThreshold}dB). ` : ""}
                          Piezo buzzer active & RGB warning LED blinking red.
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-red-500 text-white uppercase tracking-wider animate-pulse">
                      SIREN ON
                    </span>
                  </motion.div>
                )}

                {/* Top Metrics Row: AQI Gauge + Decibel Audio Meter */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                  {/* AQI Master Card (7 Cols) */}
                  <div className="lg:col-span-6 bg-neutral-900/60 border border-white/10 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-primary/20 text-primary border border-primary/30">
                          <Wind className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-white">Air Quality Index (AQI)</h4>
                          <p className="text-[11px] text-muted-foreground">Calibrated Multi-Gas (MQ-135 + MQ-7)</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${aqiInfo.bg} ${aqiInfo.color}`}>
                        {aqiInfo.label}
                      </span>
                    </div>

                    <div className="flex items-end justify-between my-2 gap-4">
                      <div>
                        <span className="text-5xl sm:text-6xl font-black text-white tracking-tight">
                          {sensors.aqi}
                        </span>
                        <span className="text-xs text-neutral-400 ml-1.5 font-medium">/ 500 AQI</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-neutral-400 block mb-1">Health Advisory</span>
                        <p className="text-xs font-medium text-white max-w-[200px] leading-relaxed">
                          {sensors.aqi < 50
                            ? "Air quality is satisfactory with little to no risk."
                            : sensors.aqi < 100
                            ? "Acceptable; sensitive individuals should monitor outdoor exposure."
                            : sensors.aqi < 200
                            ? "Adverse health effects likely for sensitive groups."
                            : "Emergency conditions; severe risk for general population."}
                        </p>
                      </div>
                    </div>

                    {/* Dynamic AQI Spectrum Bar */}
                    <div className="space-y-1 mt-1">
                      <div className="h-3 w-full bg-neutral-800 rounded-full overflow-hidden p-0.5 flex gap-1">
                        <div className="h-full bg-emerald-500 rounded-l-full" style={{ width: "15%" }} title="Good (0-50)" />
                        <div className="h-full bg-amber-500" style={{ width: "20%" }} title="Moderate (51-100)" />
                        <div className="h-full bg-orange-500" style={{ width: "20%" }} title="Sensitive (101-150)" />
                        <div className="h-full bg-rose-500" style={{ width: "20%" }} title="Unhealthy (151-200)" />
                        <div className="h-full bg-purple-500" style={{ width: "15%" }} title="Very Unhealthy (201-300)" />
                        <div className="h-full bg-red-700 rounded-r-full" style={{ width: "10%" }} title="Hazardous (300+)" />
                      </div>
                      <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                        <span>0 (Clean)</span>
                        <span>100</span>
                        <span>200</span>
                        <span>300</span>
                        <span>500+ (Hazard)</span>
                      </div>
                    </div>
                  </div>

                  {/* Noise Decibel Meter + Live Oscilloscope (6 Cols) */}
                  <div className="lg:col-span-6 bg-neutral-900/60 border border-white/10 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          <Volume2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-white">Acoustic Noise Sensor (KY-037)</h4>
                          <p className="text-[11px] text-muted-foreground">Sound Pressure Level & Real-Time Waveform</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${noiseInfo.color} bg-white/5 border border-white/10`}>
                        {noiseInfo.label}
                      </span>
                    </div>

                    {/* Live Oscilloscope Waveform Canvas */}
                    <div className="my-1.5 h-16 w-full bg-neutral-950/80 rounded-lg border border-white/5 relative overflow-hidden flex items-center justify-center">
                      <canvas ref={canvasRef} width={450} height={96} className="w-full h-full block" />
                      <div className="absolute top-2 left-2 text-[10px] font-mono text-neutral-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                        AUDIO_SAMPLER_44.1kHz
                      </div>
                      <div className="absolute bottom-2 right-2 text-xs font-mono font-bold text-white">
                        {sensors.noiseDb} dB SPL
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
                      <span>Threshold: <strong className="text-white">{noiseThreshold} dB</strong></span>
                      <span className={sensors.noiseDb >= noiseThreshold ? "text-red-400 font-bold" : "text-emerald-400"}>
                        {sensors.noiseDb >= noiseThreshold ? "⚠️ EXCEEDS NOISE LIMIT" : "✓ Within Safe Exposure"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sensor Telemetry Grid (6 Detailed Sub-Metrics) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {/* CO2 */}
                  <div className="p-3 rounded-lg bg-neutral-900/40 border border-white/10 flex flex-col justify-between">
                    <span className="text-[10px] font-semibold text-neutral-400">CO₂</span>
                    <div className="my-1">
                      <span className="text-xl font-bold text-white">{sensors.co2}</span>
                      <span className="text-[11px] text-neutral-400 ml-1">ppm</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-mono">Sensor: MQ-135</span>
                  </div>

                  {/* Carbon Monoxide */}
                  <div className="p-3 rounded-lg bg-neutral-900/40 border border-white/10 flex flex-col justify-between">
                    <span className="text-[10px] font-semibold text-neutral-400">CO</span>
                    <div className="my-1">
                      <span className={`text-xl font-bold ${sensors.co > 9 ? "text-red-400" : "text-white"}`}>
                        {sensors.co}
                      </span>
                      <span className="text-[11px] text-neutral-400 ml-1">ppm</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-mono">Sensor: MQ-7</span>
                  </div>

                  {/* PM2.5 Fine Dust */}
                  <div className="p-3 rounded-lg bg-neutral-900/40 border border-white/10 flex flex-col justify-between">
                    <span className="text-[10px] font-semibold text-neutral-400">PM2.5</span>
                    <div className="my-1">
                      <span className="text-xl font-bold text-white">{sensors.pm25}</span>
                      <span className="text-[11px] text-neutral-400 ml-1">µg/m³</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-mono">Laser Dust Module</span>
                  </div>

                  {/* NH3 Ammonia */}
                  <div className="p-3 rounded-lg bg-neutral-900/40 border border-white/10 flex flex-col justify-between">
                    <span className="text-[10px] font-semibold text-neutral-400">NH₃</span>
                    <div className="my-1">
                      <span className="text-xl font-bold text-white">{sensors.nh3}</span>
                      <span className="text-[11px] text-neutral-400 ml-1">ppm</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-mono">Sensor: MQ-135</span>
                  </div>

                  {/* Temperature */}
                  <div className="p-3 rounded-lg bg-neutral-900/40 border border-white/10 flex flex-col justify-between">
                    <span className="text-[10px] font-semibold text-neutral-400 flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-amber-400" /> Temp
                    </span>
                    <div className="my-1">
                      <span className="text-xl font-bold text-white">{sensors.temperature}</span>
                      <span className="text-[11px] text-neutral-400 ml-1">°C</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-mono">DHT11 Sensor</span>
                  </div>

                  {/* Humidity */}
                  <div className="p-3 rounded-lg bg-neutral-900/40 border border-white/10 flex flex-col justify-between">
                    <span className="text-[10px] font-semibold text-neutral-400 flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-blue-400" /> Humidity
                    </span>
                    <div className="my-1">
                      <span className="text-xl font-bold text-white">{sensors.humidity}</span>
                      <span className="text-[11px] text-neutral-400 ml-1">% RH</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-mono">DHT11 Sensor</span>
                  </div>
                </div>

                {/* Simulated Physical Hardware Rig: 16x2 LCD + LEDs + Relay */}
                <div className="p-3 rounded-xl bg-neutral-900/80 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
                  {/* 16x2 LCD Display Emulator */}
                  <div className="w-full md:w-1/2 p-3 rounded-lg bg-emerald-950/80 border-2 border-emerald-500/40 font-mono shadow-inner">
                    <div className="flex items-center justify-between text-[10px] text-emerald-400/70 border-b border-emerald-500/20 pb-1 mb-1">
                      <span>HD44780 16x2 LCD (I2C 0x27)</span>
                      <span>BACKLIGHT: ON</span>
                    </div>
                    <p className="text-sm font-bold text-emerald-300 tracking-wider">
                      AQI:{sensors.aqi.toString().padEnd(3)} NOISE:{sensors.noiseDb.toFixed(0)}dB
                    </p>
                    <p className="text-sm font-bold text-emerald-300 tracking-wider">
                      {isAlarmTriggered ? "!! ALARM ALERT !!" : `T:${sensors.temperature}C H:${sensors.humidity}%`}
                    </p>
                  </div>

                  {/* Actuators & Relay Status Indicators */}
                  <div className="w-full md:w-1/2 grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-neutral-950 border border-white/5 flex flex-col items-center justify-center">
                      <span className="text-[10px] text-neutral-400 mb-1">Piezo Buzzer</span>
                      <div className={`w-4 h-4 rounded-full mb-1.5 ${isAlarmTriggered ? "bg-red-500 animate-ping" : "bg-neutral-700"}`} />
                      <span className={`text-xs font-bold ${isAlarmTriggered ? "text-red-400" : "text-neutral-500"}`}>
                        {isAlarmTriggered ? "SIREN 880Hz" : "OFF"}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-neutral-950 border border-white/5 flex flex-col items-center justify-center">
                      <span className="text-[10px] text-neutral-400 mb-1">RGB LED Pin 9</span>
                      <div
                        className={`w-4 h-4 rounded-full mb-1.5 shadow-md ${
                          isAlarmTriggered
                            ? "bg-red-500 shadow-red-500/50"
                            : sensors.aqi > 100
                            ? "bg-amber-400 shadow-amber-400/50"
                            : "bg-emerald-400 shadow-emerald-400/50"
                        }`}
                      />
                      <span className="text-xs font-bold text-white">
                        {isAlarmTriggered ? "RED BLINK" : sensors.aqi > 100 ? "YELLOW" : "GREEN"}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-neutral-950 border border-white/5 flex flex-col items-center justify-center">
                      <span className="text-[10px] text-neutral-400 mb-1">ESP8266 Cloud</span>
                      <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse mb-1.5 shadow-md shadow-blue-500/50" />
                      <span className="text-xs font-bold text-blue-400">MQTT TX 1s</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: INTERACTIVE HARDWARE SLIDERS */}
            {activeTab === "controls" && (
              <div className="space-y-4 max-w-4xl mx-auto">
                <div className="p-3 rounded-xl bg-neutral-900/60 border border-white/10">
                  <h4 className="font-bold text-base text-white mb-1">Manual Sensor Calibration & Stress Testing</h4>
                  <p className="text-xs text-neutral-400">
                    Adjust the physical simulation parameters below to test alarm triggers, buzzer activation, and sensor logic in real time.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Air Quality Slider */}
                  <div className="p-4 rounded-xl bg-neutral-900/40 border border-white/10 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-white flex items-center gap-2">
                        <Wind className="w-4 h-4 text-primary" /> Air Quality Index (AQI)
                      </label>
                      <span className="text-base font-extrabold text-primary font-mono">{sensors.aqi} AQI</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={450}
                      value={sensors.aqi}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setSensors((prev) => ({
                          ...prev,
                          aqi: val,
                          co2: Math.round(val * 8.2),
                          co: Number((val * 0.08).toFixed(1)),
                          pm25: Math.round(val * 0.85),
                        }));
                      }}
                      className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-[11px] text-neutral-500 font-mono">
                      <span>10 (Alpine air)</span>
                      <span>150 (Warning)</span>
                      <span>450 (Extreme)</span>
                    </div>
                  </div>

                  {/* Noise Decibels Slider */}
                  <div className="p-4 rounded-xl bg-neutral-900/40 border border-white/10 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-white flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-purple-400" /> Acoustic Decibel Level (dB)
                      </label>
                      <span className="text-base font-extrabold text-purple-400 font-mono">{sensors.noiseDb} dB</span>
                    </div>
                    <input
                      type="range"
                      min={25}
                      max={115}
                      value={sensors.noiseDb}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setSensors((prev) => ({ ...prev, noiseDb: val }));
                      }}
                      className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="flex justify-between text-[11px] text-neutral-500 font-mono">
                      <span>25 dB (Whisper)</span>
                      <span>80 dB (Threshold)</span>
                      <span>115 dB (Siren/Horn)</span>
                    </div>
                  </div>

                  {/* CO2 PPM */}
                  <div className="p-4 rounded-xl bg-neutral-900/40 border border-white/10 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-white">Carbon Dioxide (CO₂)</label>
                      <span className="text-base font-bold text-white font-mono">{sensors.co2} ppm</span>
                    </div>
                    <input
                      type="range"
                      min={350}
                      max={3500}
                      value={sensors.co2}
                      onChange={(e) => setSensors((prev) => ({ ...prev, co2: Number(e.target.value) }))}
                      className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  {/* Carbon Monoxide */}
                  <div className="p-4 rounded-xl bg-neutral-900/40 border border-white/10 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-white">Carbon Monoxide (CO)</label>
                      <span className="text-base font-bold text-white font-mono">{sensors.co} ppm</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={50}
                      step={0.5}
                      value={sensors.co}
                      onChange={(e) => setSensors((prev) => ({ ...prev, co: Number(e.target.value) }))}
                      className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                </div>

                {/* Threshold Setting Box */}
                <div className="p-4 rounded-xl bg-neutral-900/80 border border-primary/30 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h5 className="font-bold text-white text-sm">Alarm Threshold Triggers</h5>
                    <p className="text-xs text-neutral-400">Configure cutoff values where the buzzer & LEDs sound alarm.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-neutral-400">AQI Cutoff:</span>
                      <input
                        type="number"
                        value={aqiThreshold}
                        onChange={(e) => setAqiThreshold(Number(e.target.value))}
                        className="w-20 px-2 py-1 bg-black/60 border border-white/20 rounded-lg text-white font-mono text-center"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-neutral-400">Noise Cutoff (dB):</span>
                      <input
                        type="number"
                        value={noiseThreshold}
                        onChange={(e) => setNoiseThreshold(Number(e.target.value))}
                        className="w-20 px-2 py-1 bg-black/60 border border-white/20 rounded-lg text-white font-mono text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: RAW UART SERIAL MONITOR */}
            {activeTab === "serial" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>COM3 /dev/ttyUSB0 @ 115200 8N1 (Connected)</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setLogs([])}
                      className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-neutral-300 transition-colors"
                    >
                      Clear Log
                    </button>
                    <button
                      onClick={() => {
                        const content = logs.join("\n");
                        navigator.clipboard.writeText(content);
                        alert("UART Serial Log copied to clipboard!");
                      }}
                      className="px-3 py-1 bg-primary/20 hover:bg-primary/30 border border-primary/40 rounded-lg text-xs text-primary transition-colors"
                    >
                      Copy Logs
                    </button>
                  </div>
                </div>

                <div className="h-64 bg-black/90 border border-white/15 rounded-xl p-3 font-mono text-xs text-emerald-400 overflow-y-auto space-y-0.5 shadow-inner select-text">
                  <p className="text-neutral-500">// -- Embedded C++ Serial Stream Initialized --</p>
                  <p className="text-neutral-500">// Calibration baseline R0 = 10.2k Ohm, Vcc = 5.0V</p>
                  {logs.length === 0 ? (
                    <p className="text-neutral-600">Waiting for next serial packet...</p>
                  ) : (
                    logs.map((line, idx) => (
                      <p
                        key={idx}
                        className={
                          line.includes("CRITICAL") || line.includes("ALERT")
                            ? "text-red-400 font-bold"
                            : line.includes("PRESET")
                            ? "text-yellow-300"
                            : "text-emerald-400/90"
                        }
                      >
                        {line}
                      </p>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: EMBEDDED C++ FIRMWARE CODE */}
            {activeTab === "code" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-primary" /> Arduino Firmware: main.ino (Embedded C/C++)
                  </h4>
                  <span className="text-xs text-neutral-400 font-mono">AVR-GCC • Arduino IDE 2.0</span>
                </div>

                <pre className="p-3 bg-black/90 border border-white/15 rounded-xl font-mono text-xs text-neutral-200 overflow-x-auto leading-relaxed shadow-inner">
{`#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>

#define DHTPIN 4
#define DHTTYPE DHT11
#define PIN_MQ135 A0
#define PIN_MQ7   A1
#define PIN_SOUND A2
#define PIN_BUZZER 8
#define PIN_LED_RED 9
#define PIN_LED_GRN 10

LiquidCrystal_I2C lcd(0x27, 16, 2);
DHT dht(DHTPIN, DHTTYPE);

const float NOISE_THRESHOLD_DB = 80.0;
const int   AQI_THRESHOLD      = 150;

void setup() {
  Serial.begin(115200);
  dht.begin();
  lcd.init();
  lcd.backlight();
  
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_LED_RED, OUTPUT);
  pinMode(PIN_LED_GRN, OUTPUT);
  
  lcd.setCursor(0, 0);
  lcd.print("IoT Air & Noise");
  lcd.setCursor(0, 1);
  lcd.print("Sensor Init...");
  delay(1500);
}

void loop() {
  int mq135Raw = analogRead(PIN_MQ135);
  int mq7Raw   = analogRead(PIN_MQ7);
  int soundRaw = analogRead(PIN_SOUND);
  
  float temp = dht.readTemperature();
  float hum  = dht.readHumidity();
  
  // Calibrated conversions
  float noiseDb = 20.0 * log10(soundRaw + 1) + 25.0;
  int aqi = map(mq135Raw, 100, 900, 20, 350);
  
  bool isAlert = (noiseDb >= NOISE_THRESHOLD_DB) || (aqi >= AQI_THRESHOLD);
  
  if (isAlert) {
    digitalWrite(PIN_BUZZER, HIGH);
    digitalWrite(PIN_LED_RED, HIGH);
    digitalWrite(PIN_LED_GRN, LOW);
  } else {
    digitalWrite(PIN_BUZZER, LOW);
    digitalWrite(PIN_LED_RED, LOW);
    digitalWrite(PIN_LED_GRN, HIGH);
  }
  
  // Telemetry Packet over UART
  Serial.print("AQI:"); Serial.print(aqi);
  Serial.print(" | NOISE:"); Serial.print(noiseDb);
  Serial.print("dB | TEMP:"); Serial.print(temp);
  Serial.print("C | HUM:"); Serial.println(hum);
  
  delay(1000);
}`}
                </pre>
              </div>
            )}
          </div>

          {/* Modal Footer Bar */}
          <div className="px-4 py-2 border-t border-white/10 bg-neutral-900/60 flex items-center justify-between text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Project by <strong>Guru</strong> (IoT & Embedded Systems)</span>
            </div>
            <a
              href="https://github.com/Gurugvs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-semibold"
            >
              View GitHub Repo →
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
