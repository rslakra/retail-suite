import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GoogleMap, MapAdvancedMarker } from '@angular/google-maps';
import { CustomerService } from '../../services/customer.service';
import { GoogleMapsLoaderService } from '../../services/google-maps-loader.service';
import { Customer } from '../../models/customer.model';

declare var google: any;

@Component({
  selector: 'app-customer-edit',
  standalone: false,
  imports: [CommonModule, FormsModule, GoogleMap, MapAdvancedMarker],
  templateUrl: './customer-edit.component.html',
  styleUrl: './customer-edit.component.css'
})
export class CustomerEditComponent implements OnInit, AfterViewInit {
  customerId: string | null = null;
  customer: Customer | null = null;
  mapsReady = false;
  mapsMessage: string | null = null;
  loading = true;
  error: string | null = null;

  mapOptions: google.maps.MapOptions = {
    center: { lat: 33.7489954, lng: -84.3879824 },
    zoom: 12,
    disableDefaultUI: false
  };

  markerPosition: google.maps.LatLngLiteral = {
    lat: 33.7489954,
    lng: -84.3879824
  };

  constructor(
    private route: ActivatedRoute,
    private customerService: CustomerService,
    private router: Router,
    private googleMapsLoader: GoogleMapsLoaderService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.customerId = this.route.snapshot.paramMap.get('id');
  }

  ngAfterViewInit(): void {
    this.initializeMaps();

    if (this.customerId) {
      this.loadCustomer(this.customerId);
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

  private normalizeCustomer(customer: Customer): Customer {
    const location = customer.address?.location ?? {
      latitude: 33.7489954,
      longitude: -84.3879824
    };

    return {
      ...customer,
      address: {
        street: customer.address?.street,
        city: customer.address?.city,
        zipCode: customer.address?.zipCode,
        location: {
          latitude: location.latitude,
          longitude: location.longitude
        }
      }
    };
  }

  loadCustomer(id: string): void {
    this.loading = true;
    this.error = null;
    this.customer = null;
    this.cdr.detectChanges();

    this.customerService.getCustomer(id).subscribe({
      next: (customer) => {
        try {
          this.customer = this.normalizeCustomer(customer);
          this.updateMapCenter();
        } catch (err) {
          console.error('Error parsing customer:', err);
          this.error = 'Failed to parse customer data';
          this.customer = null;
        } finally {
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error loading customer:', err);
        this.error = `Failed to load customer: ${err.message || err.statusText || 'unknown error'}`;
        this.loading = false;
        this.customer = null;
        this.cdr.detectChanges();
      }
    });
  }

  updateMapCenter(): void {
    if (!this.customer?.address?.location) {
      return;
    }

    const { latitude, longitude } = this.customer.address.location;
    if (latitude && longitude) {
      this.mapOptions = {
        ...this.mapOptions,
        center: { lat: latitude, lng: longitude }
      };
      this.markerPosition = { lat: latitude, lng: longitude };
    }
  }

  onMapClick(event: google.maps.MapMouseEvent): void {
    if (!this.customer || !event.latLng) {
      return;
    }

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    this.customer.address.location.latitude = lat;
    this.customer.address.location.longitude = lng;
    this.updateMapCenter();
  }

  geocodeAddress(): void {
    if (!this.customer) {
      return;
    }

    this.googleMapsLoader.runWhenReady(() => {
      const geocoder = new google.maps.Geocoder();
      const address: string[] = [];

      if (this.customer!.address.street) {
        address.push(this.customer!.address.street);
      }
      if (this.customer!.address.city) {
        address.push(this.customer!.address.city);
      }
      if (this.customer!.address.zipCode) {
        address.push(this.customer!.address.zipCode);
      }

      if (address.length === 0) {
        alert('Please enter at least one address field');
        return;
      }

      geocoder.geocode({ address: address.join(',') }, (results: any, status: any) => {
        if (status === google.maps.GeocoderStatus.OK) {
          this.customer!.address.location.latitude = results[0].geometry.location.lat();
          this.customer!.address.location.longitude = results[0].geometry.location.lng();
          this.updateMapCenter();
        } else {
          alert('Geocode was not successful for the following reason: ' + status);
        }
      });
    }, (message) => alert(message));
  }

  reverseGeocodeCoordinates(): void {
    if (!this.customer) {
      return;
    }

    this.googleMapsLoader.runWhenReady(() => {
      const geocoder = new google.maps.Geocoder();
      const lat = parseFloat(this.customer!.address.location.latitude.toString());
      const lng = parseFloat(this.customer!.address.location.longitude.toString());
      const latlng = new google.maps.LatLng(lat, lng);

      geocoder.geocode({ location: latlng }, (results: any, status: any) => {
        if (status === google.maps.GeocoderStatus.OK && results[0]) {
          results[0].address_components.forEach((component: any) => {
            if (component.types.includes('locality')) {
              this.customer!.address.city = component.long_name;
            }
            if (component.types.includes('postal_code')) {
              this.customer!.address.zipCode = component.long_name;
            }
            if (component.types.includes('street_number')) {
              this.customer!.address.street = component.long_name + ' ';
            }
            if (component.types.includes('route')) {
              this.customer!.address.street = (this.customer!.address.street || '') + component.long_name;
            }
          });
        } else {
          alert('Reverse Geocode was not successful for the following reason: ' + status);
        }
      });
    }, (message) => alert(message));
  }

  getMyLocation(): void {
    if (!this.customer) {
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.customer!.address.location.latitude = position.coords.latitude;
        this.customer!.address.location.longitude = position.coords.longitude;
        this.updateMapCenter();
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }

  onSubmit(): void {
    if (!this.customer || !this.customerId) {
      return;
    }

    if (!this.customer.address.location.latitude || !this.customer.address.location.longitude) {
      alert('Please set location coordinates');
      return;
    }

    this.customerService.updateCustomer(this.customerId, this.customer).subscribe({
      next: () => {
        this.router.navigate(['/customers']);
      },
      error: (err) => {
        console.error('Error updating customer:', err);
        const message = err.error?.message || err.message || 'unknown error';
        alert(`Failed to update customer: ${message}`);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/customers']);
  }
}
