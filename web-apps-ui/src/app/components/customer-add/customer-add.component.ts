import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';

declare var google: any;

@Component({
  selector: 'app-customer-add',
  standalone: false,
  imports: [CommonModule, FormsModule, GoogleMap, MapMarker],
  templateUrl: './customer-add.component.html',
  styleUrl: './customer-add.component.css'
})
export class CustomerAddComponent implements OnInit {
  customer: Customer = {
    firstname: '',
    lastname: '',
    address: {
      location: {
        latitude: 33.7489954,
        longitude: -84.3879824
      }
    }
  };

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
    private customerService: CustomerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.updateMapCenter();
  }

  updateMapCenter(): void {
    if (this.customer.address.location.latitude && this.customer.address.location.longitude) {
      this.mapOptions = {
        ...this.mapOptions,
        center: {
          lat: this.customer.address.location.latitude,
          lng: this.customer.address.location.longitude
        }
      };
      this.markerPosition = {
        lat: this.customer.address.location.latitude,
        lng: this.customer.address.location.longitude
      };
    }
  }

  onMapClick(event: google.maps.MapMouseEvent): void {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      this.customer.address.location.latitude = lat;
      this.customer.address.location.longitude = lng;
      this.updateMapCenter();
    }
  }

  geocodeAddress(): void {
    const geocoder = new google.maps.Geocoder();
    const address: string[] = [];

    if (this.customer.address.street) {
      address.push(this.customer.address.street);
    }
    if (this.customer.address.city) {
      address.push(this.customer.address.city);
    }
    if (this.customer.address.zipCode) {
      address.push(this.customer.address.zipCode);
    }

    if (address.length === 0) {
      alert('Please enter at least one address field');
      return;
    }

    geocoder.geocode({ address: address.join(',') }, (results: any, status: any) => {
      if (status === google.maps.GeocoderStatus.OK) {
        this.customer.address.location.latitude = results[0].geometry.location.lat();
        this.customer.address.location.longitude = results[0].geometry.location.lng();
        this.updateMapCenter();
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  }

  reverseGeocodeCoordinates(): void {
    const geocoder = new google.maps.Geocoder();
    const lat = parseFloat(this.customer.address.location.latitude.toString());
    const lng = parseFloat(this.customer.address.location.longitude.toString());
    const latlng = new google.maps.LatLng(lat, lng);

    geocoder.geocode({ location: latlng }, (results: any, status: any) => {
      if (status === google.maps.GeocoderStatus.OK && results[0]) {
        results[0].address_components.forEach((component: any) => {
          if (component.types.includes('locality')) {
            this.customer.address.city = component.long_name;
          }
          if (component.types.includes('postal_code')) {
            this.customer.address.zipCode = component.long_name;
          }
          if (component.types.includes('street_number')) {
            this.customer.address.street = component.long_name + ' ';
          }
          if (component.types.includes('route')) {
            this.customer.address.street = (this.customer.address.street || '') + component.long_name;
          }
        });
      } else {
        alert('Reverse Geocode was not successful for the following reason: ' + status);
      }
    });
  }

  getMyLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.customer.address.location.latitude = position.coords.latitude;
        this.customer.address.location.longitude = position.coords.longitude;
        this.updateMapCenter();
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }

  onSubmit(): void {
    if (!this.customer.address.location.latitude || !this.customer.address.location.longitude) {
      alert('Please set location coordinates');
      return;
    }

    this.customerService.createCustomer(this.customer).subscribe({
      next: () => {
        this.router.navigate(['/customers']);
      },
      error: (error) => {
        console.error('Error creating customer:', error);
        alert('Failed to create customer');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/customers']);
  }
}

