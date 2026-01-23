import { describe, expect, it } from 'vitest';
import {
  calculateTransferTime,
  convertToBytes,
  convertToBytesPerSecond,
  parseDurationForDisplay,
  calculateRequiredSpeed,
  calculateTransferableSize
  
  
} from './data-transfer-calculator.service';

describe('data-transfer-calculator', () => {
  describe('convertToBytes', () => {
    it('should convert bits to bytes', () => {
      expect(convertToBytes(8, 'bit')).toBe(1);
      expect(convertToBytes(16, 'bit')).toBe(2);
    });

    it('should convert bytes to bytes', () => {
      expect(convertToBytes(1, 'byte')).toBe(1);
      expect(convertToBytes(100, 'byte')).toBe(100);
    });

    it('should convert kilobytes to bytes', () => {
      expect(convertToBytes(1, 'kilobyte')).toBe(1024);
      expect(convertToBytes(2, 'kilobyte')).toBe(2048);
    });

    it('should convert megabytes to bytes', () => {
      expect(convertToBytes(1, 'megabyte')).toBe(1024 ** 2);
      expect(convertToBytes(5, 'megabyte')).toBe(5 * 1024 ** 2);
    });

    it('should convert gigabytes to bytes', () => {
      expect(convertToBytes(1, 'gigabyte')).toBe(1024 ** 3);
      expect(convertToBytes(2, 'gigabyte')).toBe(2 * 1024 ** 3);
    });

    it('should convert terabytes to bytes', () => {
      expect(convertToBytes(1, 'terabyte')).toBe(1024 ** 4);
    });

    it('should convert petabytes to bytes', () => {
      expect(convertToBytes(1, 'petabyte')).toBe(1024 ** 5);
    });
  });

  describe('convertToBytesPerSecond', () => {
    it('should convert bit/s to bytes per second', () => {
      expect(convertToBytesPerSecond(8, 'bit/s')).toBe(1);
      expect(convertToBytesPerSecond(16, 'bit/s')).toBe(2);
    });

    it('should convert kbit/s to bytes per second', () => {
      expect(convertToBytesPerSecond(8, 'kbit/s')).toBe(1000);
    });

    it('should convert Mbit/s to bytes per second', () => {
      expect(convertToBytesPerSecond(8, 'Mbit/s')).toBe(1000000);
    });

    it('should convert Gbit/s to bytes per second', () => {
      expect(convertToBytesPerSecond(8, 'Gbit/s')).toBe(1000000000);
    });

    it('should convert byte/s to bytes per second', () => {
      expect(convertToBytesPerSecond(1, 'byte/s')).toBe(1);
      expect(convertToBytesPerSecond(100, 'byte/s')).toBe(100);
    });

    it('should convert KB/s to bytes per second', () => {
      expect(convertToBytesPerSecond(1, 'KB/s')).toBe(1024);
    });

    it('should convert MB/s to bytes per second', () => {
      expect(convertToBytesPerSecond(1, 'MB/s')).toBe(1024 ** 2);
    });

    it('should convert GB/s to bytes per second', () => {
      expect(convertToBytesPerSecond(1, 'GB/s')).toBe(1024 ** 3);
    });
  });

  describe('parseDurationForDisplay', () => {
    it('should parse zero seconds', () => {
      const result = parseDurationForDisplay(0);
      expect(result).toEqual([{ value: 0, unit: 'seconds' }]);
    });

    it('should parse seconds only', () => {
      const result = parseDurationForDisplay(30);
      expect(result).toEqual([{ value: 30, unit: 'seconds' }]);
    });

    it('should parse minutes and seconds', () => {
      const result = parseDurationForDisplay(90);
      expect(result).toEqual([
        { value: 1, unit: 'minutes' },
        { value: 30, unit: 'seconds' },
      ]);
    });

    it('should parse hours, minutes and seconds', () => {
      const result = parseDurationForDisplay(3661);
      expect(result).toEqual([
        { value: 1, unit: 'hours' },
        { value: 1, unit: 'minutes' },
        { value: 1, unit: 'seconds' },
      ]);
    });

    it('should parse days, hours, minutes and seconds', () => {
      const result = parseDurationForDisplay(90061);
      expect(result).toEqual([
        { value: 1, unit: 'days' },
        { value: 1, unit: 'hours' },
        { value: 1, unit: 'minutes' },
        { value: 1, unit: 'seconds' },
      ]);
    });

    it('should parse hours only', () => {
      const result = parseDurationForDisplay(7200);
      expect(result).toEqual([{ value: 2, unit: 'hours' }]);
    });

    it('should parse days only', () => {
      const result = parseDurationForDisplay(86400);
      expect(result).toEqual([{ value: 1, unit: 'days' }]);
    });

    it('should handle infinite values', () => {
      const result = parseDurationForDisplay(Infinity);
      expect(result).toEqual([{ value: 0, unit: 'seconds' }]);
    });
  });

  describe('calculateTransferTime', () => {
    it('should calculate transfer time for 1GB at 100 Mbit/s', () => {
      const result = calculateTransferTime({
        dataSize: 1,
        dataSizeUnit: 'gigabyte',
        transferSpeed: 100,
        transferSpeedUnit: 'Mbit/s',
      });

      // 1 GB = 1024^3 bytes = 1073741824 bytes
      // 100 Mbit/s = 12500000 bytes/s
      // Time = 1073741824 / 12500000 = 85.899 seconds
      expect(result.timeInSeconds).toBeCloseTo(85.899, 2);
      expect(result.timeInMinutes).toBeCloseTo(1.432, 2);
      expect(result.timeInHours).toBeCloseTo(0.024, 3);
    });

    it('should calculate transfer time for 500MB at 50 MB/s', () => {
      const result = calculateTransferTime({
        dataSize: 500,
        dataSizeUnit: 'megabyte',
        transferSpeed: 50,
        transferSpeedUnit: 'MB/s',
      });

      // 500 MB = 500 * 1024^2 bytes = 524288000 bytes
      // 50 MB/s = 50 * 1024^2 bytes/s = 52428800 bytes/s
      // Time = 524288000 / 52428800 = 10 seconds
      expect(result.timeInSeconds).toBe(10);
      expect(result.timeInMinutes).toBeCloseTo(0.167, 2);
    });

    it('should handle zero speed', () => {
      const result = calculateTransferTime({
        dataSize: 100,
        dataSizeUnit: 'megabyte',
        transferSpeed: 0,
        transferSpeedUnit: 'MB/s',
      });

      expect(result.timeInSeconds).toBe(0);
      expect(result.formattedTime).toBe('');
    });

    it('should handle very small files', () => {
      const result = calculateTransferTime({
        dataSize: 1,
        dataSizeUnit: 'byte',
        transferSpeed: 1,
        transferSpeedUnit: 'MB/s',
      });

      expect(result.timeInSeconds).toBeLessThan(0.001);
    });

    it('should calculate transfer time for large files', () => {
      const result = calculateTransferTime({
        dataSize: 1,
        dataSizeUnit: 'terabyte',
        transferSpeed: 1,
        transferSpeedUnit: 'Gbit/s',
      });

      // 1 TB = 1024^4 bytes
      // 1 Gbit/s = 125000000 bytes/s
      // Time should be around 8796 seconds (2.44 hours)
      expect(result.timeInSeconds).toBeGreaterThan(8000);
      expect(result.timeInHours).toBeGreaterThan(2);
    });
  });

  describe('calculateRequiredSpeed', () => {
    it('should calculate required speed for 1GB in 60 seconds', () => {
      const speed = calculateRequiredSpeed(1, 'gigabyte', 60);
      // 1 GB = 1073741824 bytes
      // Speed = 1073741824 / 60 = 17895697.07 bytes/s
      expect(speed).toBeCloseTo(17895697.07, 0);
    });

    it('should calculate required speed for 100MB in 10 seconds', () => {
      const speed = calculateRequiredSpeed(100, 'megabyte', 10);
      // 100 MB = 104857600 bytes
      // Speed = 104857600 / 10 = 10485760 bytes/s
      expect(speed).toBe(10485760);
    });
  });

  describe('calculateTransferableSize', () => {
    it('should calculate transferable size for 100 Mbit/s in 60 seconds', () => {
      const size = calculateTransferableSize(100, 'Mbit/s', 60);
      // 100 Mbit/s = 12500000 bytes/s
      // Size = 12500000 * 60 = 750000000 bytes
      expect(size).toBe(750000000);
    });

    it('should calculate transferable size for 10 MB/s in 30 seconds', () => {
      const size = calculateTransferableSize(10, 'MB/s', 30);
      // 10 MB/s = 10485760 bytes/s
      // Size = 10485760 * 30 = 314572800 bytes
      expect(size).toBe(314572800);
    });
  });
});
