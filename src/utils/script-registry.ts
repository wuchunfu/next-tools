// Global script registry for deduplication across all components
// Scripts are loaded once and stay in DOM permanently
export const scriptRegistry = new Map<string, Promise<void>>();

export function loadScript(src: string, options: {
  async?: boolean;
  defer?: boolean;
  type?: string;
  crossorigin?: string;
  integrity?: string;
  referrerpolicy?: string;
  data?: Record<string, string>;
} = {}): Promise<void> {
  // If already loading/loaded, return existing promise
  if (scriptRegistry.has(src)) {
    return scriptRegistry.get(src)!;
  }

  // Create new loading promise
  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.type = options.type || 'text/javascript';

    if (options.async) script.async = true;
    if (options.defer) script.defer = true;
    if (options.crossorigin) script.crossOrigin = options.crossorigin;
    if (options.integrity) script.integrity = options.integrity;
    if (options.referrerpolicy) script.referrerPolicy = options.referrerpolicy;

    // Add data attributes
    if (options.data) {
      Object.entries(options.data).forEach(([key, value]) => {
        script.setAttribute(`data-${key}`, value);
      });
    }

    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));

    document.head.appendChild(script);
  });

  // Store promise globally
  scriptRegistry.set(src, promise);

  return promise;
}
