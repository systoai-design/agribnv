import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
  GalleryPhotos,
} from '@capacitor/camera';
import { isNativePlatform } from './device';

export interface CapturePhotoOptions {
  quality?: number; // 0 to 100, default 85
  allowEditing?: boolean;
  source?: 'camera' | 'photos' | 'prompt';
  width?: number;
  height?: number;
}

export interface CapturedPhotoResult {
  webPath?: string;
  dataUrl?: string;
  format?: string;
  exif?: Record<string, any>;
}

/**
 * Camera and media picker platform adapter.
 * Uses native iOS/Android camera interfaces when running in Capacitor,
 * and falls back gracefully on the browser.
 */
export const camera = {
  /**
   * Captures or selects a single photo using the device camera or photo library.
   */
  async getPhoto(options: CapturePhotoOptions = {}): Promise<CapturedPhotoResult | null> {
    try {
      const sourceMap = {
        camera: CameraSource.Camera,
        photos: CameraSource.Photos,
        prompt: CameraSource.Prompt,
      };

      const photo: Photo = await Camera.getPhoto({
        quality: options.quality ?? 85,
        allowEditing: options.allowEditing ?? false,
        resultType: CameraResultType.Uri,
        source: sourceMap[options.source || 'prompt'],
        width: options.width,
        height: options.height,
      });

      return {
        webPath: photo.webPath,
        dataUrl: photo.dataUrl,
        format: photo.format,
        exif: photo.exif,
      };
    } catch (err: any) {
      // User cancelled selection or permissions denied
      if (err?.message?.includes('cancelled') || err?.message?.includes('canceled') || err?.message?.includes('User cancelled')) {
        return null;
      }
      console.warn('[Platform:Camera] Failed to capture photo:', err);
      throw err;
    }
  },

  /**
   * Convenience helper to directly open camera to take a picture.
   */
  async takePicture(quality = 85): Promise<CapturedPhotoResult | null> {
    return this.getPhoto({ source: 'camera', quality });
  },

  /**
   * Convenience helper to directly pick an image from the photo gallery.
   */
  async pickFromGallery(quality = 85): Promise<CapturedPhotoResult | null> {
    return this.getPhoto({ source: 'photos', quality });
  },

  /**
   * Select multiple photos from device gallery (native only with web fallback).
   */
  async pickMultipleImages(limit = 5): Promise<CapturedPhotoResult[]> {
    try {
      if (isNativePlatform()) {
        const result: GalleryPhotos = await Camera.pickImages({
          quality: 85,
          limit,
        });
        return result.photos.map(p => ({
          webPath: p.webPath,
          format: p.format,
          exif: p.exif,
        }));
      }

      // Web fallback: single capture via prompt
      const single = await this.getPhoto({ source: 'photos' });
      return single ? [single] : [];
    } catch (err) {
      console.warn('[Platform:Camera] pickMultipleImages failed:', err);
      return [];
    }
  },

  /**
   * Checks or requests camera permission.
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (!isNativePlatform()) return true;
      const status = await Camera.requestPermissions({ permissions: ['camera', 'photos'] });
      return status.camera === 'granted' || status.photos === 'granted';
    } catch {
      return false;
    }
  },
};
