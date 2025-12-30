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
    return this.http.get<StoreResponse>(url).pipe(
      map((response: StoreResponse) => {
        const stores = response._embedded?.stores || [];
        return stores.map((store: Store) => ({
          ...store,
          latitude: store.address.location.y,
          longitude: store.address.location.x,
          icon: 'starbucks_logo.png'
        }));
      })
    );
  }
}

