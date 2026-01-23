<script setup lang="ts">
import { isNil } from 'lodash-es';

import {
  AlertCircle,
  Camera,
  CirclePlay,
  Download,
  Image,
  Mic,
  Pause,
  Play,
  ShieldAlert,
  Square,
  Trash2,
  Video,
  VideoOff,
} from 'lucide-vue-next'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldContent, FieldLabel, FieldSet } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useToolI18n } from '@/composable/useToolI18n'
import { useMediaRecorder } from './useMediaRecorder'

interface Media { type: 'image' | 'video', value: string, createdAt: Date }

const {
  videoInputs: cameras,
  audioInputs: microphones,
  permissionGranted,
  isSupported,
  ensurePermissions,
} = useDevicesList({
  requestPermissions: true,
  constraints: { video: true, audio: true },
  onUpdated() {
    refreshCurrentDevices();
  },
});

const video = ref<HTMLVideoElement>();
const medias = ref<Media[]>([]);
const currentCamera = ref(cameras.value[0]?.deviceId);
const currentMicrophone = ref(microphones.value[0]?.deviceId);
const permissionCannotBePrompted = ref(false);
const { t } = useToolI18n();

const currentCameraLabel = computed(() => {
  const camera = cameras.value.find(cam => cam.deviceId === currentCamera.value)
  return camera?.label || t('tools.camera-recorder.unknownCamera', 'Camera')
})

const currentMicrophoneLabel = computed(() => {
  const mic = microphones.value.find(m => m.deviceId === currentMicrophone.value)
  return mic?.label || t('tools.camera-recorder.unknownMic', 'Microphone')
})

const {
  stream,
  start,
  stop,
  enabled: isMediaStreamAvailable,
} = useUserMedia({
  constraints: computed(() => ({
    video: { deviceId: currentCamera.value },
    ...(currentMicrophone.value ? { audio: { deviceId: currentMicrophone.value } } : {}),
  })),
  autoSwitch: true,
});

const {
  isRecordingSupported,
  onRecordAvailable,
  startRecording,
  stopRecording,
  pauseRecording,
  recordingState,
  resumeRecording,
} = useMediaRecorder({
  stream,
});

onRecordAvailable((value) => {
  medias.value.unshift({ type: 'video', value, createdAt: new Date() });
})

function refreshCurrentDevices() {
  if (isNil(currentCamera) || !cameras.value.find(i => i.deviceId === currentCamera.value)) {
    currentCamera.value = cameras.value[0]?.deviceId;
  }

  if (isNil(microphones) || !microphones.value.find(i => i.deviceId === currentMicrophone.value)) {
    currentMicrophone.value = microphones.value[0]?.deviceId;
  }
}

function takeScreenshot() {
  if (!video.value) {
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = video.value.videoWidth;
  canvas.height = video.value.videoHeight;
  canvas.getContext('2d')?.drawImage(video.value, 0, 0);
  const image = canvas.toDataURL('image/png');

  medias.value.unshift({ type: 'image', value: image, createdAt: new Date() });
}

watchEffect(() => {
  if (video.value && stream.value) {
    video.value.srcObject = stream.value;
  }
});

onBeforeUnmount(() => stop());

async function requestPermissions() {
  try {
    // Check if permission was already denied
    const cameraStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
    const micStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });

    if (cameraStatus.state === 'denied' || micStatus.state === 'denied') {
      permissionCannotBePrompted.value = true;
      return
    }

    await ensurePermissions();
  }
  catch {
    permissionCannotBePrompted.value = true;
  }
}

function downloadMedia({ type, value, createdAt }: Media) {
  const link = document.createElement('a');
  link.href = value;
  link.download = `${type}-${createdAt.getTime()}.${type === 'image' ? 'png' : 'webm'}`;
  link.click();
}

function formatTime(date: Date) {
  return date.toLocaleTimeString();
}
</script>

