import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { McqService } from '../../../core/services/mcq.service';
import { SnackService } from '../../../core/services/snack.service';
import { BulkUploadResponse } from '../../../core/models';

@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  imports: [
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressBarModule, MatListModule
  ],
  templateUrl: './bulk-upload.component.html',
  styleUrl: './bulk-upload.component.scss'
})
export class BulkUploadComponent {
  private mcqSvc = inject(McqService);
  private snack  = inject(SnackService);

  selectedFile = signal<File | null>(null);
  uploading    = signal(false);
  result       = signal<BulkUploadResponse | null>(null);
  dragOver     = signal(false);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) this.setFile(input.files[0]);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) this.setFile(file);
  }

  private setFile(file: File): void {
    if (!file.name.endsWith('.xlsx')) {
      this.snack.error('Only .xlsx files are supported');
      return;
    }
    this.selectedFile.set(file);
    this.result.set(null);
  }

  upload(): void {
    const file = this.selectedFile();
    if (!file || this.uploading()) return;
    this.uploading.set(true);

    this.mcqSvc.bulkUpload(file).subscribe({
      next: res => {
        this.result.set(res.data);
        this.uploading.set(false);
        if (res.data.failureCount === 0) {
          this.snack.success(`${res.data.successCount} questions uploaded successfully`);
        } else {
          this.snack.error(`${res.data.failureCount} rows failed. Review errors below.`);
        }
      },
      error: err => {
        this.snack.error(err.error?.message ?? 'Upload failed');
        this.uploading.set(false);
      }
    });
  }

  reset(): void {
    this.selectedFile.set(null);
    this.result.set(null);
  }

  downloadTemplate(): void {
    // Column layout matches the server-side parseRow() method:
    //   0 Question Stem | 1 Options (pipe-separated, ≥4) | 2 Correct Indices (0-based, comma-sep)
    //   3 Difficulty | 4 Stack Name | 5 Topic Name
    const cols = [
      'Question Stem',
      'Options (pipe-separated, min 4: Opt1|Opt2|Opt3|Opt4)',
      'Correct Indices (0-based, comma-sep: "1" or "0,2")',
      'Difficulty (EASY/MEDIUM/HARD)',
      'Stack Name',
      'Topic Name'
    ];
    const sample = [
      'Which component is used for service discovery in Spring Cloud?',
      'Spring MVC|Eureka Server|Hibernate|Apache Tomcat',
      '1',
      'MEDIUM',
      'Spring Cloud',
      'Introduction to Spring Cloud'
    ];
    const sampleMulti = [
      'Which of the following are valid HTTP methods? (select all that apply)',
      'GET|POST|FETCH|DELETE|INVOKE',
      '0,1,3',
      'EASY',
      'Spring Cloud',
      'Introduction to Spring Cloud'
    ];
    const th = cols.map(c => `<th style="background:#4f46e5;color:#fff;padding:6px 10px">${c}</th>`).join('');
    const td = sample.map(v => `<td style="padding:4px 10px">${v}</td>`).join('');
    const td2 = sampleMulti.map(v => `<td style="padding:4px 10px">${v}</td>`).join('');
    const html = `<html><head><meta charset="utf-8"></head><body>
      <table border="1" cellspacing="0">
        <tr>${th}</tr>
        <tr>${td}</tr>
        <tr>${td2}</tr>
      </table></body></html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mcq_upload_template.xls';
    a.click();
    URL.revokeObjectURL(a.href);
  }
}
