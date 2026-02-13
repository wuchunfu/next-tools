<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import {
  AlertCircle,
  CirclePlay,
  Mic,
  MicOff,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  Square,
  Volume2,
  VolumeOff,
} from 'lucide-vue-next';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldLabel, FieldSet } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useToolI18n } from '@/composable/useToolI18n';
import {
  FFT_SIZE,
  MAX_RECORDING_DURATION_SECONDS,
  MIN_DB,
  MicrophoneStatus,
  SignalStatus,
  VisualizationType,
  computeAudioMetrics,
  formatDuration,
  formatVolumeDb,
  formatVolumePercent,
  getSignalStatusColor,
  getSignalStatusI18nKey,
  getVolumeBarColor,
} from './microphone-monitor.service';

const { t } = useToolI18n();

// Persistent config
const storedDeviceId = useStorage('microphone-monitor:device-id', '');
const visualizationType = useStorage<VisualizationType>(
  'microphone-monitor:visualization-type',
  VisualizationType.Waveform,
);

// Permission state
const {
  audioInputs: microphones,
  permissionGranted,
  isSupported,
  ensurePermissions,
} = useDevicesList({
  requestPermissions: true,
  constraints: { audio: true },
  onUpdated() {
    refreshCurrentDevice();
  },
});

const permissionCannotBePrompted = ref(false);

// Audio state
const status = ref<MicrophoneStatus>(MicrophoneStatus.Idle);
const currentDeviceId = ref(storedDeviceId.value || '');
const isMonitoringEnabled = ref(false);

// Audio metrics
const volumeDb = ref(MIN_DB);
const volumePercent = ref(0);
const peakDb = ref(MIN_DB);
const signalStatus = ref<SignalStatus>(SignalStatus.NoSignal);

// Recording state
const isRecording = ref(false);
const recordingDuration = ref(0);
const recordingBlobUrl = ref<string | null>(null);
const isPlayingRecording = ref(false);

// Audio nodes (not reactive, internal state)
let audioContext: AudioContext | null = null;
let mediaStream: MediaStream | null = null;
let sourceNode: MediaStreamAudioSourceNode | null = null;
let analyserNode: AnalyserNode | null = null;
let gainNode: GainNode | null = null;
let animationFrameId: number | null = null;
let mediaRecorder: MediaRecorder | null = null;
let recordingChunks: Blob[] = [];
let recordingTimer: ReturnType<typeof setInterval> | null = null;
let audioElement: HTMLAudioElement | null = null;

// Canvas ref
const canvasRef = ref<HTMLCanvasElement | null>(null);

const currentDeviceLabel = computed(() => {
  const mic = microphones.value.find(m => m.deviceId === currentDeviceId.value);
  return mic?.label || t('tools.microphone-monitor.unknownMic', 'Microphone');
});

const isListening = computed(() => status.value === MicrophoneStatus.Listening || status.value === MicrophoneStatus.Recording || status.value === MicrophoneStatus.Playing);

const statusBadgeText = computed(() => {
  switch (status.value) {
    case MicrophoneStatus.Listening:
      return t('tools.microphone-monitor.statusListening', 'Listening');
    case MicrophoneStatus.Recording:
      return t('tools.microphone-monitor.statusRecording', 'Recording');
    case MicrophoneStatus.Playing:
      return t('tools.microphone-monitor.statusPlaying', 'Playing');
    default:
      return '';
  }
});

const signalStatusText = computed(() => {
  const key = getSignalStatusI18nKey(signalStatus.value);
  return t(`tools.microphone-monitor.${key}`, key);
});

const signalColorClass = computed(() => getSignalStatusColor(signalStatus.value));
const volumeBarColorClass = computed(() => getVolumeBarColor(signalStatus.value));

function refreshCurrentDevice() {
  if (!microphones.value.find(m => m.deviceId === currentDeviceId.value)) {
    currentDeviceId.value = microphones.value[0]?.deviceId || '';
  }
}

// Watch device changes to store preference
watch(currentDeviceId, (id) => {
  storedDeviceId.value = id;
  // If already listening, restart with new device
  if (isListening.value) {
    stopListening();
    nextTick(() => startListening());
  }
});

async function requestPermissions() {
  try {
    const micStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    if (micStatus.state === 'denied') {
      permissionCannotBePrompted.value = true;
      return;
    }
    await ensurePermissions();
  }
  catch {
    permissionCannotBePrompted.value = true;
  }
}

