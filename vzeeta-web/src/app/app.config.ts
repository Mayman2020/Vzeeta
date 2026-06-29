import { ApplicationConfig, APP_INITIALIZER, LOCALE_ID, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DateFormatAdapter } from './core/adapters/date-format.adapter';
import { DD_MM_YYYY_DATE_FORMATS } from './core/constants/date-formats';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader, provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { AuthService } from './core/services/auth.service';
import { I18nService } from './core/i18n/i18n.service';
import { PermissionService } from './core/services/permission.service';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (auth: AuthService) => () => auth.clearExpiredTokens(),
      deps: [AuthService],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (auth: AuthService, permissions: PermissionService) => () => {
        auth.clearExpiredTokens();
        if (!auth.isAuthenticated() || auth.mustChangePassword()) return;
        permissions.loadMine().subscribe({ error: () => {} });
      },
      deps: [AuthService, PermissionService],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (i18n: I18nService) => () => i18n,
      deps: [I18nService],
      multi: true
    },
    provideRouter(routes),
    provideAnimationsAsync(),
    { provide: LOCALE_ID, useValue: 'en-US' },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: DateAdapter, useClass: DateFormatAdapter },
    { provide: MAT_DATE_FORMATS, useValue: DD_MM_YYYY_DATE_FORMATS },
    provideHttpClient(withInterceptors([loadingInterceptor, authInterceptor, errorInterceptor])),
    provideTranslateHttpLoader({ prefix: '/assets/i18n/', suffix: '.json' }),
    importProvidersFrom(
      MatSnackBarModule,
      TranslateModule.forRoot({
        loader: { provide: TranslateLoader, useClass: TranslateHttpLoader }
      })
    )
  ]
};
