import type { TimeFilter } from '../../types';

export const getDateRange = (
  timeFilter: TimeFilter,
  dateFrom: string,
  dateTo: string
): { dateFrom?: string; dateTo?: string } => {
  if (timeFilter === 'custom') {
    return {
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    };
  }

  if (timeFilter === 'all') {
    return {};
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let startDate: Date;

  switch (timeFilter) {
    case 'today':
      startDate = today;
      break;
    case 'week':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 1);
      break;
    default:
      return {};
  }

  return {
    dateFrom: startDate.toISOString(),
    dateTo: now.toISOString(),
  };
};































