import { Pipe, PipeTransform } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';

type RmsDateMode = 'date' | 'datetime';

@Pipe({
  name: 'rmsDate',
  standalone: true,
  pure: false
})
export class RmsDatePipe implements PipeTransform {
  constructor(private readonly i18n: I18nService) {}

  transform(value: Date | string | number | null | undefined, mode: RmsDateMode = 'date'): string {
    if (!value) return '-';
    if (mode === 'datetime') return this.i18n.formatDateTime(value);
    return this.i18n.formatDate(value);
  }
}
