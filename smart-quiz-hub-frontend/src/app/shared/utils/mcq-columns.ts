import { McqResponse } from '../../core/models';
import { FilterOption } from './table-ops';
import { McqSortField } from '../../core/services/mcq.service';

/**
 * Maps a table-header `sortKey` to a backend-supported sort field.
 * Columns the backend cannot sort (stem, stack, creator, reviewer) fall back to
 * `updatedAt` so the request stays valid while the header still appears active.
 */
export function toBackendSortField(sortKey: string): McqSortField {
  switch (sortKey) {
    case 'updated':    return 'updatedAt';
    case 'created':    return 'createdAt';
    case 'difficulty': return 'difficulty';
    case 'status':     return 'status';
    default:           return 'updatedAt';
  }
}

/** Maps a column key to a comparable/filterable raw value on an MCQ row. */
export function mcqColumnValue(q: McqResponse, key: string): string {
  switch (key) {
    case 'stem':       return q.questionStem ?? '';
    case 'stack':      return q.stackName ?? '';
    case 'topic':      return q.topicName ?? '';
    case 'difficulty': return q.difficulty ?? '';
    case 'status':     return q.status ?? '';
    case 'creator':    return q.creatorName ?? '';
    case 'reviewer':   return q.reviewerName ?? '';
    case 'updated':    return q.updatedAt ?? '';
    case 'created':    return q.createdAt ?? '';
    default:           return '';
  }
}

export const STATUS_FILTER_OPTIONS: FilterOption[] = [
  { value: 'DRAFT',                  label: 'Draft' },
  { value: 'READY_FOR_REVIEW',       label: 'Ready for Review' },
  { value: 'UNDER_REVIEW',           label: 'Under Review' },
  { value: 'MODIFICATION_REQUESTED', label: 'Modification Requested' },
  { value: 'APPROVED',               label: 'Approved' },
  { value: 'REJECTED',               label: 'Rejected' },
];

export const DIFFICULTY_FILTER_OPTIONS: FilterOption[] = [
  { value: 'EASY',   label: 'Easy' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HARD',   label: 'Hard' },
];
