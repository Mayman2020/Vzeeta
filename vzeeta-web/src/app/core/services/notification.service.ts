import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PatientService } from './patient.service';
import { withPageParams } from '../utils/pagination.util';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly unreadCountSubject = new BehaviorSubject<number | null>(null);
  readonly unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private readonly patientService: PatientService) {}

  refreshUnreadCount(): void {
    this.patientService.getNotifications(withPageParams(0, 100)).subscribe({
      next: (page) => {
        const count = page.content.filter((item) => !item.readFlag).length;
        this.setUnreadCount(count);
      },
      error: () => this.setUnreadCount(0)
    });
  }

  setUnreadCount(count: number): void {
    this.unreadCountSubject.next(Math.max(0, count));
  }
}
