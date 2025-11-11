import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { CustomerService } from '../../services/customer.service';
import { StoreService } from '../../services/store.service';
import { Customer } from '../../models/customer.model';
import { Store } from '../../models/store.model';

@Component({
  selector: 'app-customer-details',
  standalone: false,
  imports: [CommonModule, GoogleMap, MapMarker],
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.css'
})
export class CustomerDetailsComponent implements OnInit {
  customer: Customer | null = null;
  stores: Store[] = [];

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
    private storeService: StoreService
  ) {}

  ngOnInit(): void {
    const customerId = this.route.snapshot.paramMap.get('id');
    if (customerId) {
      this.loadCustomer(customerId);
    }
  }

  loadCustomer(id: string): void {
    this.customerService.getCustomer(id).subscribe({
      next: (customer) => {
        this.customer = customer;
        if (customer.address.location.latitude && customer.address.location.longitude) {
          this.mapOptions = {
            center: {
              lat: customer.address.location.latitude,
              lng: customer.address.location.longitude
            },
            zoom: 12
          };
          this.customerMarkerPosition = {
            lat: customer.address.location.latitude,
            lng: customer.address.location.longitude
          };
        }
        if (customer._links?.['stores-nearby']?.href) {
          this.loadStoresNearby(customer._links['stores-nearby'].href);
        }
      },
      error: (error) => {
        console.error('Error loading customer:', error);
        alert('Failed to load customer details');
      }
    });
  }

  loadStoresNearby(url: string): void {
    this.storeService.getStoresNearby(url).subscribe({
      next: (stores) => {
        this.stores = stores;
        this.storeMarkerPositions = stores
          .filter(store => store.latitude && store.longitude)
          .map(store => ({
            lat: store.latitude!,
            lng: store.longitude!
          }));
      },
      error: (error) => {
        console.error('Error loading nearby stores:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/customers']);
  }
}

