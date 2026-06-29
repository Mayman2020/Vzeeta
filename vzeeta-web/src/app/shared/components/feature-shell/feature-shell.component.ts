import { Component, Input } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../page-header/page-header.component';

@Component({
  selector: 'app-feature-shell',
  standalone: true,
  imports: [NgFor, NgIf, TranslateModule, MatIconModule, MatCardModule, MatTableModule, PageHeaderComponent],
  template: `
    <app-page-header [titleKey]="titleKey" [subtitleKey]="subtitleKey"></app-page-header>
    <div class="tb-grid-2" *ngIf="stats?.length">
      <mat-card *ngFor="let s of stats" class="tb-stat-card">
        <div class="stat-value">{{ s.value }}</div>
        <div class="stat-label">{{ s.labelKey | translate }}</div>
      </mat-card>
    </div>
    <mat-card class="content-card">
      <ng-content></ng-content>
      <div class="empty-state" *ngIf="empty">
        <mat-icon>{{ emptyIcon }}</mat-icon>
        <p>{{ emptyKey | translate }}</p>
      </div>
    </mat-card>
  `,
  styles: [`.content-card { margin-top: 1rem; padding: 1.5rem; }`]
})
export class FeatureShellComponent {
  @Input({ required: true }) titleKey!: string;
  @Input() subtitleKey?: string;
  @Input() stats?: { value: string | number; labelKey: string }[];
  @Input() empty = true;
  @Input() emptyKey = 'COMMON.NO_DATA';
  @Input() emptyIcon = 'inbox';
}
