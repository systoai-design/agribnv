import { Geolocation, Position, PositionOptions } from '@capacitor/geolocation';
import { isNativePlatform } from './device';

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
}

/**
 * Geolocation platform adapter.
 * Uses Capacitor native GPS on devices and browser Geolocation API on web.
 */
export const geolocation = {
  /**
   * Get current geographical position.
   */
  async getCurrentPosition(options?: PositionOptions): Promise<Coordinates> {
    if (isNativePlatform()) {
      const position: Position = await Geolocation.getCurrentPosition(options);
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        speed: position.coords.speed,
        heading: position.coords.heading,
      };
    }

    // Web fallback
    return new Promise((resolve, reject) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude,
            speed: pos.coords.speed,
            heading: pos.coords.heading,
          });
        },
        (err) => reject(err),
        options
      );
    });
  },

  /**
   * Watch position updates.
   */
  async watchPosition(
    callback: (coords: Coordinates | null, err?: any) => void,
    options?: PositionOptions
  ): Promise<string> {
    if (isNativePlatform()) {
      const watchId = await Geolocation.watchPosition(options || {}, (position, err) => {
        if (err) {
          callback(null, err);
        } else if (position) {
          callback({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            speed: position.coords.speed,
            heading: position.coords.heading,
          });
        }
      });
      return watchId;
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser.');
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        callback({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude,
          speed: pos.coords.speed,
          heading: pos.coords.heading,
        });
      },
      (err) => callback(null, err),
      options
    );
    return id.toString();
  },

  /**
   * Clear watch position listener.
   */
  async clearWatch(id: string): Promise<void> {
    if (isNativePlatform()) {
      await Geolocation.clearWatch({ id });
    } else if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(parseInt(id, 10));
    }
  },
};
