import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GoogleMapsModule } from '@angular/google-maps';

import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { CustomerListComponent } from './components/customer-list/customer-list.component';
import { CustomerAddComponent } from './components/customer-add/customer-add.component';
import { CustomerDetailsComponent } from './components/customer-details/customer-details.component';
import { StoreListComponent } from './components/store-list/store-list.component';
import { AboutComponent } from './components/about/about.component';
import { CustomerService } from './services/customer.service';
import { StoreService } from './services/store.service';

@NgModule({
  declarations: [
    AppComponent,
    CustomerListComponent,
    CustomerAddComponent,
    CustomerDetailsComponent,
    StoreListComponent,
    AboutComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    GoogleMapsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [
    CustomerService,
    StoreService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

