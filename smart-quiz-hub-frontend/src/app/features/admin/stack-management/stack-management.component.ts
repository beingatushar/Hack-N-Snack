import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StackService } from '../../../core/services/stack.service';
import { StackDetail, TopicDetail } from '../../../core/models';
import { ButtonDirective } from '../../../shared/components/button/button.directive';
import { CountUpDirective } from '../../../shared/directives/count-up.directive';

@Component({
  selector: 'app-stack-management',
  standalone: true,
  imports: [FormsModule, ButtonDirective, CountUpDirective],
  template: `
    <div class="animate-fade-up">

      <!-- Action toolbar (title is provided by the Administration hub) -->
      <div class="flex items-center justify-end mb-5">
        <button (click)="openStackForm()" appBtn="primary">
          <span class="material-icons text-[17px]" aria-hidden="true">add</span>
          New Stack
        </button>
      </div>

      <!-- Stats strip -->
      @if (!loading() && stacks().length > 0) {
        <div class="grid grid-cols-3 gap-3 sm:gap-4 mb-6 stagger">
          <div class="card p-4 flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
              <span class="material-icons text-indigo-600 dark:text-indigo-300 text-[20px]" aria-hidden="true">layers</span>
            </div>
            <div>
              <p class="text-2xl font-extrabold text-slate-800 dark:text-slate-100 leading-none" [appCountUp]="stacks().length">0</p>
              <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Stacks</p>
            </div>
          </div>
          <div class="card p-4 flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
              <span class="material-icons text-emerald-600 dark:text-emerald-300 text-[20px]" aria-hidden="true">check_circle</span>
            </div>
            <div>
              <p class="text-2xl font-extrabold text-emerald-600 leading-none" [appCountUp]="activeStacks()">0</p>
              <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Active</p>
            </div>
          </div>
          <div class="card p-4 flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
              <span class="material-icons text-violet-600 dark:text-violet-300 text-[20px]" aria-hidden="true">topic</span>
            </div>
            <div>
              <p class="text-2xl font-extrabold text-violet-600 leading-none" [appCountUp]="totalTopics()">0</p>
              <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Topics</p>
            </div>
          </div>
        </div>
      }

      @if (loading()) {
        <div class="lg:grid lg:grid-cols-[minmax(280px,340px)_1fr] lg:gap-5">
          <div class="space-y-2.5 stagger">
            @for (i of [1,2,3,4,5]; track i) { <div class="card p-3.5 flex items-center gap-3"><div class="skeleton h-10 w-10 rounded-xl"></div><div class="flex-1"><div class="skeleton h-4 w-2/3 mb-2"></div><div class="skeleton h-3 w-1/3"></div></div></div> }
          </div>
          <div class="card p-6 hidden lg:block"><div class="skeleton h-24 w-full rounded-2xl mb-4"></div><div class="grid grid-cols-2 gap-3">@for (i of [1,2,3,4]; track i) { <div class="skeleton h-12 w-full"></div> }</div></div>
        </div>
      } @else if (stacks().length === 0) {
        <div class="card py-20 flex flex-col items-center gap-4 text-center animate-fade-up">
          <div class="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
            <span class="material-icons text-indigo-400 text-3xl" aria-hidden="true">layers</span>
          </div>
          <div>
            <p class="text-slate-800 dark:text-slate-100 font-semibold">No stacks yet</p>
            <p class="text-slate-400 text-sm mt-1">Create your first technology stack to get started</p>
          </div>
          <button (click)="openStackForm()" appBtn="primary" class="mt-1">
            <span class="material-icons text-[17px]" aria-hidden="true">add</span> New Stack
          </button>
        </div>
      } @else {

        <!-- ══ Master–detail ══ -->
        <div class="lg:grid lg:grid-cols-[minmax(280px,340px)_1fr] lg:gap-5 lg:items-start">

          <!-- Stack list -->
          <div>
            <!-- Search + status filter -->
            <div class="flex flex-col gap-2.5 mb-3">
              <div class="relative">
                <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]" aria-hidden="true">search</span>
                <input [ngModel]="search()" (ngModelChange)="search.set($event)"
                       aria-label="Search stacks" placeholder="Search stacks…"
                       class="field w-full h-10 pl-10 pr-4 text-sm" />
              </div>
              <div class="inline-flex rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] p-1 self-start">
                @for (opt of [{ v: 'all', l: 'All' }, { v: 'active', l: 'Active' }, { v: 'inactive', l: 'Inactive' }]; track opt.v) {
                  <button (click)="statusFilter.set($any(opt.v))"
                          class="press px-3.5 h-8 rounded-lg text-xs font-semibold transition-all"
                          [class]="statusFilter() === opt.v ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'">
                    {{ opt.l }}
                  </button>
                }
              </div>
            </div>

            <div class="space-y-2.5 lg:max-h-[calc(100vh-19rem)] lg:overflow-y-auto lg:pr-1 stagger">
              @for (stack of filteredStacks(); track stack.id) {
                <button type="button" (click)="select(stack)"
                        class="w-full text-left rounded-2xl p-3.5 flex items-center gap-3 transition-all border"
                        [class]="current()?.id === stack.id
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-500/40 shadow-card-hover'
                          : 'card card-i !border-slate-200 dark:!border-white/[0.08]'"
                        [class.opacity-60]="!stack.active">
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-indigo-500/20">
                    <span class="material-icons text-[18px]" aria-hidden="true">layers</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <p class="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{{ stack.stackName }}</p>
                      <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" [class]="stack.active ? 'bg-emerald-400' : 'bg-slate-300'"></span>
                    </div>
                    <p class="text-[11px] text-slate-400 mt-0.5">{{ stack.topics.length }} topic{{ stack.topics.length !== 1 ? 's' : '' }}</p>
                  </div>
                  <span class="material-icons text-[18px] text-slate-300 dark:text-slate-600">chevron_right</span>
                </button>
              } @empty {
                <div class="card py-12 text-center">
                  <p class="text-slate-500 dark:text-slate-300 font-medium text-sm">No stacks match</p>
                  <button (click)="search.set(''); statusFilter.set('all')" class="mt-2 text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:underline">Reset</button>
                </div>
              }
            </div>
          </div>

          <!-- Detail panel -->
          <div class="mt-5 lg:mt-0 lg:sticky lg:top-0">
            @if (current(); as s) {
              <div class="card overflow-hidden animate-fade-up" [class.opacity-70]="!s.active">

                <!-- Gradient header -->
                <div class="relative px-6 py-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white overflow-hidden">
                  <div class="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-2xl"></div>
                  <div class="relative flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <div class="flex items-center gap-2 flex-wrap">
                        <h2 class="text-xl font-extrabold tracking-tight truncate">{{ s.stackName }}</h2>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-white/20">{{ s.active ? 'ACTIVE' : 'INACTIVE' }}</span>
                      </div>
                      @if (s.description) {
                        <p class="text-sm text-white/75 mt-1 leading-snug">{{ s.description }}</p>
                      }
                      <p class="text-xs text-white/60 mt-2 flex items-center gap-1.5">
                        <span class="material-icons text-[14px]" aria-hidden="true">topic</span>
                        {{ s.topics.length }} topic{{ s.topics.length !== 1 ? 's' : '' }} · {{ activeTopicCount(s) }} active
                      </p>
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0">
                      <button (click)="openStackForm(s)" class="press w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors" title="Edit stack" aria-label="Edit stack">
                        <span class="material-icons text-[18px]" aria-hidden="true">edit</span>
                      </button>
                      <button (click)="toggleStack(s)" class="press w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                              [title]="s.active ? 'Deactivate' : 'Activate'" [attr.aria-label]="s.active ? 'Deactivate stack' : 'Activate stack'">
                        <span class="material-icons text-[18px]" aria-hidden="true">{{ s.active ? 'toggle_on' : 'toggle_off' }}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Topics -->
                <div class="p-5">
                  <div class="flex items-center justify-between mb-3.5">
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Topics</p>
                    <button (click)="openTopicForm(s)" appBtn="soft" size="sm">
                      <span class="material-icons text-[15px]" aria-hidden="true">add</span> Add Topic
                    </button>
                  </div>

                  @if (s.topics.length === 0) {
                    <div class="py-10 flex flex-col items-center gap-2 text-center text-slate-400">
                      <span class="material-icons text-3xl" aria-hidden="true">topic</span>
                      <p class="text-sm">No topics yet — add the first one.</p>
                    </div>
                  } @else {
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      @for (topic of s.topics; track topic.id) {
                        <div class="group flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-colors bg-slate-50 dark:bg-white/[0.03] border-slate-100 dark:border-white/[0.06] hover:border-indigo-200 dark:hover:border-white/15"
                             [class.opacity-50]="!topic.active">
                          <span class="w-2 h-2 rounded-full flex-shrink-0" [class]="topic.active ? 'bg-emerald-400' : 'bg-slate-300'"></span>
                          <span class="text-sm text-slate-700 dark:text-slate-200 flex-1 min-w-0 truncate">{{ topic.topicName }}</span>
                          <div class="flex items-center gap-0.5 flex-shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button (click)="openTopicForm(s, topic)"
                                    class="press p-1.5 rounded-lg hover:bg-white dark:hover:bg-white/10 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    title="Edit topic" aria-label="Edit topic">
                              <span class="material-icons text-[15px]" aria-hidden="true">edit</span>
                            </button>
                            <button (click)="toggleTopic(s, topic)"
                                    class="press p-1.5 rounded-lg hover:bg-white dark:hover:bg-white/10 transition-colors"
                                    [class]="topic.active ? 'text-slate-400 hover:text-amber-500' : 'text-slate-400 hover:text-emerald-500'"
                                    [title]="topic.active ? 'Deactivate' : 'Activate'"
                                    [attr.aria-label]="topic.active ? 'Deactivate topic' : 'Activate topic'">
                              <span class="material-icons text-[15px]" aria-hidden="true">{{ topic.active ? 'toggle_on' : 'toggle_off' }}</span>
                            </button>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            } @else {
              <div class="card py-20 flex flex-col items-center gap-3 text-center text-slate-400">
                <span class="material-icons text-4xl" aria-hidden="true">touch_app</span>
                <p class="text-sm font-medium">Select a stack to manage its topics</p>
              </div>
            }
          </div>
        </div>
      }

    </div>

    <!-- ─── Stack Modal ──────────────────────────────────────────────────────── -->
    @if (stackModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4" (click)="closeModals()">
        <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"></div>
        <div class="relative card w-full max-w-md p-6 animate-scale-in"
             role="dialog" aria-modal="true" aria-labelledby="stack-modal-title"
             (click)="$event.stopPropagation()">

          <h2 id="stack-modal-title" class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
            {{ editingStack() ? 'Edit Stack' : 'New Stack' }}
          </h2>
          <p class="text-sm text-slate-400 mb-5">Fill in the details below</p>

          <div class="space-y-4">
            <div>
              <label for="stack-name" class="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Stack Name <span class="text-rose-500">*</span>
              </label>
              <input id="stack-name" [(ngModel)]="stackForm.stackName"
                     placeholder="e.g. Angular, Spring Boot, PostgreSQL"
                     class="field w-full px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label for="stack-description" class="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea id="stack-description" [(ngModel)]="stackForm.description"
                        placeholder="Brief description (optional)" rows="3"
                        class="field w-full px-4 py-2.5 text-sm resize-none"></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button (click)="closeModals()" appBtn="secondary">Cancel</button>
            <button [disabled]="!stackForm.stackName.trim() || saving()" (click)="saveStack()" appBtn="primary">
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
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4" (click)="closeModals()">
        <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"></div>
        <div class="relative card w-full max-w-sm p-6 animate-scale-in"
             role="dialog" aria-modal="true" aria-labelledby="topic-modal-title"
             (click)="$event.stopPropagation()">

          <h2 id="topic-modal-title" class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
            {{ editingTopic() ? 'Edit Topic' : 'New Topic' }}
          </h2>
          <p class="text-sm text-slate-400 mb-5">
            Stack: <span class="font-semibold text-slate-600 dark:text-slate-300">{{ targetStack()?.stackName }}</span>
          </p>

          <div>
            <label for="topic-name" class="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Topic Name <span class="text-rose-500">*</span>
            </label>
            <input id="topic-name" [(ngModel)]="topicForm.topicName"
                   placeholder="e.g. Components, Dependency Injection"
                   class="field w-full px-4 py-2.5 text-sm" />
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button (click)="closeModals()" appBtn="secondary">Cancel</button>
            <button [disabled]="!topicForm.topicName.trim() || saving()" (click)="saveTopic()" appBtn="primary">
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

  search = signal('');
  statusFilter = signal<'all' | 'active' | 'inactive'>('all');

  totalTopics  = computed(() => this.stacks().reduce((n, s) => n + s.topics.length, 0));
  activeStacks = computed(() => this.stacks().filter(s => s.active).length);
  filteredStacks = computed(() => {
    const q = this.search().trim().toLowerCase();
    const sf = this.statusFilter();
    return this.stacks().filter(s => {
      if (sf === 'active' && !s.active) return false;
      if (sf === 'inactive' && s.active) return false;
      if (q && !s.stackName.toLowerCase().includes(q) && !(s.description ?? '').toLowerCase().includes(q)) return false;
      return true;
    });
  });

  /** Master–detail selection: the stack shown in the right panel (falls back to the first). */
  selectedId = signal<number | null>(null);
  current = computed(() => {
    const list = this.filteredStacks();
    const id = this.selectedId();
    return list.find(s => s.id === id) ?? list[0] ?? null;
  });
  select(s: StackDetail): void { this.selectedId.set(s.id); }
  activeTopicCount(s: StackDetail): number { return s.topics.filter(t => t.active).length; }

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
          this.selectedId.set(res.data.id);
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
