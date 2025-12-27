import { format } from 'date-fns';

function getUrlFriendlyDateTime({ date = new Date() }: { date?: Date } = {}) {
  return format(date, 'yyyy-MM-dd-HH-mm-ss');
}

export { getUrlFriendlyDateTime };
