import { McqResponse } from '../../core/models';
import { FilterOption } from './table-ops';

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
