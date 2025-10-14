import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'catalog',
    loadComponent: () => import('./features/catalog/components/clothing-list/clothing-list.component').then(m => m.ClothingListComponent)
  },
  {
    path: 'fitting-room',
    loadComponent: () => import('./features/fitting-room/components/virtual-tryon/virtual-tryon.component').then(m => m.VirtualTryonComponent)
  },
  {
    path: 'cart',
    loadComponent: () => import('./shared/cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
