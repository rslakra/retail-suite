import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { StoreListComponent } from '../../components/store-list/store-list.component';

const routes: Routes = [
  { path: '', component: StoreListComponent }
];

@NgModule({
  declarations: [StoreListComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class StoresModule { }
