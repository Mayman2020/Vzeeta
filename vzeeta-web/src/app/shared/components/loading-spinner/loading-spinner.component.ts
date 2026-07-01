import { Component, Input } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [NgIf, AsyncPipe, MatProgressSpinnerModule],
  template: `
    <div class="loading-overlay" *ngIf="local !== null ? local : (loading.isLoading$ | async)">
      <mat-spinner diameter="48"></mat-spinner>
    </div>
  `
})
export class LoadingSpinnerComponent {
  @Input() local: boolean | null = null;
  constructor(readonly loading: LoadingService) {}
}
