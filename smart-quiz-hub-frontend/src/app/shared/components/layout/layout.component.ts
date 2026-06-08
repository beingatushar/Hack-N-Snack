import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../.././../core/services/auth.service';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  adminOnly?: boolean;
  smeOnly?: boolean;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  auth = inject(AuthService);
  collapsed = signal(false);

  navItems: NavItem[] = [
    { icon: 'dashboard',     label: 'Dashboard',       route: '/dashboard' },
    { icon: 'quiz',          label: 'My Questions',    route: '/questions' },
    { icon: 'upload_file',   label: 'Bulk Upload',     route: '/bulk-upload' },
    { icon: 'rate_review',   label: 'Pending Reviews', route: '/reviews' },
    { icon: 'library_books', label: 'Question Bank',   route: '/admin/questions', adminOnly: true },
    { icon: 'group',         label: 'SME Management',  route: '/admin/smes',      adminOnly: true },
    { icon: 'layers',        label: 'Stack Management', route: '/admin/stacks',    adminOnly: true }
  ];

  visibleItems = computed(() =>
    this.navItems.filter(i =>
      (!i.adminOnly || this.auth.isAdmin()) &&
      (!i.smeOnly   || !this.auth.isAdmin())
    )
  );

  user = this.auth.currentUser;

  roleLabel = computed(() => {
    const role = this.auth.currentUser()?.role;
    if (role === 'ADMIN') return 'Administrator';
    if (role === 'SME')   return 'Subject Matter Expert';
    return '';
  });
}
