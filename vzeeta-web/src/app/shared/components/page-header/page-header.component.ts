import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Location, NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { NavigationHistoryService } from '../../../core/services/navigation-history.service';
import { I18nService } from '../../../core/i18n/i18n.service';

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, TranslateModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <header class="app-page-header" role="banner">
      <div class="page-heading">
        <nav
          class="app-breadcrumb"
          *ngIf="breadcrumbs.length"
          [attr.aria-label]="'PAGE.BREADCRUMB_LABEL' | translate">
          <ng-container *ngFor="let crumb of breadcrumbs; let last = last">
            <a *ngIf="!last && crumb.route" [routerLink]="crumb.route">{{ crumb.label }}</a>
            <span *ngIf="!last && !crumb.route">{{ crumb.label }}</span>
            <span class="sep" *ngIf="!last" aria-hidden="true">/</span>
            <span class="current" *ngIf="last">{{ crumb.label }}</span>
          </ng-container>
        </nav>
        <p class="app-page-eyebrow" *ngIf="eyebrow">{{ eyebrow }}</p>
        <h1 class="tb-page-title app-page-title">{{ pageTitle }}</h1>
        <p class="tb-page-subtitle app-page-subtitle" *ngIf="pageSubtitle">{{ pageSubtitle }}</p>
      </div>
      <div class="page-actions">
        <ng-content></ng-content>
        <button
          mat-icon-button
          class="tb-action-btn app-back-btn smart-back-btn"
          type="button"
          *ngIf="shouldShowBack"
          [matTooltip]="'COMMON.BACK' | translate"
          [attr.aria-label]="'COMMON.BACK' | translate"
          (click)="onBackClick()">
          <mat-icon>arrow_back</mat-icon>
        </button>
      </div>
    </header>
  `,
  styles: [`
    :host { display: block; }
    .page-heading {
      min-width: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    .app-page-eyebrow {
      font-size: 0.76rem;
      color: var(--primary, var(--blue-600));
      font-weight: 700;
      margin: 0 0 0.35rem;
    }
    .page-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      flex-wrap: wrap;
      flex-shrink: 0;
    }
    html[dir='rtl'] .smart-back-btn mat-icon {
      transform: scaleX(-1);
    }
  `]
})
export class PageHeaderComponent implements OnInit, OnDestroy {
  @Input() eyebrow = '';
  @Input() title = '';
  @Input() subtitle = '';
  @Input() breadcrumbs: BreadcrumbItem[] = [];
  @Input() showBack = false;
  @Output() backClick = new EventEmitter<void>();

  @Input() titleKey?: string;
  @Input() subtitleKey?: string;

  canGoBack = false;
  private sub?: Subscription;

  constructor(
    private readonly navHistory: NavigationHistoryService,
    private readonly location: Location,
    private readonly i18n: I18nService
  ) {}

  get pageTitle(): string {
    return this.title || this.i18n.label(this.titleKey);
  }

  get pageSubtitle(): string {
    return this.subtitle || this.i18n.label(this.subtitleKey);
  }

  get shouldShowBack(): boolean {
    return this.showBack ? this.canGoBack : this.canGoBack;
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

  onBackClick(): void {
    if (this.backClick.observed) {
      this.backClick.emit();
      return;
    }
    this.navHistory.goBack(this.location);
  }
}
