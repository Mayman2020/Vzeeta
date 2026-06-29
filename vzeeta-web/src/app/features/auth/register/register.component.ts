import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    NgIf, NgFor, ReactiveFormsModule, RouterLink, TranslateModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCardModule, MatSelectModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  showPassword = false;
  roles: { value: UserRole; labelKey: string }[] = [
    { value: 'PATIENT', labelKey: 'ROLES.PATIENT' },
    { value: 'DOCTOR', labelKey: 'ROLES.DOCTOR' }
  ];

  constructor(
    fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly snack: SnackService,
    readonly i18n: I18nService
  ) {
    this.form = fb.group({
      fullNameAr: ['', Validators.required],
      fullNameEn: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['PATIENT', Validators.required]
    });
  }

  submit(): void {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    const v = this.form.value;
    this.auth.register({
      fullNameAr: v.fullNameAr,
      fullNameEn: v.fullNameEn || undefined,
      email: v.email,
      phone: v.phone,
      password: v.password,
      role: v.role
    }).subscribe({
      next: () => {
        this.loading = false;
        this.snack.success(this.i18n.instant('AUTH.REGISTER_SUCCESS'));
        void this.router.navigateByUrl(this.auth.getDashboardRoute());
      },
      error: (err: Error) => {
        this.loading = false;
        this.snack.error(err.message || this.i18n.instant('AUTH.REGISTER_FAILED'));
      }
    });
  }
}
