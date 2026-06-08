import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { McqService } from '../../../core/services/mcq.service';
import { StackService } from '../../../core/services/stack.service';
import { SnackService } from '../../../core/services/snack.service';
import { McqResponse, McqRequest, StackSummary, TopicResponse } from '../../../core/models';

export interface QuestionFormData {
  question?: McqResponse;
}

@Component({
  selector: 'app-question-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatDividerModule
  ],
  templateUrl: './question-form.component.html',
  styleUrl: './question-form.component.scss'
})
export class QuestionFormComponent implements OnInit {
  private fb      = inject(FormBuilder);
  private mcqSvc  = inject(McqService);
  private stackSvc= inject(StackService);
  private snack   = inject(SnackService);
  dialogRef       = inject(MatDialogRef<QuestionFormComponent>);
  data            = inject<QuestionFormData>(MAT_DIALOG_DATA);

  stacks  = signal<StackSummary[]>([]);
  topics  = signal<TopicResponse[]>([]);
  loading = signal(false);

  isEdit  = !!this.data.question;
  canSubmitForReview = !this.isEdit ||
    this.data.question?.status === 'DRAFT' ||
    this.data.question?.status === 'REJECTED';

  form = this.fb.group({
    questionStem: [this.data.question?.questionStem ?? '', [Validators.required, Validators.minLength(20)]],
    optionA:      [this.data.question?.optionA ?? '', [Validators.required]],
    optionB:      [this.data.question?.optionB ?? '', [Validators.required]],
    optionC:      [this.data.question?.optionC ?? '', [Validators.required]],
    optionD:      [this.data.question?.optionD ?? '', [Validators.required]],
    correctOption:[this.data.question?.correctOption ?? '', [Validators.required]],
    difficulty:   [this.data.question?.difficulty ?? '', [Validators.required]],
    stackId:      [this.data.question?.stackId ?? null as number | null, [Validators.required]],
    topicId:      [this.data.question?.topicId ?? null as number | null, [Validators.required]]
  });

  ngOnInit(): void {
    this.stackSvc.getStacks().subscribe(res => {
      this.stacks.set(res.data);
      if (this.data.question?.stackId) {
        this.loadTopics(this.data.question.stackId);
      }
    });
  }

  onStackChange(stackId: number): void {
    this.form.patchValue({ topicId: null });
    this.topics.set([]);
    if (stackId) this.loadTopics(stackId);
  }

  private loadTopics(stackId: number): void {
    this.stackSvc.getTopics(stackId).subscribe(res => this.topics.set(res.data));
  }

  save(submitAfter = false): void {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);

    const req = this.form.value as McqRequest;
    const obs = this.isEdit
      ? this.mcqSvc.updateQuestion(this.data.question!.id, req)
      : this.mcqSvc.createQuestion(req);

    obs.subscribe({
      next: res => {
        if (submitAfter) {
          this.mcqSvc.submitForReview(res.data.id).subscribe({
            next: () => {
              this.snack.success('Question submitted for review');
              this.dialogRef.close(res.data);
            },
            error: err => {
              this.snack.error(err.error?.message ?? 'Saved but could not submit for review');
              this.dialogRef.close(res.data);
            }
          });
        } else {
          this.snack.success(this.isEdit ? 'Question updated' : 'Question saved as DRAFT');
          this.dialogRef.close(res.data);
        }
      },
      error: err => {
        this.snack.error(err.error?.message ?? 'Save failed');
        this.loading.set(false);
      }
    });
  }
}
