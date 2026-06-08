import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { SnackService } from '../../../core/services/snack.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);
  private snack  = inject(SnackService);

  features = [
    { icon: 'auto_awesome', text: 'AI-powered question generation' },
    { icon: 'verified',     text: 'Structured peer review workflow' },
    { icon: 'upload_file',  text: 'Bulk import via XLSX templates' },
  ];

  loading  = signal(false);
  showPass = signal(false);

  form = this.fb.group({
    enterpriseId: ['', [Validators.required]],
    password:     ['', [Validators.required]]
  });

  submit(): void {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);

    this.auth.login(this.form.value as any).subscribe({
      next: res => {
        if (res.success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.snack.error(res.message ?? 'Login failed');
        }
        this.loading.set(false);
      },
      error: err => {
        const msg = err.error?.message ?? 'Invalid credentials. Please try again.';
        this.snack.error(msg);
        this.loading.set(false);
      }
    });
  }
}
