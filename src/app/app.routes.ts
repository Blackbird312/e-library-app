import { Routes } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import { noAuthGuard } from './guards/no-auth.guard';
import { TabsPage } from './tabs/tabs.page';

// small helper (no new file)
const isLoggedIn = () => !!localStorage.getItem('token');

export const routes: Routes = [
  // default entry
  { path: '', pathMatch: 'full', redirectTo: 'tabs' },

  // 🔓 Public routes
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then(m => m.LoginPage),
    canActivate: [noAuthGuard],
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
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile.page').then(m => m.ProfilePage),
    },
      {
        path: 'books',
        loadComponent: () =>
          import('./pages/books/books.page').then(m => m.BooksPage),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
      },
    ],
  },

  // 🧭 Invalid route handler (smart redirect)
  {
    path: '**',
    redirectTo: isLoggedIn() ? 'tabs/home' : 'login',
  },
];
