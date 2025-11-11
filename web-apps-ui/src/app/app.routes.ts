import { Routes } from '@angular/router';
import { CustomerListComponent } from './components/customer-list/customer-list.component';
import { CustomerAddComponent } from './components/customer-add/customer-add.component';
import { CustomerDetailsComponent } from './components/customer-details/customer-details.component';
import { StoreListComponent } from './components/store-list/store-list.component';
import { AboutComponent } from './components/about/about.component';

export const routes: Routes = [
  { path: '', redirectTo: '/customers', pathMatch: 'full' },
  { path: 'customers', component: CustomerListComponent },
  { path: 'customers/add', component: CustomerAddComponent },
  { path: 'customers/:id', component: CustomerDetailsComponent },
  { path: 'stores', component: StoreListComponent },
  { path: 'about', component: AboutComponent },
  { path: '**', redirectTo: '/customers' }
];

