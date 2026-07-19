import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-clinic-subscription-locked',
  standalone: true,
  imports: [TranslateModule, MatButtonModule, MatIconModule],
  template: `
    <div class="app-page" style="display:flex; align-items:center; justify-content:center; min-height:60vh;">
      <div class="app-card" style="max-width:480px; padding:40px; text-align:center;">
        <mat-icon style="font-size:64px; width:64px; height:64px; color:#e65100;">lock</mat-icon>
        <h2>{{ 'SUBSCRIPTION.LOCKED_TITLE' | translate }}</h2>
        <p>{{ 'SUBSCRIPTION.LOCKED_MESSAGE' | translate }}</p>
        <button mat-flat-button color="primary" type="button" (click)="goToSubscription()">
          <mat-icon>workspace_premium</mat-icon> {{ 'SUBSCRIPTION.GO_TO_SUBSCRIPTION' | translate }}
        </button>
      </div>
    </div>
  `
})
export class ClinicSubscriptionLockedComponent {
  constructor(private readonly router: Router) {}

  goToSubscription(): void {
    void this.router.navigate(['/clinic-admin/subscription']);
  }
}
