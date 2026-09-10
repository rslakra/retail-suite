import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/customers', pathMatch: 'full' },
  {
    path: 'customers',
    loadChildren: () =>
      import('./features/customers/customers.module').then((m) => m.CustomersModule)
  },
  {
    path: 'stores',
    loadChildren: () =>
      import('./features/stores/stores.module').then((m) => m.StoresModule)
  },
  {
    path: 'about',
    loadChildren: () =>
      import('./features/about/about.module').then((m) => m.AboutModule)
  },
  { path: '**', redirectTo: '/customers' }
];
