import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';

export interface OpenDeleteConfirmOptions {
  titleKey?: string;
  messageKey?: string;
  confirmLabelKey?: string;
}

@Injectable({ providedIn: 'root' })
export class DeleteConfirmService {
  private readonly dialog = inject(MatDialog);
  private readonly panel = { width: '440px', maxWidth: '95vw', panelClass: 'app-dialog-panel' as const };

  openDeleteConfirm(opts: OpenDeleteConfirmOptions): Observable<boolean> {
    const data: ConfirmDialogData = {
      title: opts.titleKey ?? 'DIALOG.DELETE_TITLE',
      message: opts.messageKey ?? 'DIALOG.DELETE_GENERIC',
      confirmLabel: opts.confirmLabelKey ?? 'ACTIONS.DELETE',
      cancelLabel: 'COMMON.CANCEL',
      danger: true,
      icon: 'warning'
    };
    return this.dialog.open(ConfirmDialogComponent, { data, ...this.panel }).afterClosed().pipe(map(Boolean));
  }
}
