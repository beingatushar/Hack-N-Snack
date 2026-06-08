import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminService } from '../../../core/services/admin.service';
import { SmeUserResponse } from '../../../core/models';

@Component({
  selector: 'app-sme-management',
  standalone: true,
  imports: [
    MatCardModule, MatIconModule, MatChipsModule,
    MatProgressSpinnerModule, MatButtonModule, MatTooltipModule
  ],
  templateUrl: './sme-management.component.html',
  styleUrl: './sme-management.component.scss'
})
export class SmeManagementComponent implements OnInit {
  private adminSvc = inject(AdminService);

  smes    = signal<SmeUserResponse[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.adminSvc.getAllSmes().subscribe({
      next: res => { this.smes.set(res.data); this.loading.set(false); },
      error: ()  => this.loading.set(false)
    });
  }
}
