import { Injectable } from '@angular/core';

declare const GOOGLE_MAPS_API_KEY: string;

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsLoaderService {
  private loadPromise: Promise<void> | null = null;
  private loaded = false;
  private lastError: string | null = null;

  get configured(): boolean {
    const apiKey = this.getApiKey();
    return apiKey.length > 0 && apiKey !== 'YOUR_API_KEY';
  }

  get unavailableMessage(): string {
    return 'Google Maps is not configured. Set GOOGLE_MAPS_API_KEY before running npm start or ./buildWebapp.sh.';
  }

  get errorMessage(): string | null {
    return this.lastError;
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  ensureLoaded(): Promise<void> {
    if (this.loaded) {
      return Promise.resolve();
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.loadScript();
    return this.loadPromise;
  }

  runWhenReady<T>(action: () => T, onError?: (message: string) => void): T | void {
    try {
      if (!this.configured) {
        const message = this.unavailableMessage;
        this.lastError = message;
        onError?.(message);
        return;
      }

      if (!this.loaded || typeof google === 'undefined' || !google.maps) {
        const message = this.lastError || 'Google Maps is still loading. Please try again.';
        onError?.(message);
        return;
      }

      return action();
    } catch (error) {
      const message = this.toErrorMessage(error);
      this.lastError = message;
      console.error('Google Maps action failed:', error);
      onError?.(message);
    }
  }

  private getApiKey(): string {
    return typeof GOOGLE_MAPS_API_KEY !== 'undefined' ? GOOGLE_MAPS_API_KEY : '';
  }

  private loadScript(): Promise<void> {
    if (!this.configured) {
      this.lastError = this.unavailableMessage;
      return Promise.reject(new Error(this.lastError));
    }

    if (typeof google !== 'undefined' && google.maps) {
      this.loaded = true;
      return Promise.resolve();
    }

    const apiKey = this.getApiKey();
    const scriptUrl =
      `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}` +
      '&libraries=geometry,marker&loading=async';

    return new Promise((resolve, reject) => {
      try {
        const existingScript = document.querySelector<HTMLScriptElement>(
          'script[data-google-maps-loader="true"]'
        );

        if (existingScript) {
          existingScript.addEventListener('load', () => this.handleScriptReady(resolve, reject), { once: true });
          existingScript.addEventListener('error', () => this.handleScriptError(reject), { once: true });
          return;
        }

        const script = document.createElement('script');
        script.src = scriptUrl;
        script.async = true;
        script.defer = true;
        script.dataset.googleMapsLoader = 'true';
        script.onload = () => this.handleScriptReady(resolve, reject);
        script.onerror = () => this.handleScriptError(reject);
        document.head.appendChild(script);
      } catch (error) {
        const message = this.toErrorMessage(error);
        this.lastError = message;
        reject(new Error(message));
      }
    });
  }

  private handleScriptReady(resolve: () => void, reject: (reason: Error) => void): void {
    try {
      if (typeof google === 'undefined' || !google.maps) {
        throw new Error('Google Maps API did not initialize.');
      }

      this.loaded = true;
      this.lastError = null;
      resolve();
    } catch (error) {
      const message = this.toErrorMessage(error);
      this.lastError = message;
      reject(new Error(message));
    }
  }

  private handleScriptError(reject: (reason: Error) => void): void {
    const message = 'Failed to load Google Maps. Check GOOGLE_MAPS_API_KEY and billing/API settings.';
    this.lastError = message;
    reject(new Error(message));
  }

  private toErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Google Maps is unavailable.';
  }
}
