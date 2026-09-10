import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Store, StoreResponse } from '../models/store.model';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  constructor(private http: HttpClient) { }

  getStores(): Observable<Store[]> {
    // Use /api prefix for Spring Boot Gateway routing
    // For webpack dev server, proxy will forward /api/stores to backend
    const url = '/api/stores';
    console.log('Fetching stores from:', url);
    return this.http.get<StoreResponse>(url).pipe(
      map((response: StoreResponse) => {
        console.log('Raw store response:', response);
        const stores = response._embedded?.stores || [];
        console.log('Extracted stores:', stores);
        return stores;
      }),
      catchError((error) => {
        console.error('Error in store service:', error);
        return of([]); // Return empty array on error
      })
    );
  }

  getStoresNearby(url: string): Observable<Store[]> {
    const proxiedUrl = this.toApiUrl(url);
    return this.http.get<StoreResponse>(proxiedUrl).pipe(
      map((response: StoreResponse) => this.mapStoreResults(response)),
      catchError((error) => {
        console.error('Error loading nearby stores:', error);
        return of([]);
      })
    );
  }

  searchStoresNearLocation(
    latitude: number,
    longitude: number,
    distanceKm: number
  ): Observable<Store[]> {
    const location = `${latitude},${longitude}`;
    const distance = `${distanceKm}km`;
    const url =
      `/api/stores/search/findByAddressLocationNear?location=${encodeURIComponent(location)}` +
      `&distance=${encodeURIComponent(distance)}&size=100`;

    return this.http.get<StoreResponse>(url).pipe(
      map((response: StoreResponse) => this.mapStoreResults(response)),
      catchError((error) => {
        console.error('Error searching nearby stores:', error);
        throw error;
      })
    );
  }

  private mapStoreResults(response: StoreResponse): Store[] {
    const stores = response._embedded?.stores || [];
    return stores.map((store: Store) => ({
      ...store,
      latitude: store.address?.location?.y ?? store.latitude,
      longitude: store.address?.location?.x ?? store.longitude,
      icon: 'starbucks_logo.png'
    }));
  }

  private toApiUrl(url: string): string {
    if (url.startsWith('/api/')) {
      return url;
    }

    try {
      const parsed = new URL(url, window.location.origin);
      if (parsed.pathname.startsWith('/stores')) {
        return `/api${parsed.pathname}${parsed.search}`;
      }
    } catch (error) {
      console.warn('Could not parse stores-nearby URL:', url, error);
    }

    return url;
  }
}

