import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

export function formatDate(isoString: string): string {
  return dayjs(isoString).format('D MMMM YYYY');
}