async function startListening() {
  try {
    audioContext = new AudioContext();

    const constraints: MediaStreamConstraints = {
      audio: currentDeviceId.value
        ? { deviceId: { exact: currentDeviceId.value } }
        : true,
    };

    mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    sourceNode = audioContext.createMediaStreamSource(mediaStream);

    // Analyser for visualization and metrics
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = FFT_SIZE;
    analyserNode.smoothingTimeConstant = 0.8;

    // Gain node for monitoring playback
    gainNode = audioContext.createGain();
    gainNode.gain.value = isMonitoringEnabled.value ? 1 : 0;

    sourceNode.connect(analyserNode);
    sourceNode.connect(gainNode);
    gainNode.connect(audioContext.destination);

    status.value = MicrophoneStatus.Listening;
    peakDb.value = MIN_DB;

    // Wait for Vue to render the canvas element before starting visualization
    await nextTick();
    startVisualization();
  }
  catch {
    status.value = MicrophoneStatus.Error;
  }
}

function stopListening() {
  if (isRecording.value) {
    stopRecording();
  }

  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  if (sourceNode) {
    sourceNode.disconnect();
    sourceNode = null;
  }
  if (gainNode) {
    gainNode.disconnect();
    gainNode = null;
  }
  if (analyserNode) {
    analyserNode.disconnect();
    analyserNode = null;
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }

  status.value = MicrophoneStatus.Idle;
  volumeDb.value = MIN_DB;
  volumePercent.value = 0;
  signalStatus.value = SignalStatus.NoSignal;

  // Clear canvas
  clearCanvas();
}

function toggleMonitoring() {
  isMonitoringEnabled.value = !isMonitoringEnabled.value;
  if (gainNode) {
    gainNode.gain.value = isMonitoringEnabled.value ? 1 : 0;
  }
}

function resetPeak() {
  peakDb.value = MIN_DB;
}

function startVisualization() {
  if (!analyserNode || !canvasRef.value) {
    return;
  }

  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  const timeDomainData = new Uint8Array(analyserNode.frequencyBinCount);
  const frequencyData = new Uint8Array(analyserNode.frequencyBinCount);

  function draw() {
    if (!analyserNode || !ctx || !canvas) {
      return;
    }

    animationFrameId = requestAnimationFrame(draw);

    // Get data
    analyserNode.getByteTimeDomainData(timeDomainData);
    analyserNode.getByteFrequencyData(frequencyData);

    // Update metrics
    const metrics = computeAudioMetrics(timeDomainData, peakDb.value);
    volumeDb.value = metrics.volumeDb;
    volumePercent.value = metrics.volumePercent;
    peakDb.value = metrics.peakDb;
    signalStatus.value = metrics.signalStatus;

    // Set canvas size to match display
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Read theme colors from CSS variables for consistent styling
    const rootStyle = getComputedStyle(document.documentElement);
    const primaryHsl = rootStyle.getPropertyValue('--primary').trim();
    const bgColor = `hsl(${rootStyle.getPropertyValue('--background').trim()})`;
    const lineColor = `hsl(${rootStyle.getPropertyValue('--muted-foreground').trim()})`;
    const accentColor = `hsl(${primaryHsl})`;

    // Clear
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    if (visualizationType.value === VisualizationType.Waveform) {
      drawWaveform(ctx, timeDomainData, width, height, lineColor, accentColor);
    }
    else {
      drawFrequencyBars(ctx, frequencyData, width, height, primaryHsl);
    }
  }

  draw();
}

