import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-customer-list',
  standalone: false,
  imports: [CommonModule, RouterModule],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.css'
})
export class CustomerListComponent implements OnInit, AfterViewInit {
  customers: Customer[] = [];
  error: string | null = null;

  constructor(
    private customerService: CustomerService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Initialize but don't load yet
  }

  ngAfterViewInit(): void {
    // Load after view is initialized
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.error = null;
    this.customers = [];
    this.cdr.detectChanges();

    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.error = `Failed to load customers: ${error.message || error}`;
        this.customers = [];
        this.cdr.detectChanges();
      }
    });
  }

  deleteCustomer(customer: Customer): void {
    if (customer.id && confirm(`Are you sure you want to delete ${customer.firstname} ${customer.lastname}?`)) {
      this.customerService.deleteCustomer(customer.id).subscribe({
        next: () => {
          this.loadCustomers();
        },
        error: (error) => {
          console.error('Error deleting customer:', error);
          alert('Failed to delete customer');
        }
      });
    }
  }
}

