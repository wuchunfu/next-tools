import { describe, expect, it } from 'vitest';
import {
  FFT_SIZE,
  MAX_RECORDING_DURATION_SECONDS,
  MIN_DB,
  MicrophoneStatus,
  SignalStatus,
  VisualizationType,
  calculateRmsVolume,
  classifySignalStrength,
  computeAudioMetrics,
  decibelsToPercent,
  formatDuration,
  formatVolumeDb,
  formatVolumePercent,
  getSignalStatusColor,
  getSignalStatusI18nKey,
  getVolumeBarColor,
  rmsToDecibels,
} from './microphone-monitor.service';

describe('microphone-tester service', () => {
  describe('enums', () => {
    it('should have correct VisualizationType values', () => {
      expect(VisualizationType.Waveform).toBe('waveform');
      expect(VisualizationType.FrequencyBars).toBe('frequency-bars');
    });

    it('should have correct MicrophoneStatus values', () => {
      expect(MicrophoneStatus.Idle).toBe('idle');
      expect(MicrophoneStatus.Listening).toBe('listening');
      expect(MicrophoneStatus.Recording).toBe('recording');
      expect(MicrophoneStatus.Playing).toBe('playing');
      expect(MicrophoneStatus.Error).toBe('error');
    });

    it('should have correct SignalStatus values', () => {
      expect(SignalStatus.NoSignal).toBe('no-signal');
      expect(SignalStatus.Weak).toBe('weak');
      expect(SignalStatus.Good).toBe('good');
      expect(SignalStatus.Strong).toBe('strong');
      expect(SignalStatus.Clipping).toBe('clipping');
    });
  });

  describe('constants', () => {
    it('should have FFT_SIZE as power of 2', () => {
      expect(FFT_SIZE).toBe(2048);
      expect(Math.log2(FFT_SIZE) % 1).toBe(0);
    });

    it('should have reasonable MAX_RECORDING_DURATION_SECONDS', () => {
      expect(MAX_RECORDING_DURATION_SECONDS).toBe(30);
    });

    it('should have negative MIN_DB', () => {
      expect(MIN_DB).toBe(-100);
    });
  });

  describe('calculateRmsVolume', () => {
    it('should return 0 for empty data', () => {
      expect(calculateRmsVolume(new Uint8Array(0))).toBe(0);
    });

    it('should return 0 for silence (all values at 128)', () => {
      const silence = new Uint8Array(256).fill(128);
      expect(calculateRmsVolume(silence)).toBe(0);
    });

    it('should return ~1 for maximum amplitude (all values at 0 or 255)', () => {
      // All at 0 means normalized to -1, squared = 1, mean = 1, sqrt = 1
      const maxNeg = new Uint8Array(256).fill(0);
      const rms = calculateRmsVolume(maxNeg);
      expect(rms).toBeCloseTo(1, 1);
    });

    it('should return value between 0 and 1 for typical audio', () => {
      // Create a sine-like pattern
      const data = new Uint8Array(256);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.round(128 + 64 * Math.sin((2 * Math.PI * i) / 256));
      }
      const rms = calculateRmsVolume(data);
      expect(rms).toBeGreaterThan(0);
      expect(rms).toBeLessThan(1);
    });

    it('should return higher RMS for louder signals', () => {
      const quiet = new Uint8Array(256);
      const loud = new Uint8Array(256);
      for (let i = 0; i < 256; i++) {
        quiet[i] = Math.round(128 + 10 * Math.sin((2 * Math.PI * i) / 256));
        loud[i] = Math.round(128 + 100 * Math.sin((2 * Math.PI * i) / 256));
      }
      expect(calculateRmsVolume(loud)).toBeGreaterThan(calculateRmsVolume(quiet));
    });
  });

  describe('rmsToDecibels', () => {
    it('should return MIN_DB for zero RMS', () => {
      expect(rmsToDecibels(0)).toBe(MIN_DB);
    });

    it('should return MIN_DB for negative RMS', () => {
      expect(rmsToDecibels(-1)).toBe(MIN_DB);
    });

    it('should return 0 dB for RMS of 1', () => {
      expect(rmsToDecibels(1)).toBeCloseTo(0, 5);
    });

    it('should return approximately -6 dB for RMS of 0.5', () => {
      // 20 * log10(0.5) ≈ -6.02
      expect(rmsToDecibels(0.5)).toBeCloseTo(-6.02, 1);
    });

    it('should return approximately -20 dB for RMS of 0.1', () => {
      expect(rmsToDecibels(0.1)).toBeCloseTo(-20, 1);
    });

    it('should clamp values to MIN_DB', () => {
      expect(rmsToDecibels(0.0000001)).toBeGreaterThanOrEqual(MIN_DB);
    });
  });

  describe('decibelsToPercent', () => {
    it('should return 0 for MIN_DB', () => {
      expect(decibelsToPercent(MIN_DB)).toBe(0);
    });

    it('should return 0 for values below MIN_DB', () => {
      expect(decibelsToPercent(MIN_DB - 10)).toBe(0);
    });

    it('should return 100 for 0 dB', () => {
      expect(decibelsToPercent(0)).toBe(100);
    });

    it('should return 100 for values above 0', () => {
      expect(decibelsToPercent(5)).toBe(100);
    });

    it('should return 50 for midpoint dB value', () => {
      const midDb = MIN_DB / 2;
      expect(decibelsToPercent(midDb)).toBeCloseTo(50, 1);
    });

    it('should return values between 0 and 100 for typical dB range', () => {
      expect(decibelsToPercent(-50)).toBeGreaterThan(0);
      expect(decibelsToPercent(-50)).toBeLessThan(100);
    });
  });

  describe('classifySignalStrength', () => {
    it('should return NoSignal for very low dB', () => {
      expect(classifySignalStrength(-90)).toBe(SignalStatus.NoSignal);
      expect(classifySignalStrength(MIN_DB)).toBe(SignalStatus.NoSignal);
    });

    it('should return Weak for low dB', () => {
      expect(classifySignalStrength(-60)).toBe(SignalStatus.Weak);
      expect(classifySignalStrength(-79)).toBe(SignalStatus.Weak);
    });

    it('should return Good for moderate dB', () => {
      expect(classifySignalStrength(-30)).toBe(SignalStatus.Good);
      expect(classifySignalStrength(-20)).toBe(SignalStatus.Good);
    });

    it('should return Strong for high dB', () => {
      expect(classifySignalStrength(-10)).toBe(SignalStatus.Strong);
      expect(classifySignalStrength(-5)).toBe(SignalStatus.Strong);
    });

    it('should return Clipping for near-zero dB', () => {
      expect(classifySignalStrength(-0.5)).toBe(SignalStatus.Clipping);
      expect(classifySignalStrength(0)).toBe(SignalStatus.Clipping);
    });

    it('should handle exact threshold values', () => {
      expect(classifySignalStrength(-80)).toBe(SignalStatus.Weak);
      expect(classifySignalStrength(-40)).toBe(SignalStatus.Good);
      expect(classifySignalStrength(-12)).toBe(SignalStatus.Strong);
      expect(classifySignalStrength(-1)).toBe(SignalStatus.Clipping);
    });
  });

  describe('computeAudioMetrics', () => {
    it('should compute metrics for silence', () => {
      const silence = new Uint8Array(256).fill(128);
      const metrics = computeAudioMetrics(silence, MIN_DB);

      expect(metrics.volumeRms).toBe(0);
      expect(metrics.volumeDb).toBe(MIN_DB);
      expect(metrics.volumePercent).toBe(0);
      expect(metrics.peakDb).toBe(MIN_DB);
      expect(metrics.signalStatus).toBe(SignalStatus.NoSignal);
    });

    it('should track peak dB value', () => {
      const data = new Uint8Array(256);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.round(128 + 64 * Math.sin((2 * Math.PI * i) / 256));
      }
      const previousPeak = -10;
      const metrics = computeAudioMetrics(data, previousPeak);

      // Peak should be at least the previous peak
      expect(metrics.peakDb).toBeGreaterThanOrEqual(previousPeak);
    });

    it('should update peak when current is higher', () => {
      // Maximum amplitude
      const loud = new Uint8Array(256).fill(255);
      const metrics = computeAudioMetrics(loud, MIN_DB);

      expect(metrics.peakDb).toBeGreaterThan(MIN_DB);
    });

    it('should preserve previous peak when current is lower', () => {
      const silence = new Uint8Array(256).fill(128);
      const previousPeak = -5;
      const metrics = computeAudioMetrics(silence, previousPeak);

      expect(metrics.peakDb).toBe(previousPeak);
    });

    it('should have consistent volumePercent and volumeDb', () => {
      const data = new Uint8Array(256);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.round(128 + 50 * Math.sin((2 * Math.PI * i) / 256));
      }
      const metrics = computeAudioMetrics(data, MIN_DB);

      expect(metrics.volumePercent).toBe(decibelsToPercent(metrics.volumeDb));
    });
  });

  describe('formatVolumeDb', () => {
    it('should return infinity symbol for MIN_DB', () => {
      expect(formatVolumeDb(MIN_DB)).toBe('-\u221E dB');
    });

    it('should return infinity symbol for values below MIN_DB', () => {
      expect(formatVolumeDb(MIN_DB - 10)).toBe('-\u221E dB');
    });

    it('should format 0 dB correctly', () => {
      expect(formatVolumeDb(0)).toBe('0.0 dB');
    });

    it('should format negative dB with one decimal place', () => {
      expect(formatVolumeDb(-12.345)).toBe('-12.3 dB');
    });

    it('should format dB values with consistent decimal places', () => {
      expect(formatVolumeDb(-30)).toBe('-30.0 dB');
    });
  });

  describe('formatVolumePercent', () => {
    it('should format 0% correctly', () => {
      expect(formatVolumePercent(0)).toBe('0%');
    });

    it('should format 100% correctly', () => {
      expect(formatVolumePercent(100)).toBe('100%');
    });

    it('should round fractional percentages', () => {
      expect(formatVolumePercent(50.7)).toBe('51%');
      expect(formatVolumePercent(33.3)).toBe('33%');
    });
  });

  describe('formatDuration', () => {
    it('should format 0 seconds', () => {
      expect(formatDuration(0)).toBe('00:00');
    });

    it('should format seconds only', () => {
      expect(formatDuration(5)).toBe('00:05');
      expect(formatDuration(30)).toBe('00:30');
    });

    it('should format minutes and seconds', () => {
      expect(formatDuration(65)).toBe('01:05');
      expect(formatDuration(130)).toBe('02:10');
    });

    it('should handle fractional seconds by flooring', () => {
      expect(formatDuration(5.7)).toBe('00:05');
    });

    it('should pad single-digit values with zero', () => {
      expect(formatDuration(61)).toBe('01:01');
    });
  });

  describe('getSignalStatusI18nKey', () => {
    it('should return correct keys for all signal statuses', () => {
      expect(getSignalStatusI18nKey(SignalStatus.NoSignal)).toBe('signalNoSignal');
      expect(getSignalStatusI18nKey(SignalStatus.Weak)).toBe('signalWeak');
      expect(getSignalStatusI18nKey(SignalStatus.Good)).toBe('signalGood');
      expect(getSignalStatusI18nKey(SignalStatus.Strong)).toBe('signalStrong');
      expect(getSignalStatusI18nKey(SignalStatus.Clipping)).toBe('signalClipping');
    });
  });

  describe('getSignalStatusColor', () => {
    it('should return Tailwind text color classes for all statuses', () => {
      expect(getSignalStatusColor(SignalStatus.NoSignal)).toBe('text-muted-foreground');
      expect(getSignalStatusColor(SignalStatus.Weak)).toBe('text-yellow-500');
      expect(getSignalStatusColor(SignalStatus.Good)).toBe('text-green-500');
      expect(getSignalStatusColor(SignalStatus.Strong)).toBe('text-blue-500');
      expect(getSignalStatusColor(SignalStatus.Clipping)).toBe('text-red-500');
    });
  });

  describe('getVolumeBarColor', () => {
    it('should return Tailwind bg color classes for all statuses', () => {
      expect(getVolumeBarColor(SignalStatus.NoSignal)).toBe('bg-muted-foreground');
      expect(getVolumeBarColor(SignalStatus.Weak)).toBe('bg-yellow-500');
      expect(getVolumeBarColor(SignalStatus.Good)).toBe('bg-green-500');
      expect(getVolumeBarColor(SignalStatus.Strong)).toBe('bg-blue-500');
      expect(getVolumeBarColor(SignalStatus.Clipping)).toBe('bg-red-500');
    });
  });
});
