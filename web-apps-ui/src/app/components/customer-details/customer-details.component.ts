import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GoogleMap, MapAdvancedMarker } from '@angular/google-maps';
import { CustomerService } from '../../services/customer.service';
import { GoogleMapsLoaderService } from '../../services/google-maps-loader.service';
import { StoreService } from '../../services/store.service';
import { Customer } from '../../models/customer.model';
import { Store } from '../../models/store.model';

@Component({
  selector: 'app-customer-details',
  standalone: false,
  imports: [CommonModule, FormsModule, RouterModule, GoogleMap, MapAdvancedMarker],
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.css'
})
export class CustomerDetailsComponent implements OnInit, AfterViewInit {
  customer: Customer | null = null;
  stores: Store[] = [];
  searchDistanceKm = 50;
  storeNameQuery = '';
  storesSearched = false;
  searchingStores = false;
  mapsReady = false;
  mapsMessage: string | null = null;
  loading = true;
  error: string | null = null;
  storesError: string | null = null;

  mapOptions: google.maps.MapOptions = {
    center: { lat: 45, lng: -73 },
    zoom: 12
  };

  customerMarkerPosition: google.maps.LatLngLiteral | null = null;
  storeMarkerPositions: google.maps.LatLngLiteral[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService,
    private storeService: StoreService,
    private googleMapsLoader: GoogleMapsLoaderService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Route params read in ngAfterViewInit
  }

  ngAfterViewInit(): void {
    this.initializeMaps();

    const customerId = this.route.snapshot.paramMap.get('id');
    if (customerId) {
      this.loadCustomer(customerId);
    } else {
      this.loading = false;
      this.error = 'Customer id is missing';
      this.cdr.detectChanges();
    }
  }

  private initializeMaps(): void {
    this.googleMapsLoader.ensureLoaded()
      .then(() => {
        this.mapsReady = true;
        this.mapsMessage = null;
        this.cdr.detectChanges();
      })
      .catch((error: Error) => {
        this.mapsReady = false;
        this.mapsMessage = error.message;
        this.cdr.detectChanges();
      });
  }

  loadCustomer(id: string): void {
    this.loading = true;
    this.error = null;
    this.storesError = null;
    this.customer = null;
    this.stores = [];
    this.cdr.detectChanges();

    this.customerService.getCustomer(id).subscribe({
      next: (customer) => {
        try {
          this.customer = customer;
          const latitude = customer.address?.location?.latitude;
          const longitude = customer.address?.location?.longitude;

          if (latitude && longitude) {
            this.mapOptions = {
              center: { lat: latitude, lng: longitude },
              zoom: 12
            };
            this.customerMarkerPosition = { lat: latitude, lng: longitude };
          }

        } catch (err) {
          console.error('Error parsing customer:', err);
          this.error = 'Failed to parse customer data';
          this.customer = null;
        } finally {
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error loading customer:', error);
        this.error = `Failed to load customer details: ${error.message || error.statusText || 'unknown error'}`;
        this.loading = false;
        this.customer = null;
        this.cdr.detectChanges();
      }
    });
  }

  searchNearbyStores(): void {
    if (!this.customer?.address?.location) {
      this.storesError = 'Customer location is required to search for nearby stores.';
      this.cdr.detectChanges();
      return;
    }

    if (!this.searchDistanceKm || this.searchDistanceKm <= 0) {
      this.storesError = 'Enter a search distance greater than 0 km.';
      this.cdr.detectChanges();
      return;
    }

    const { latitude, longitude } = this.customer.address.location;
    this.searchingStores = true;
    this.storesError = null;
    this.stores = [];
    this.storeMarkerPositions = [];
    this.cdr.detectChanges();

    this.storeService.searchStoresNearLocation(latitude, longitude, this.searchDistanceKm).subscribe({
      next: (stores) => {
        const query = this.storeNameQuery.trim().toLowerCase();
        this.stores = query
          ? stores.filter((store) =>
            store.name.toLowerCase().includes(query) ||
            store.address?.city?.toLowerCase().includes(query) ||
            store.address?.zip?.toLowerCase().includes(query)
          )
          : stores;
        this.storeMarkerPositions = this.stores
          .filter(store => store.latitude && store.longitude)
          .map(store => ({
            lat: store.latitude!,
            lng: store.longitude!
          }));
        this.storesSearched = true;
        this.searchingStores = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error searching nearby stores:', error);
        this.storesError = 'Failed to search nearby stores. Is store-service running on port 8081?';
        this.searchingStores = false;
        this.storesSearched = true;
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/customers']);
  }
}

