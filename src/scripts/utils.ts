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
