import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () =>
      import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'questions',
        loadComponent: () =>
          import('./features/questions/my-questions/my-questions.component').then(m => m.MyQuestionsComponent)
      },
      {
        path: 'bulk-upload',
        loadComponent: () =>
          import('./features/questions/bulk-upload/bulk-upload.component').then(m => m.BulkUploadComponent)
      },
      {
        path: 'reviews',
        loadComponent: () =>
          import('./features/reviews/pending-reviews/pending-reviews.component').then(m => m.PendingReviewsComponent)
      },
      {
        path: 'admin/questions',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/question-bank/question-bank.component').then(m => m.QuestionBankComponent)
      },
      {
        path: 'admin/analytics',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/analytics/analytics.component').then(m => m.AnalyticsComponent)
      },
      {
        path: 'admin/smes',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/sme-management/sme-management.component').then(m => m.SmeManagementComponent)
      },
      {
        path: 'admin/stacks',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/stack-management/stack-management.component').then(m => m.StackManagementComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
