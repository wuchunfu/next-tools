import type Plausible from 'plausible-tracker';
import { isNil } from 'lodash';
import { inject } from 'vue'

function createTrackerService({ plausible }: { plausible: ReturnType<typeof Plausible> }) {
  return {
    trackEvent({ eventName }: { eventName: string }) {
      plausible.trackEvent(eventName)
    },
  }
}

function useTracker() {
  const plausible: ReturnType<typeof Plausible> | undefined = inject('plausible')

  if (isNil(plausible)) {
    throw new TypeError('Plausible must be instantiated')
  }

  const tracker = createTrackerService({ plausible })

  return {
    tracker,
  }
}

export { createTrackerService, useTracker }
