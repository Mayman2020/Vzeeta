import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { NabdLogoComponent } from '../../../shared/components/nabd-logo/nabd-logo.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, RouterLink, TranslateModule, NabdLogoComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  showPassword = false;
  error = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly snack: SnackService,
    readonly i18n: I18nService
  ) {
    this.form = this.fb.group({
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
    this.error = '';
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
        this.error = err.message || this.i18n.instant('AUTH.REGISTER_FAILED');
        this.snack.error(this.error);
      }
    });
  }
}
