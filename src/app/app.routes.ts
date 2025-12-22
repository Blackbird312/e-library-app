import { Routes } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import { TabsPage } from './tabs/tabs.page';
import { noAuthGuard } from './guards/no-auth.guard';


export const routes: Routes = [

  // 🔓 Public routes
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
    canActivate: [noAuthGuard]
  },

  // 🔒 Protected app (tabs)
  {
    path: 'tabs',
    component: TabsPage,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home.page').then(m => m.HomePage),
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full',
      },
    ],
  },

  // Default
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
];
