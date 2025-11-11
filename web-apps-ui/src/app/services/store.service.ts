import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Store, StoreResponse } from '../models/store.model';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private apiUrl = window.location.protocol + '//' + window.location.host;

  constructor(private http: HttpClient) {}

  getStores(): Observable<Store[]> {
    return this.http.get<StoreResponse>(`${this.apiUrl}/stores`).pipe(
      map(response => response._embedded?.stores || [])
    );
  }

  getStoresNearby(url: string): Observable<Store[]> {
    return this.http.get<StoreResponse>(url).pipe(
      map(response => {
        const stores = response._embedded?.stores || [];
        return stores.map(store => ({
          ...store,
          latitude: store.address.location.y,
          longitude: store.address.location.x,
          icon: 'starbucks_logo.png'
        }));
      })
    );
  }
}