<template>
  <div class="space-y-6">
    <!-- Not Supported -->
    <Card v-if="!isSupported">
      <CardContent class="pt-6">
        <Alert variant="destructive">
          <AlertCircle class="h-4 w-4" />
          <AlertTitle>{{ t('tools.camera-recorder.notSupportedTitle', 'Not Supported') }}</AlertTitle>
          <AlertDescription>
            {{ t('tools.camera-recorder.notSupported') }}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>

    <!-- Permission Required -->
    <Card v-else-if="!permissionGranted">
      <CardHeader>
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Video class="h-5 w-5 text-primary" />
            {{ t('tools.camera-recorder.cardTitle', 'Camera Recorder') }}
          </CardTitle>
          <CardDescription>
            {{ t('tools.camera-recorder.cardDescription', 'Capture screenshots and record videos from your webcam.') }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <Alert>
          <ShieldAlert class="h-4 w-4" />
          <AlertTitle>{{ t('tools.camera-recorder.permissionRequired', 'Permission Required') }}</AlertTitle>
          <AlertDescription>
            {{ t('tools.camera-recorder.needPermission') }}
          </AlertDescription>
        </Alert>

        <Alert v-if="permissionCannotBePrompted" variant="destructive">
          <AlertCircle class="h-4 w-4" />
          <AlertTitle>{{ t('tools.camera-recorder.permissionBlockedTitle', 'Permission Blocked') }}</AlertTitle>
          <AlertDescription>
            {{ t('tools.camera-recorder.permissionBlocked') }}
          </AlertDescription>
        </Alert>

        <div v-else class="flex justify-center">
          <Button @click="requestPermissions">
            <ShieldAlert class="mr-2 h-4 w-4" />
            {{ t('tools.camera-recorder.grant') }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Main Content -->
    <Card v-else>
      <CardHeader>
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Video class="h-5 w-5 text-primary" />
            {{ t('tools.camera-recorder.cardTitle', 'Camera Recorder') }}
            <Badge v-if="recordingState === 'recording'" variant="destructive" class="animate-pulse">
              {{ t('tools.camera-recorder.recording', 'Recording') }}
            </Badge>
            <Badge v-else-if="recordingState === 'paused'" variant="secondary">
              {{ t('tools.camera-recorder.paused', 'Paused') }}
            </Badge>
          </CardTitle>
          <CardDescription>
            {{ t('tools.camera-recorder.cardDescription', 'Capture screenshots and record videos from your webcam.') }}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent class="space-y-6">
        <!-- Device Selection -->
        <FieldSet class="gap-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field orientation="vertical" class="gap-2">
              <FieldLabel class="text-sm flex items-center gap-2">
                <Video class="h-3.5 w-3.5 text-muted-foreground" />
                {{ t('tools.camera-recorder.video') }}
              </FieldLabel>
              <FieldContent>
                <Select v-model="currentCamera">
                  <SelectTrigger>
                    <SelectValue :placeholder="currentCameraLabel || t('tools.camera-recorder.selectCamera')" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem
                        v-for="cam in cameras"
                        :key="cam.deviceId"
                        :value="cam.deviceId"
                      >
                        {{ cam.label || t('tools.camera-recorder.unknownCamera', 'Camera') }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
            <Field v-if="currentMicrophone && microphones.length > 0" orientation="vertical" class="gap-2">
              <FieldLabel class="text-sm flex items-center gap-2">
                <Mic class="h-3.5 w-3.5 text-muted-foreground" />
                {{ t('tools.camera-recorder.audio') }}
              </FieldLabel>
              <FieldContent>
                <Select v-model="currentMicrophone">
                  <SelectTrigger>
                    <SelectValue :placeholder="currentMicrophoneLabel || t('tools.camera-recorder.selectMic')" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem
                        v-for="mic in microphones"
                        :key="mic.deviceId"
                        :value="mic.deviceId"
                      >
                        {{ mic.label || t('tools.camera-recorder.unknownMic', 'Microphone') }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
          </div>
        </FieldSet>

        <!-- Start Button -->
        <div v-if="!isMediaStreamAvailable" class="flex justify-center py-8">
          <Button size="lg" @click="start">
            <CirclePlay class="mr-2 h-5 w-5" />
            {{ t('tools.camera-recorder.start') }}
          </Button>
        </div>

        <!-- Video Preview & Controls -->
        <div v-else class="space-y-4">
          <div class="relative overflow-hidden rounded-lg border bg-muted/20">
            <video ref="video" autoplay controls playsinline class="w-full max-h-120 object-contain" />
          </div>

          <Separator />

          <div class="flex flex-wrap items-center justify-between gap-3">
            <!-- Screenshot Button -->
            <div class="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button variant="outline" :disabled="!isMediaStreamAvailable" @click="takeScreenshot">
                    <Camera class="mr-2 h-4 w-4" />
                    {{ t('tools.camera-recorder.screenshot') }}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{{ t('tools.camera-recorder.screenshotTooltip', 'Capture current frame as image') }}</TooltipContent>
              </Tooltip>

              <!-- Stop Camera Button -->
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button
                    variant="destructive"
                    :disabled="recordingState !== 'stopped'"
                    @click="stop"
                  >
                    <VideoOff class="mr-2 h-4 w-4" />
                    {{ t('tools.camera-recorder.stopCamera', 'Stop Camera') }}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{{ t('tools.camera-recorder.stopCameraTooltip', 'Turn off webcam') }}</TooltipContent>
              </Tooltip>
            </div>

            <!-- Recording Controls -->
            <div v-if="isRecordingSupported" class="flex items-center gap-2">
              <Button v-if="recordingState === 'stopped'" variant="default" @click="startRecording">
                <Video class="mr-2 h-4 w-4" />
                {{ t('tools.camera-recorder.startRecording') }}
              </Button>

              <Button v-if="recordingState === 'recording'" variant="secondary" @click="pauseRecording">
                <Pause class="mr-2 h-4 w-4" />
                {{ t('tools.camera-recorder.pause') }}
              </Button>

              <Button v-if="recordingState === 'paused'" variant="secondary" @click="resumeRecording">
                <Play class="mr-2 h-4 w-4" />
                {{ t('tools.camera-recorder.resume') }}
              </Button>

              <Button v-if="recordingState !== 'stopped'" variant="destructive" @click="stopRecording">
                <Square class="mr-2 h-4 w-4" />
                {{ t('tools.camera-recorder.stop') }}
              </Button>
            </div>
            <div v-else class="text-sm italic text-muted-foreground">
              {{ t('tools.camera-recorder.noRecord') }}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Media Gallery -->
    <Card v-if="medias.length > 0">
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-base">
          <Image class="h-4 w-4 text-primary" />
          {{ t('tools.camera-recorder.gallery', 'Captured Media') }}
          <Badge variant="secondary" class="ml-1">
            {{ medias.length }}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 max-h-114 overflow-y-auto">
          <div
            v-for="({ type, value, createdAt }, index) in medias"
            :key="index"
            class="overflow-hidden rounded-lg border bg-muted/20 transition-all hover:border-primary/50"
          >
            <img v-if="type === 'image'" :src="value" class="w-full aspect-video object-cover" alt="screenshot">
            <video v-else :src="value" controls class="w-full aspect-video object-contain bg-black" />

            <div class="flex items-center justify-between px-3 py-2 border-t">
              <div class="flex items-center gap-2">
                <Badge :variant="type === 'image' ? 'secondary' : 'default'" class="text-xs">
                  <Camera v-if="type === 'image'" class="mr-1 h-3 w-3" />
                  <Video v-else class="mr-1 h-3 w-3" />
                  {{ type === 'image' ? t('tools.camera-recorder.screenshotLabel') : t('tools.camera-recorder.videoLabel') }}
                </Badge>
                <span class="text-xs text-muted-foreground">{{ formatTime(createdAt) }}</span>
              </div>

              <div class="flex gap-1">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button variant="ghost" size="icon-sm" @click="downloadMedia({ type, value, createdAt })">
                      <Download class="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{{ t('tools.camera-recorder.download', 'Download') }}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button variant="ghost" size="icon-sm" class="hover:bg-destructive/20 hover:text-destructive" @click="medias = medias.filter((_ignored, i) => i !== index)">
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{{ t('tools.camera-recorder.delete', 'Delete') }}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
