import { Injectable } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { TranslateService } from '@ngx-translate/core';
import { Observable, tap } from 'rxjs';
import { AppConstants } from '../constants/app-constants';
import { formatDateLatin, formatDateTimeLatin } from './locale-format';

export type LangCode = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';

export interface LanguageOption {
  code: LangCode;
  label: string;
  nativeLabel: string;
  dir: Direction;
  flagUrl: string;
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly languages: LanguageOption[] = [
    { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', dir: 'rtl', flagUrl: 'assets/flags/sa.svg' },
    { code: 'en', label: 'English', nativeLabel: 'English', dir: 'ltr', flagUrl: 'assets/flags/gb.svg' }
  ];

  constructor(
    private readonly translate: TranslateService,
    private readonly overlayContainer: OverlayContainer
  ) {
    const saved = this.readSavedLanguage();
    this.translate.addLangs(['ar', 'en']);
    this.translate.setDefaultLang('ar');
    this.setLang(saved).subscribe({ error: () => {} });
  }

  get currentLang(): LangCode {
    return (this.translate.currentLang as LangCode) || 'ar';
  }

  get isRtl(): boolean {
    return this.currentLang === 'ar';
  }

  setLang(code: LangCode): Observable<unknown> {
    const lang = code === 'en' ? 'en' : 'ar';
    localStorage.setItem(AppConstants.PERSISTED_KEYS.LANG, lang);
    this.applyLang(lang);
    return this.translate.use(lang).pipe(tap(() => this.updateTitle()));
  }

  instant(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant(key, params);
  }

  formatDate(value: Date | string | number | null | undefined): string {
    return formatDateLatin(value, this.currentLang);
  }

  formatDateTime(value: Date | string | number | null | undefined): string {
    return formatDateTimeLatin(value, this.currentLang);
  }

  private applyLang(code: LangCode): void {
    const dir = code === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', code);
    document.body.setAttribute('dir', dir);
    try {
      this.overlayContainer.getContainerElement().setAttribute('dir', dir);
    } catch { /* early bootstrap */ }
  }

  private updateTitle(): void {
    const title = this.translate.instant('APP.TITLE');
    if (title && title !== 'APP.TITLE') document.title = title;
  }

  private readSavedLanguage(): LangCode {
    const saved = localStorage.getItem(AppConstants.PERSISTED_KEYS.LANG);
    return saved === 'en' ? 'en' : 'ar';
  }
}