function drawWaveform(
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  width: number,
  height: number,
  lineColor: string,
  accentColor: string,
) {
  // Draw center line
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 0.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw waveform
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2;
  ctx.beginPath();

  const sliceWidth = width / data.length;
  let x = 0;

  for (let i = 0; i < data.length; i++) {
    const v = (data[i] ?? 128) / 128.0;
    const y = (v * height) / 2;

    if (i === 0) {
      ctx.moveTo(x, y);
    }
    else {
      ctx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  ctx.stroke();
}

function drawFrequencyBars(
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  width: number,
  height: number,
  primaryHsl: string,
) {
  const barCount = 64;
  const barWidth = width / barCount - 1;
  const step = Math.floor(data.length / barCount);

  for (let i = 0; i < barCount; i++) {
    const value = data[i * step] ?? 0;
    const barHeight = (value / 255) * height;

    // Use HSL alpha channel for intensity-based gradient with primary color
    const alpha = 0.3 + (value / 255) * 0.7;
    ctx.fillStyle = `hsl(${primaryHsl} / ${alpha})`;

    ctx.fillRect(
      i * (barWidth + 1),
      height - barHeight,
      barWidth,
      barHeight,
    );
  }
}

function clearCanvas() {
  if (!canvasRef.value) {
    return;
  }
  const ctx = canvasRef.value.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  }
}

// Recording functions
function startRecording() {
  if (!mediaStream) {
    return;
  }

  // Clean up previous recording
  if (recordingBlobUrl.value) {
    URL.revokeObjectURL(recordingBlobUrl.value);
    recordingBlobUrl.value = null;
  }

  recordingChunks = [];
  recordingDuration.value = 0;

  // Determine MIME type
  const mimeType = MediaRecorder.isTypeSupported('audio/webm')
    ? 'audio/webm'
    : MediaRecorder.isTypeSupported('audio/ogg')
      ? 'audio/ogg'
      : '';

  mediaRecorder = new MediaRecorder(mediaStream, mimeType ? { mimeType } : {});

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordingChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(recordingChunks, { type: mimeType || 'audio/webm' });
    recordingBlobUrl.value = URL.createObjectURL(blob);
  };

  mediaRecorder.start(100);
  isRecording.value = true;
  status.value = MicrophoneStatus.Recording;

  // Duration timer
  recordingTimer = setInterval(() => {
    recordingDuration.value += 1;
    if (recordingDuration.value >= MAX_RECORDING_DURATION_SECONDS) {
      stopRecording();
    }
  }, 1000);
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  mediaRecorder = null;
  isRecording.value = false;

  if (recordingTimer) {
    clearInterval(recordingTimer);
    recordingTimer = null;
  }

  if (status.value === MicrophoneStatus.Recording) {
    status.value = MicrophoneStatus.Listening;
  }
}

function playRecording() {
  if (!recordingBlobUrl.value) {
    return;
  }

  if (audioElement) {
    audioElement.pause();
    audioElement = null;
  }

  audioElement = new Audio(recordingBlobUrl.value);
  audioElement.onended = () => {
    isPlayingRecording.value = false;
    if (isListening.value) {
      status.value = MicrophoneStatus.Listening;
    }
    else {
      status.value = MicrophoneStatus.Idle;
    }
  };
  audioElement.play();
  isPlayingRecording.value = true;
  status.value = MicrophoneStatus.Playing;
}

function stopPlayback() {
  if (audioElement) {
    audioElement.pause();
    audioElement.currentTime = 0;
    audioElement = null;
  }
  isPlayingRecording.value = false;
  if (isListening.value) {
    status.value = MicrophoneStatus.Listening;
  }
  else {
    status.value = MicrophoneStatus.Idle;
  }
}

// Cleanup on unmount
onBeforeUnmount(() => {
  stopListening();
  if (recordingBlobUrl.value) {
    URL.revokeObjectURL(recordingBlobUrl.value);
  }
  if (audioElement) {
    audioElement.pause();
    audioElement = null;
  }
});
</script>

