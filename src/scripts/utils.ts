import type { Url } from '../templates/generated/types';

export const wrappingSlice = <T>(arr: T[], start: number, end: number): T[] =>
  [...arr, ...arr].slice(start, end < start ? end + arr.length : end);

const imagesCache = new Map<string, HTMLImageElement>();

export const waitImageLoaded = (
  img: HTMLImageElement,
): Promise<HTMLImageElement> =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    if (img.complete && img.naturalWidth !== 0) {
      resolve(img);
    } else {
      img.onload = () => resolve(img);
      img.onerror = (event) =>
        reject(new Error(`Failed to load image ${img.src}`, { cause: event }));
    }
  });

export const loadImage = <T extends Url>(
  src: T,
  selector?: T extends string ? undefined : keyof T,
): Promise<HTMLImageElement> => {
  const srcValue = (
    typeof src === 'string' ? src : src[selector as keyof T]
  ) as string;

  if (imagesCache.has(srcValue)) {
    return Promise.resolve(imagesCache.get(srcValue)!);
  }

  const img = new Image();
  img.src = srcValue;
  imagesCache.set(srcValue, img);

  return waitImageLoaded(img);
};

export const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const initializeAnalytics = async () => {
  const [{ initializeApp }, mod] = await Promise.all([
    import('firebase/app'),
    import('firebase/analytics'),
  ]);

  const app = initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  });
  const instance = mod.getAnalytics(app);

  return { instance, mod };
};

const analyticsPromise = initializeAnalytics();

type FirebaseLogEventParameters = Parameters<
  (typeof import('firebase/analytics'))['logEvent']
>;

export const logEvent = async (
  eventName: FirebaseLogEventParameters[1],
  eventParams?: FirebaseLogEventParameters[2],
  options?: FirebaseLogEventParameters[3],
) => {
  const analytics = await analyticsPromise;

  /* eslint-disable no-console */
  if (import.meta.env.DEV) {
    console.groupCollapsed('Analytics event');
    console.info(`Name: ${eventName}`);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { offline, ...filteredParams } = eventParams as Record<
      string,
      unknown
    >;

    if (Object.keys(filteredParams).length > 0) {
      console.info('Params:');
      console.table(filteredParams);
    }

    console.groupEnd();
    return;
  }
  /* eslint-enable no-console */

  return analytics.mod.logEvent(
    analytics.instance,
    eventName,
    {
      ...eventParams,
      offline: false,
    },
    options,
  );
};
