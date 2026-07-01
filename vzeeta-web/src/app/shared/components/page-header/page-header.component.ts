import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Location, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { NavigationHistoryService } from '../../../core/services/navigation-history.service';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [NgIf, TranslateModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <header class="page-header app-page-header">
      <div class="page-heading">
        <h1 class="tb-page-title app-page-title">{{ pageTitle }}</h1>
        <p class="tb-page-subtitle app-page-subtitle" *ngIf="pageSubtitle">{{ pageSubtitle }}</p>
      </div>
      <div class="page-actions">
        <ng-content></ng-content>
        <button
          mat-icon-button
          class="tb-action-btn smart-back-btn"
          type="button"
          *ngIf="canGoBack"
          [matTooltip]="'COMMON.BACK' | translate"
          (click)="onBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
      </div>
    </header>
  `,
  styles: [`
    .page-header { margin-bottom: 1rem; }
    .page-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      flex-wrap: wrap;
    }
    html[dir='rtl'] .smart-back-btn mat-icon {
      transform: scaleX(-1);
    }
  `]
})
export class PageHeaderComponent implements OnInit, OnDestroy {
  @Input({ required: true }) titleKey!: string;
  @Input() subtitleKey?: string;

  canGoBack = false;
  private sub?: Subscription;

  constructor(
    private readonly navHistory: NavigationHistoryService,
    private readonly location: Location,
    private readonly i18n: I18nService
  ) {}

  get pageTitle(): string {
    return this.i18n.label(this.titleKey);
  }

  get pageSubtitle(): string {
    return this.i18n.label(this.subtitleKey);
  }

  ngOnInit(): void {
    this.canGoBack = this.navHistory.canGoBack();
    this.sub = this.navHistory.canGoBack$.subscribe((value) => {
      this.canGoBack = value;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onBack(): void {
    this.navHistory.goBack(this.location);
  }
}
