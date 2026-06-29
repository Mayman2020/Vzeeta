import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class SnackService {
  constructor(private readonly snack: MatSnackBar) {}

  success(message: string): void {
    this.snack.open(message, undefined, { duration: 3500, panelClass: ['snack-success'] });
  }

  error(message: string): void {
    this.snack.open(message, undefined, { duration: 5000, panelClass: ['snack-error'] });
  }

  info(message: string): void {
    this.snack.open(message, undefined, { duration: 3500 });
  }
}
