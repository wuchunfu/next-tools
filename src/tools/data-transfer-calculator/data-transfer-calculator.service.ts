// Data size units in bytes
export const dataSizeUnits = {
  bit: 1 / 8,
  byte: 1,
  kilobyte: 1024,
  megabyte: 1024 ** 2,
  gigabyte: 1024 ** 3,
  terabyte: 1024 ** 4,
  petabyte: 1024 ** 5,
} as const;

export type DataSizeUnit = keyof typeof dataSizeUnits;

// Transfer speed units in bits per second
export const transferSpeedUnits = {
  'bit/s': 1 / 8,
  'kbit/s': 1000 / 8,
  'Mbit/s': 1000 ** 2 / 8,
  'Gbit/s': 1000 ** 3 / 8,
  'byte/s': 1,
  'KB/s': 1024,
  'MB/s': 1024 ** 2,
  'GB/s': 1024 ** 3,
} as const;

export type TransferSpeedUnit = keyof typeof transferSpeedUnits;

export interface DataTransferInput {
  dataSize: number;
  dataSizeUnit: DataSizeUnit;
  transferSpeed: number;
  transferSpeedUnit: TransferSpeedUnit;
}

export interface DataTransferResult {
  timeInSeconds: number;
  timeInMinutes: number;
  timeInHours: number;
  timeInDays: number;
  formattedTime: string;
}

/**
 * Convert data size to bytes
 */
export function convertToBytes(size: number, unit: DataSizeUnit): number {
  return size * dataSizeUnits[unit];
}

/**
 * Convert transfer speed to bytes per second
 */
export function convertToBytesPerSecond(speed: number, unit: TransferSpeedUnit): number {
  return speed * transferSpeedUnits[unit];
}

/**
 * Calculate data transfer time
 */
export function calculateTransferTime(input: DataTransferInput): DataTransferResult {
  const dataSizeInBytes = convertToBytes(input.dataSize, input.dataSizeUnit);
  const speedInBytesPerSecond = convertToBytesPerSecond(input.transferSpeed, input.transferSpeedUnit);

  if (speedInBytesPerSecond <= 0) {
    return {
      timeInSeconds: 0,
      timeInMinutes: 0,
      timeInHours: 0,
      timeInDays: 0,
      formattedTime: '',
    };
  }

  const timeInSeconds = dataSizeInBytes / speedInBytesPerSecond;
  const timeInMinutes = timeInSeconds / 60;
  const timeInHours = timeInMinutes / 60;
  const timeInDays = timeInHours / 24;

  return {
    timeInSeconds,
    timeInMinutes,
    timeInHours,
    timeInDays,
    formattedTime: '',
  };
}

export interface DurationPart {
  value: number;
  unit: 'days' | 'hours' | 'minutes' | 'seconds';
}

/**
 * Parse duration into parts for localization
 */
export function parseDurationForDisplay(seconds: number): DurationPart[] {
  if (seconds === 0 || !Number.isFinite(seconds)) {
    return [{ value: 0, unit: 'seconds' }];
  }

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: DurationPart[] = [];

  if (days > 0) {
    parts.push({ value: days, unit: 'days' });
  }
  if (hours > 0) {
    parts.push({ value: hours, unit: 'hours' });
  }
  if (minutes > 0) {
    parts.push({ value: minutes, unit: 'minutes' });
  }
  if (secs > 0 || parts.length === 0) {
    parts.push({ value: secs, unit: 'seconds' });
  }

  return parts;
}

/**
 * Calculate required transfer speed for a given time
 */
export function calculateRequiredSpeed(
  dataSize: number,
  dataSizeUnit: DataSizeUnit,
  targetTimeInSeconds: number,
): number {
  const dataSizeInBytes = convertToBytes(dataSize, dataSizeUnit);
  return dataSizeInBytes / targetTimeInSeconds;
}

/**
 * Calculate transferable data size for a given time
 */
export function calculateTransferableSize(
  transferSpeed: number,
  transferSpeedUnit: TransferSpeedUnit,
  timeInSeconds: number,
): number {
  const speedInBytesPerSecond = convertToBytesPerSecond(transferSpeed, transferSpeedUnit);
  return speedInBytesPerSecond * timeInSeconds;
}

