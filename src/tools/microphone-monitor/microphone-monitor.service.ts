// Microphone tester audio analysis utilities
// All functions are pure (no browser dependencies) for testability

export enum VisualizationType {
  Waveform = 'waveform',
  FrequencyBars = 'frequency-bars',
}

export enum MicrophoneStatus {
  Idle = 'idle',
  Listening = 'listening',
  Recording = 'recording',
  Playing = 'playing',
  Error = 'error',
}

export enum SignalStatus {
  NoSignal = 'no-signal',
  Weak = 'weak',
  Good = 'good',
  Strong = 'strong',
  Clipping = 'clipping',
}

/** FFT size for AnalyserNode (must be power of 2) */
export const FFT_SIZE = 2048;

/** Maximum recording duration in seconds */
export const MAX_RECORDING_DURATION_SECONDS = 30;

/** Minimum dB value representing silence */
export const MIN_DB = -100;

/** Signal strength thresholds in dB */
const SIGNAL_THRESHOLDS = {
  NO_SIGNAL: -80,
  WEAK: -40,
  GOOD: -12,
  CLIPPING: -1,
} as const;

export interface AudioMetrics {
  volumeRms: number;
  volumeDb: number;
  volumePercent: number;
  peakDb: number;
  signalStatus: SignalStatus;
}

/**
 * Calculate RMS (Root Mean Square) volume from time-domain data
 * Returns a value between 0 and 1
 */
export function calculateRmsVolume(timeDomainData: Uint8Array): number {
  if (timeDomainData.length === 0) {
    return 0;
  }

  let sumOfSquares = 0;
  for (let i = 0; i < timeDomainData.length; i++) {
    // Convert from 0-255 range to -1 to 1 range
    const sample = timeDomainData[i] ?? 128;
    const normalized = (sample - 128) / 128;
    sumOfSquares += normalized * normalized;
  }

  return Math.sqrt(sumOfSquares / timeDomainData.length);
}

/**
 * Convert RMS value (0-1) to decibels
 * Returns a value between MIN_DB and 0
 */
export function rmsToDecibels(rms: number): number {
  if (rms <= 0) {
    return MIN_DB;
  }
  const db = 20 * Math.log10(rms);
  return Math.max(MIN_DB, Math.min(0, db));
}

/**
 * Convert decibels to a percentage (0-100)
 * Maps MIN_DB..0 dB to 0..100%
 */
export function decibelsToPercent(db: number): number {
  if (db <= MIN_DB) {
    return 0;
  }
  if (db >= 0) {
    return 100;
  }
  return ((db - MIN_DB) / (0 - MIN_DB)) * 100;
}

/**
 * Classify signal strength based on volume in dB
 */
export function classifySignalStrength(volumeDb: number): SignalStatus {
  if (volumeDb >= SIGNAL_THRESHOLDS.CLIPPING) {
    return SignalStatus.Clipping;
  }
  if (volumeDb >= SIGNAL_THRESHOLDS.GOOD) {
    return SignalStatus.Strong;
  }
  if (volumeDb >= SIGNAL_THRESHOLDS.WEAK) {
    return SignalStatus.Good;
  }
  if (volumeDb >= SIGNAL_THRESHOLDS.NO_SIGNAL) {
    return SignalStatus.Weak;
  }
  return SignalStatus.NoSignal;
}

/**
 * Compute all audio metrics from time-domain data
 * @param timeDomainData - Uint8Array from AnalyserNode.getByteTimeDomainData
 * @param previousPeakDb - Previous peak dB value for tracking
 */
export function computeAudioMetrics(timeDomainData: Uint8Array, previousPeakDb: number): AudioMetrics {
  const volumeRms = calculateRmsVolume(timeDomainData);
  const volumeDb = rmsToDecibels(volumeRms);
  const volumePercent = decibelsToPercent(volumeDb);
  const peakDb = Math.max(previousPeakDb, volumeDb);
  const signalStatus = classifySignalStrength(volumeDb);

  return {
    volumeRms,
    volumeDb,
    volumePercent,
    peakDb,
    signalStatus,
  };
}

/**
 * Format dB value for display
 */
export function formatVolumeDb(db: number): string {
  if (db <= MIN_DB) {
    return '-\u221E dB';
  }
  return `${db.toFixed(1)} dB`;
}

/**
 * Format volume percentage for display
 */
export function formatVolumePercent(percent: number): string {
  return `${Math.round(percent)}%`;
}

/**
 * Format duration in seconds to mm:ss
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get the i18n key for a signal status
 */
export function getSignalStatusI18nKey(status: SignalStatus): string {
  const keys: Record<SignalStatus, string> = {
    [SignalStatus.NoSignal]: 'signalNoSignal',
    [SignalStatus.Weak]: 'signalWeak',
    [SignalStatus.Good]: 'signalGood',
    [SignalStatus.Strong]: 'signalStrong',
    [SignalStatus.Clipping]: 'signalClipping',
  };
  return keys[status];
}

/**
 * Get the Tailwind CSS color class for a signal status
 */
export function getSignalStatusColor(status: SignalStatus): string {
  const colors: Record<SignalStatus, string> = {
    [SignalStatus.NoSignal]: 'text-muted-foreground',
    [SignalStatus.Weak]: 'text-yellow-500',
    [SignalStatus.Good]: 'text-green-500',
    [SignalStatus.Strong]: 'text-blue-500',
    [SignalStatus.Clipping]: 'text-red-500',
  };
  return colors[status];
}

/**
 * Get the Tailwind CSS background class for volume bar based on signal status
 */
export function getVolumeBarColor(status: SignalStatus): string {
  const colors: Record<SignalStatus, string> = {
    [SignalStatus.NoSignal]: 'bg-muted-foreground',
    [SignalStatus.Weak]: 'bg-yellow-500',
    [SignalStatus.Good]: 'bg-green-500',
    [SignalStatus.Strong]: 'bg-blue-500',
    [SignalStatus.Clipping]: 'bg-red-500',
  };
  return colors[status];
}
