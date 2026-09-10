import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { GoogleMapsModule } from '@angular/google-maps';
import { CustomerListComponent } from '../../components/customer-list/customer-list.component';
import { CustomerAddComponent } from '../../components/customer-add/customer-add.component';
import { CustomerEditComponent } from '../../components/customer-edit/customer-edit.component';
import { CustomerDetailsComponent } from '../../components/customer-details/customer-details.component';

const routes: Routes = [
  { path: '', component: CustomerListComponent },
  { path: 'add', component: CustomerAddComponent },
  { path: ':id/edit', component: CustomerEditComponent },
  { path: ':id', component: CustomerDetailsComponent }
];

@NgModule({
  declarations: [
    CustomerListComponent,
    CustomerAddComponent,
    CustomerEditComponent,
    CustomerDetailsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    GoogleMapsModule,
    RouterModule.forChild(routes)
  ]
})
export class CustomersModule { }
