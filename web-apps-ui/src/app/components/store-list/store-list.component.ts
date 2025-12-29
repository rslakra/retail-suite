import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../services/store.service';
import { Store } from '../../models/store.model';

@Component({
  selector: 'app-store-list',
  standalone: false,
  imports: [CommonModule],
  templateUrl: './store-list.component.html',
  styleUrl: './store-list.component.css'
})
export class StoreListComponent implements OnInit, AfterViewInit {
  stores: Store[] = [];
  error: string | null = null;
  showDebug: boolean = false;

  constructor(
    private storeService: StoreService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Initialize but don't load yet
  }

  ngAfterViewInit(): void {
    // Load after view is initialized
    this.loadStores();
  }

  loadStores(): void {
    this.error = null;
    this.stores = [];
    this.cdr.detectChanges();

    this.storeService.getStores().subscribe({
      next: (stores) => {
        this.stores = stores || [];
        this.cdr.detectChanges();
        if (this.stores.length === 0) {
          console.warn('No stores found in response');
        }
      },
      error: (error) => {
        console.error('Error loading stores:', error);
        this.error = `Failed to load stores: ${error.message || error}`;
        this.stores = [];
        this.cdr.detectChanges();
      }
    });
  }
}

