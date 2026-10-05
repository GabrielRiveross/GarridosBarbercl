import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import {Admin} from './pages/admin/admin';

export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'admin',
    component: Admin
  }
];
