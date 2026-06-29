import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { DoctorFinderDialogComponent } from '../doctor-finder-dialog/doctor-finder-dialog.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule, MatDialogModule, MatIconModule, TranslateModule],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.scss'
})
export class PublicLayoutComponent {
  constructor(
    readonly auth: AuthService,
    readonly i18n: I18nService,
    private readonly dialog: MatDialog
  ) {}

  switchLang(): void {
    this.i18n.setLang(this.i18n.currentLang === 'ar' ? 'en' : 'ar').subscribe();
  }

  openDoctorFinder(): void {
    this.dialog.open(DoctorFinderDialogComponent, {
      panelClass: 'doctor-finder-panel',
      autoFocus: false,
      restoreFocus: false,
      maxWidth: 'calc(100vw - 24px)'
    });
  }
}
