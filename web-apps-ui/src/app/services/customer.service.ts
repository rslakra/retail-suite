import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Customer, CustomerResponse } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  constructor(private http: HttpClient) { }

  getCustomers(): Observable<Customer[]> {
    // Use /api prefix for Spring Boot Gateway routing
    // For webpack dev server, proxy will forward /api/customers to backend
    return this.http.get<CustomerResponse>('/api/customers').pipe(
      map((response: CustomerResponse) => response._embedded?.customers || []),
      catchError((error) => {
        console.error('Error in customer service:', error);
        return of([]); // Return empty array on error
      })
    );
  }

  getCustomer(id: string): Observable<Customer> {
    return this.http.get<Customer>(`/api/customers/${id}`);
  }

  createCustomer(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>('/api/customers', this.toCustomerRequestBody(customer));
  }

  updateCustomer(id: string, customer: Customer): Observable<Customer> {
    // Spring Data REST merge-patch replaces nested embeddables; PUT fails on Address updates.
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });
    return this.http.patch<Customer>(
      `/api/customers/${id}`,
      this.toCustomerRequestBody(customer),
      { headers }
    );
  }

  private toCustomerRequestBody(customer: Customer): Record<string, unknown> {
    return {
      firstname: customer.firstname,
      lastname: customer.lastname,
      address: {
        street: customer.address?.street ?? null,
        city: customer.address?.city ?? null,
        zipCode: customer.address?.zipCode ?? null,
        location: {
          latitude: Number(customer.address.location.latitude),
          longitude: Number(customer.address.location.longitude)
        }
      }
    };
  }

  deleteCustomer(id: string): Observable<void> {
    return this.http.delete<void>(`/api/customers/${id}`);
  }
}