<template>
  <div class="space-y-6">
    <!-- Not Supported -->
    <Card v-if="!isSupported" data-testid="not-supported-card">
      <CardContent class="pt-6">
        <Alert variant="destructive">
          <AlertCircle class="h-4 w-4" />
          <AlertTitle>{{ t('tools.microphone-monitor.notSupportedTitle', 'Not Supported') }}</AlertTitle>
          <AlertDescription>
            {{ t('tools.microphone-monitor.notSupported', 'Your browser does not support microphone access.') }}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>

    <!-- Permission Required -->
    <Card v-else-if="!permissionGranted" data-testid="permission-card">
      <CardHeader>
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Mic class="h-5 w-5 text-primary" />
            {{ t('tools.microphone-monitor.cardTitle', 'Microphone Tester') }}
          </CardTitle>
          <CardDescription>
            {{ t('tools.microphone-monitor.cardDescription', 'Test your microphone with real-time visualization, volume metering, and recording playback.') }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <Alert>
          <ShieldAlert class="h-4 w-4" />
          <AlertTitle>{{ t('tools.microphone-monitor.permissionRequired', 'Permission Required') }}</AlertTitle>
          <AlertDescription>
            {{ t('tools.microphone-monitor.needPermission', 'This tool needs access to your microphone to test it. Click the button below to grant permission.') }}
          </AlertDescription>
        </Alert>

        <Alert v-if="permissionCannotBePrompted" variant="destructive" data-testid="permission-blocked">
          <AlertCircle class="h-4 w-4" />
          <AlertTitle>{{ t('tools.microphone-monitor.permissionBlockedTitle', 'Permission Blocked') }}</AlertTitle>
          <AlertDescription>
            {{ t('tools.microphone-monitor.permissionBlocked', 'Microphone permission was denied. Please allow microphone access in your browser settings and reload this page.') }}
          </AlertDescription>
        </Alert>

        <div v-else class="flex justify-center">
          <Button data-testid="grant-permission-btn" @click="requestPermissions">
            <ShieldAlert class="mr-2 h-4 w-4" />
            {{ t('tools.microphone-monitor.grant', 'Grant Permission') }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Main Content -->
    <Card v-else data-testid="main-card">
      <CardHeader>
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Mic class="h-5 w-5 text-primary" />
            {{ t('tools.microphone-monitor.cardTitle', 'Microphone Tester') }}
            <Badge v-if="status === MicrophoneStatus.Recording" variant="destructive" class="animate-pulse">
              {{ statusBadgeText }}
            </Badge>
            <Badge v-else-if="status === MicrophoneStatus.Listening" variant="default">
              {{ statusBadgeText }}
            </Badge>
            <Badge v-else-if="status === MicrophoneStatus.Playing" variant="secondary">
              {{ statusBadgeText }}
            </Badge>
          </CardTitle>
          <CardDescription>
            {{ t('tools.microphone-monitor.cardDescription', 'Test your microphone with real-time visualization, volume metering, and recording playback.') }}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent class="space-y-6">
        <!-- Device Selection -->
        <FieldSet class="gap-4">
          <Field orientation="vertical" class="gap-2">
            <FieldLabel class="text-sm flex items-center gap-2">
              <Mic class="h-3.5 w-3.5 text-muted-foreground" />
              {{ t('tools.microphone-monitor.microphone', 'Microphone') }}
            </FieldLabel>
            <FieldContent>
              <Select v-model="currentDeviceId" data-testid="device-select">
                <SelectTrigger>
                  <SelectValue :placeholder="currentDeviceLabel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem
                      v-for="mic in microphones"
                      :key="mic.deviceId"
                      :value="mic.deviceId"
                    >
                      {{ mic.label || t('tools.microphone-monitor.unknownMic', 'Microphone') }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>
        </FieldSet>

        <!-- Start Button (when not listening) -->
        <div v-if="!isListening" class="flex justify-center py-8" data-testid="start-section">
          <Button size="lg" data-testid="start-btn" @click="startListening">
            <CirclePlay class="mr-2 h-5 w-5" />
            {{ t('tools.microphone-monitor.startListening', 'Start Listening') }}
          </Button>
        </div>

        <!-- Active Listening Section -->
        <div v-else class="space-y-4" data-testid="listening-section">
          <!-- Control Bar -->
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <!-- Stop Listening -->
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button variant="destructive" data-testid="stop-btn" @click="stopListening">
                    <MicOff class="mr-2 h-4 w-4" />
                    {{ t('tools.microphone-monitor.stopListening', 'Stop') }}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{{ t('tools.microphone-monitor.stopListeningTooltip', 'Stop microphone listening') }}</TooltipContent>
              </Tooltip>

              <!-- Visualization Toggle -->
              <Select v-model="visualizationType" data-testid="visualization-select">
                <SelectTrigger class="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem :value="VisualizationType.Waveform">
                      {{ t('tools.microphone-monitor.waveform', 'Waveform') }}
                    </SelectItem>
                    <SelectItem :value="VisualizationType.FrequencyBars">
                      {{ t('tools.microphone-monitor.frequencyBars', 'Frequency Bars') }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div class="flex items-center gap-2">
              <!-- Monitor Toggle -->
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button
                    :variant="isMonitoringEnabled ? 'default' : 'outline'"
                    data-testid="monitor-btn"
                    @click="toggleMonitoring"
                  >
                    <Volume2 v-if="isMonitoringEnabled" class="mr-2 h-4 w-4" />
                    <VolumeOff v-else class="mr-2 h-4 w-4" />
                    {{ t('tools.microphone-monitor.monitor', 'Monitor') }}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{{ t('tools.microphone-monitor.monitorTooltip', 'Play microphone audio through speakers (use headphones to avoid feedback)') }}</TooltipContent>
              </Tooltip>

              <!-- Reset Peak -->
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button variant="outline" data-testid="reset-peak-btn" @click="resetPeak">
                    <RotateCcw class="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{{ t('tools.microphone-monitor.resetPeak', 'Reset peak level') }}</TooltipContent>
              </Tooltip>
            </div>
          </div>

          <!-- Canvas Visualization -->
          <div class="overflow-hidden rounded-lg border bg-muted/20" data-testid="visualization-area">
            <canvas
              ref="canvasRef"
              class="h-40 w-full"
              data-testid="visualization-canvas"
            />
          </div>

          <!-- Volume Meter -->
          <div class="space-y-2" data-testid="volume-meter">
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">{{ t('tools.microphone-monitor.volume', 'Volume') }}</span>
              <span class="font-mono text-sm">{{ formatVolumeDb(volumeDb) }}</span>
            </div>
            <div class="relative h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                :class="['h-full rounded-full transition-all duration-75', volumeBarColorClass]"
                :style="{ width: `${volumePercent}%` }"
                data-testid="volume-bar"
              />
            </div>
          </div>

          <!-- Metrics Grid -->
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-4" data-testid="metrics-grid">
            <div class="rounded-lg border p-3">
              <div class="text-xs text-muted-foreground">
{{ t('tools.microphone-monitor.currentVolume', 'Volume') }}
</div>
              <div class="mt-1 text-lg font-semibold font-mono">
{{ formatVolumePercent(volumePercent) }}
</div>
            </div>
            <div class="rounded-lg border p-3">
              <div class="text-xs text-muted-foreground">
{{ t('tools.microphone-monitor.peakLevel', 'Peak') }}
</div>
              <div class="mt-1 text-lg font-semibold font-mono">
{{ formatVolumeDb(peakDb) }}
</div>
            </div>
            <div class="rounded-lg border p-3">
              <div class="text-xs text-muted-foreground">
{{ t('tools.microphone-monitor.signalStrength', 'Signal') }}
</div>
              <div :class="['mt-1 text-lg font-semibold', signalColorClass]">
{{ signalStatusText }}
</div>
            </div>
            <div class="rounded-lg border p-3">
              <div class="text-xs text-muted-foreground">
{{ t('tools.microphone-monitor.device', 'Device') }}
</div>
              <div class="mt-1 text-sm font-medium truncate" :title="currentDeviceLabel">
{{ currentDeviceLabel }}
</div>
            </div>
          </div>

          <Separator />

          <!-- Recording Section -->
          <div class="space-y-3" data-testid="recording-section">
            <div class="text-sm font-medium">
{{ t('tools.microphone-monitor.recordingTitle', 'Recording') }}
</div>
            <div class="flex flex-wrap items-center gap-3">
              <!-- Record / Stop Recording -->
              <Button
                v-if="!isRecording"
                variant="outline"
                :disabled="!isListening"
                data-testid="record-btn"
                @click="startRecording"
              >
                <div class="mr-2 h-3 w-3 rounded-full bg-red-500" />
                {{ t('tools.microphone-monitor.record', 'Record') }}
              </Button>
              <Button
                v-else
                variant="destructive"
                data-testid="stop-record-btn"
                @click="stopRecording"
              >
                <Square class="mr-2 h-4 w-4" />
                {{ t('tools.microphone-monitor.stopRecord', 'Stop') }}
                <span class="ml-2 font-mono text-xs">{{ formatDuration(recordingDuration) }}</span>
              </Button>

              <!-- Play / Stop Playback -->
              <template v-if="recordingBlobUrl">
                <Button
                  v-if="!isPlayingRecording"
                  variant="outline"
                  data-testid="play-btn"
                  @click="playRecording"
                >
                  <Play class="mr-2 h-4 w-4" />
                  {{ t('tools.microphone-monitor.play', 'Play') }}
                  <span class="ml-2 font-mono text-xs text-muted-foreground">{{ formatDuration(recordingDuration) }}</span>
                </Button>
                <Button
                  v-else
                  variant="secondary"
                  data-testid="stop-play-btn"
                  @click="stopPlayback"
                >
                  <Pause class="mr-2 h-4 w-4" />
                  {{ t('tools.microphone-monitor.stopPlay', 'Stop') }}
                </Button>
              </template>
            </div>
            <p v-if="isRecording" class="text-xs text-muted-foreground">
              {{ t('tools.microphone-monitor.maxDuration', { seconds: MAX_RECORDING_DURATION_SECONDS }) }}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
