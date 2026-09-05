import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    // El <title> y el resto de meta tags los pone `SeoService` (ver `App`).
  },
];
