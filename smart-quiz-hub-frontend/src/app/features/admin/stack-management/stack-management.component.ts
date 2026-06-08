import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StackService } from '../../../core/services/stack.service';
import { StackDetail, TopicDetail } from '../../../core/models';

@Component({
  selector: 'app-stack-management',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="animate-fade-up">

      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Stack & Topic Management</h1>
          <p class="text-slate-500 text-sm mt-1">Manage technology stacks and their topics</p>
        </div>
        <button (click)="openStackForm()"
                class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 transition-all">
          <span class="material-icons text-[17px]">add</span>
          New Stack
        </button>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-32">
          <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        </div>
      } @else {

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          @for (stack of stacks(); track stack.id) {
            <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden"
                 [class.opacity-60]="!stack.active">

              <!-- Stack header -->
              <div class="flex items-start gap-3 px-5 py-4 border-b border-slate-100">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h3 class="font-bold text-slate-900 text-sm">{{ stack.stackName }}</h3>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          [class]="stack.active
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'">
                      {{ stack.active ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                  @if (stack.description) {
                    <p class="text-xs text-slate-400 mt-0.5 truncate">{{ stack.description }}</p>
                  }
                  <p class="text-[11px] text-slate-400 mt-1">{{ stack.topics.length }} topic{{ stack.topics.length !== 1 ? 's' : '' }}</p>
                </div>
                <div class="flex items-center gap-1 flex-shrink-0">
                  <button (click)="openStackForm(stack)"
                          class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors"
                          title="Edit stack">
                    <span class="material-icons text-[16px]">edit</span>
                  </button>
                  <button (click)="toggleStack(stack)"
                          class="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                          [class]="stack.active ? 'text-slate-400 hover:text-amber-600' : 'text-slate-400 hover:text-emerald-600'"
                          [title]="stack.active ? 'Deactivate' : 'Activate'">
                    <span class="material-icons text-[16px]">{{ stack.active ? 'toggle_on' : 'toggle_off' }}</span>
                  </button>
                </div>
              </div>

              <!-- Topics list -->
              <div class="px-5 py-3 space-y-1.5 max-h-52 overflow-y-auto">
                @if (stack.topics.length === 0) {
                  <p class="text-xs text-slate-400 text-center py-4">No topics yet</p>
                }
                @for (topic of stack.topics; track topic.id) {
                  <div class="flex items-center gap-2 px-3 py-2 rounded-xl"
                       [class]="topic.active ? 'bg-slate-50' : 'bg-slate-50 opacity-50'">
                    <span class="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          [class]="topic.active ? 'bg-emerald-400' : 'bg-slate-300'"></span>
                    <span class="text-xs text-slate-700 flex-1 min-w-0 truncate">{{ topic.topicName }}</span>
                    <div class="flex items-center gap-0.5 flex-shrink-0">
                      <button (click)="openTopicForm(stack, topic)"
                              class="p-1 rounded-lg hover:bg-white text-slate-400 hover:text-indigo-600 transition-colors"
                              title="Edit topic">
                        <span class="material-icons text-[13px]">edit</span>
                      </button>
                      <button (click)="toggleTopic(stack, topic)"
                              class="p-1 rounded-lg hover:bg-white transition-colors"
                              [class]="topic.active ? 'text-slate-400 hover:text-amber-500' : 'text-slate-400 hover:text-emerald-500'"
                              [title]="topic.active ? 'Deactivate' : 'Activate'">
                        <span class="material-icons text-[13px]">{{ topic.active ? 'toggle_on' : 'toggle_off' }}</span>
                      </button>
                    </div>
                  </div>
                }
              </div>

              <!-- Add topic -->
              <div class="px-5 pb-4 pt-2 border-t border-slate-100">
                <button (click)="openTopicForm(stack)"
                        class="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                  <span class="material-icons text-[14px]">add_circle_outline</span>
                  Add Topic
                </button>
              </div>

            </div>
          }
        </div>
      }

    </div>

    <!-- ─── Stack Modal ──────────────────────────────────────────────────────── -->
    @if (stackModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
           (click)="closeModals()">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
             (click)="$event.stopPropagation()">

          <h2 class="text-lg font-bold text-slate-900 mb-1">
            {{ editingStack() ? 'Edit Stack' : 'New Stack' }}
          </h2>
          <p class="text-sm text-slate-400 mb-5">Fill in the details below</p>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Stack Name <span class="text-rose-500">*</span>
              </label>
              <input [(ngModel)]="stackForm.stackName"
                     placeholder="e.g. Angular, Spring Boot, PostgreSQL"
                     class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea [(ngModel)]="stackForm.description"
                        placeholder="Brief description (optional)"
                        rows="3"
                        class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none"></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button (click)="closeModals()"
                    class="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
              Cancel
            </button>
            <button [disabled]="!stackForm.stackName.trim() || saving()"
                    (click)="saveStack()"
                    class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
              @if (saving()) {
                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              }
              {{ editingStack() ? 'Save Changes' : 'Create Stack' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ─── Topic Modal ───────────────────────────────────────────────────────── -->
    @if (topicModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
           (click)="closeModals()">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
             (click)="$event.stopPropagation()">

          <h2 class="text-lg font-bold text-slate-900 mb-1">
            {{ editingTopic() ? 'Edit Topic' : 'New Topic' }}
          </h2>
          <p class="text-sm text-slate-400 mb-5">
            Stack: <span class="font-semibold text-slate-600">{{ targetStack()?.stackName }}</span>
          </p>

          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Topic Name <span class="text-rose-500">*</span>
            </label>
            <input [(ngModel)]="topicForm.topicName"
                   placeholder="e.g. Components, Dependency Injection"
                   class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" />
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button (click)="closeModals()"
                    class="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
              Cancel
            </button>
            <button [disabled]="!topicForm.topicName.trim() || saving()"
                    (click)="saveTopic()"
                    class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
              @if (saving()) {
                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              }
              {{ editingTopic() ? 'Save Changes' : 'Add Topic' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: []
})
export class StackManagementComponent implements OnInit {
  private stackService = inject(StackService);
  private snackBar = inject(MatSnackBar);

  stacks = signal<StackDetail[]>([]);
  loading = signal(true);
  saving = signal(false);

  stackModal = signal(false);
  topicModal = signal(false);

  editingStack = signal<StackDetail | null>(null);
  editingTopic = signal<TopicDetail | null>(null);
  targetStack = signal<StackDetail | null>(null);

  stackForm = { stackName: '', description: '' };
  topicForm = { topicName: '' };

  ngOnInit(): void {
    this.loadStacks();
  }

  loadStacks(): void {
    this.stackService.getAllStacksAdmin().subscribe({
      next: res => { this.stacks.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openStackForm(stack?: StackDetail): void {
    this.editingStack.set(stack ?? null);
    this.stackForm = { stackName: stack?.stackName ?? '', description: stack?.description ?? '' };
    this.stackModal.set(true);
  }

  openTopicForm(stack: StackDetail, topic?: TopicDetail): void {
    this.targetStack.set(stack);
    this.editingTopic.set(topic ?? null);
    this.topicForm = { topicName: topic?.topicName ?? '' };
    this.topicModal.set(true);
  }

  closeModals(): void {
    this.stackModal.set(false);
    this.topicModal.set(false);
    this.editingStack.set(null);
    this.editingTopic.set(null);
    this.targetStack.set(null);
  }

  saveStack(): void {
    const name = this.stackForm.stackName.trim();
    if (!name) return;
    this.saving.set(true);
    const req = { stackName: name, description: this.stackForm.description.trim() || undefined };
    const editing = this.editingStack();
    const call = editing
      ? this.stackService.updateStack(editing.id, req)
      : this.stackService.createStack(req);

    call.subscribe({
      next: res => {
        if (editing) {
          this.stacks.update(list => list.map(s => s.id === res.data.id ? res.data : s));
        } else {
          this.stacks.update(list => [...list, res.data]);
        }
        this.saving.set(false);
        this.closeModals();
        this.snackBar.open(editing ? 'Stack updated' : 'Stack created', '', { duration: 3000 });
      },
      error: err => {
        this.saving.set(false);
        this.snackBar.open(err.error?.message ?? 'Failed to save stack', '', { duration: 4000 });
      }
    });
  }

  toggleStack(stack: StackDetail): void {
    this.stackService.toggleStack(stack.id).subscribe({
      next: res => {
        this.stacks.update(list => list.map(s => s.id === res.data.id ? res.data : s));
        this.snackBar.open(`Stack ${res.data.active ? 'activated' : 'deactivated'}`, '', { duration: 3000 });
      },
      error: () => this.snackBar.open('Failed to update stack', '', { duration: 4000 })
    });
  }

  saveTopic(): void {
    const name = this.topicForm.topicName.trim();
    const stack = this.targetStack();
    if (!name || !stack) return;
    this.saving.set(true);
    const req = { topicName: name };
    const editing = this.editingTopic();
    const call = editing
      ? this.stackService.updateTopic(stack.id, editing.id, req)
      : this.stackService.addTopic(stack.id, req);

    call.subscribe({
      next: res => {
        this.stacks.update(list => list.map(s => {
          if (s.id !== stack.id) return s;
          const topics = editing
            ? s.topics.map(t => t.id === res.data.id ? res.data : t)
            : [...s.topics, res.data];
          return { ...s, topics };
        }));
        this.saving.set(false);
        this.closeModals();
        this.snackBar.open(editing ? 'Topic updated' : 'Topic added', '', { duration: 3000 });
      },
      error: err => {
        this.saving.set(false);
        this.snackBar.open(err.error?.message ?? 'Failed to save topic', '', { duration: 4000 });
      }
    });
  }

  toggleTopic(stack: StackDetail, topic: TopicDetail): void {
    this.stackService.toggleTopic(stack.id, topic.id).subscribe({
      next: res => {
        this.stacks.update(list => list.map(s => {
          if (s.id !== stack.id) return s;
          return { ...s, topics: s.topics.map(t => t.id === res.data.id ? res.data : t) };
        }));
        this.snackBar.open(`Topic ${res.data.active ? 'activated' : 'deactivated'}`, '', { duration: 3000 });
      },
      error: () => this.snackBar.open('Failed to update topic', '', { duration: 4000 })
    });
  }
}
