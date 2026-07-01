import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  PatientService, PatientProfile, PatientAttachment, AttachmentType, BloodType, Gender
} from '../../../core/services/patient.service';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { environment } from '../../../../environments/environment';
import { DateFieldComponent } from '../../../shared/components/date-field/date-field.component';

type RuntimeWindow = Window & { __TB_FILE_URL__?: string };

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, ReactiveFormsModule, TranslateModule, MatProgressSpinnerModule, DateFieldComponent],
  template: `
<div class="app-page pp-page">

  <!-- ══ Header ══ -->
  <div class="pp-header">
    <div class="pp-avatar-area">
      <!-- Avatar -->
      <div class="pp-avatar" (click)="avatarInput.click()">
        <img *ngIf="avatarUrl" [src]="avatarUrl" class="pp-avatar-img" alt="">
        <div *ngIf="!avatarUrl" class="pp-avatar-placeholder">
          <span class="material-icons">person</span>
        </div>
        <div class="pp-avatar-overlay">
          <span class="material-icons">photo_camera</span>
        </div>
        <input #avatarInput type="file" accept="image/*" class="hidden-input" (change)="onAvatarChange($event)">
      </div>
      <div class="pp-avatar-info">
        <h2 class="pp-name">{{ displayName || ('PATIENT.PROFILE_TITLE' | translate) }}</h2>
        <p class="pp-email">{{ currentUser?.email }}</p>
        <span class="pp-role-badge">{{ 'ROLES.PATIENT' | translate }}</span>
      </div>
    </div>
  </div>

  <div class="pp-loading" *ngIf="loading">
    <mat-spinner diameter="40"></mat-spinner>
  </div>

  <div class="pp-body" *ngIf="!loading" [formGroup]="form">

    <!-- ══ Section: Personal Info ══ -->
    <section class="pp-section">
      <div class="pp-section-head">
        <span class="material-icons pp-section-icon">person</span>
        <h3>{{ 'PATIENT.PERSONAL_INFO' | translate }}</h3>
      </div>
      <div class="pp-grid2">
        <div class="pp-field">
          <label>{{ 'AUTH.FULL_NAME' | translate }}</label>
          <div class="pp-input-wrap">
            <span class="material-icons">badge</span>
            <input formControlName="fullNameAr" [placeholder]="'AUTH.FULL_NAME_PLACEHOLDER' | translate">
          </div>
        </div>
        <div class="pp-field">
          <label>{{ 'AUTH.FULL_NAME_EN' | translate }}</label>
          <div class="pp-input-wrap">
            <span class="material-icons">badge</span>
            <input formControlName="fullNameEn" [placeholder]="'AUTH.FULL_NAME_EN_PLACEHOLDER' | translate">
          </div>
        </div>
        <div class="pp-field">
          <label>{{ 'AUTH.PHONE' | translate }}</label>
          <div class="pp-input-wrap">
            <span class="material-icons">phone</span>
            <input formControlName="phone" type="tel">
          </div>
        </div>
        <div class="pp-field">
          <label>{{ 'PATIENT.NATIONAL_ID' | translate }}</label>
          <div class="pp-input-wrap">
            <span class="material-icons">fingerprint</span>
            <input formControlName="nationalId" [placeholder]="'PATIENT.NATIONAL_ID_PLACEHOLDER' | translate">
          </div>
        </div>
        <div class="pp-field pp-field-full">
          <label>{{ 'PATIENT.DATE_OF_BIRTH' | translate }}</label>
          <app-date-field formControlName="dateOfBirth" [embedded]="true"></app-date-field>
        </div>
        <div class="pp-field">
          <label>{{ 'PATIENT.GENDER' | translate }}</label>
          <div class="pp-select-wrap">
            <span class="material-icons">wc</span>
            <select formControlName="gender">
              <option value="">— {{ 'COMMON.SELECT' | translate }} —</option>
              <option value="MALE">{{ 'PATIENT.MALE' | translate }}</option>
              <option value="FEMALE">{{ 'PATIENT.FEMALE' | translate }}</option>
            </select>
          </div>
        </div>
        <div class="pp-field">
          <label>{{ 'PATIENT.BLOOD_TYPE' | translate }}</label>
          <div class="pp-select-wrap">
            <span class="material-icons">bloodtype</span>
            <select formControlName="bloodType">
              <option value="">— {{ 'COMMON.SELECT' | translate }} —</option>
              <option *ngFor="let b of bloodTypes" [value]="b.value">{{ b.label }}</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ Section: Medical Info ══ -->
    <section class="pp-section">
      <div class="pp-section-head">
        <span class="material-icons pp-section-icon pp-section-icon--medical">medical_information</span>
        <h3>{{ 'PATIENT.MEDICAL_INFO' | translate }}</h3>
      </div>
      <div class="pp-grid1">
        <div class="pp-field">
          <label>{{ 'PATIENT.CHIEF_COMPLAINT' | translate }}</label>
          <div class="pp-textarea-wrap">
            <span class="material-icons">sick</span>
            <textarea formControlName="chiefComplaint" rows="3"
              [placeholder]="'PATIENT.CHIEF_COMPLAINT_HINT' | translate"></textarea>
          </div>
        </div>
        <div class="pp-field">
          <label>{{ 'PATIENT.CHRONIC_DISEASES' | translate }}</label>
          <div class="pp-textarea-wrap">
            <span class="material-icons">monitor_heart</span>
            <textarea formControlName="chronicDiseases" rows="2"
              [placeholder]="'PATIENT.CHRONIC_DISEASES_HINT' | translate"></textarea>
          </div>
        </div>
        <div class="pp-field">
          <label>{{ 'PATIENT.ALLERGIES' | translate }}</label>
          <div class="pp-textarea-wrap">
            <span class="material-icons">warning_amber</span>
            <textarea formControlName="allergies" rows="2"
              [placeholder]="'PATIENT.ALLERGIES_HINT' | translate"></textarea>
          </div>
        </div>
        <div class="pp-field">
          <label>{{ 'PATIENT.MEDICAL_HISTORY' | translate }}</label>
          <div class="pp-textarea-wrap">
            <span class="material-icons">history</span>
            <textarea formControlName="medicalHistory" rows="3"
              [placeholder]="'PATIENT.MEDICAL_HISTORY_HINT' | translate"></textarea>
          </div>
        </div>
      </div>
    </section>

    <!-- Save button -->
    <div class="pp-save-row">
      <button class="pp-save-btn" (click)="saveProfile()" [disabled]="saving">
        <span class="pp-btn-spinner" *ngIf="saving"></span>
        <span class="material-icons" *ngIf="!saving">save</span>
        {{ (saving ? 'COMMON.LOADING' : 'COMMON.SAVE') | translate }}
      </button>
    </div>

    <!-- ══ Section: Attachments (Xray / Lab / Scan) ══ -->
    <section class="pp-section pp-attachments-section">
      <div class="pp-section-head">
        <span class="material-icons pp-section-icon pp-section-icon--attach">attach_file</span>
        <h3>{{ 'PATIENT.ATTACHMENTS' | translate }}</h3>
      </div>

      <!-- Attachment Tabs -->
      <div class="att-tabs">
        <button *ngFor="let t of attTabs" class="att-tab" [class.active]="activeAttTab === t.type"
          (click)="switchAttTab(t.type)">
          <span class="material-icons">{{ t.icon }}</span>
          {{ t.label | translate }}
          <span class="att-tab-badge" *ngIf="countOf(t.type) > 0">{{ countOf(t.type) }}</span>
        </button>
      </div>

      <!-- Upload drop zone -->
      <label class="att-upload-zone" [class.is-over]="isDragOver"
        (dragover)="isDragOver = true; $event.preventDefault()"
        (dragleave)="isDragOver = false"
        (drop)="onAttDrop($event)">
        <input type="file" multiple [accept]="activeAttTab === 'XRAY' ? 'image/*,.pdf,.dcm' : 'image/*,.pdf'"
          (change)="onAttFileChange($event)" class="hidden-input">
        <div class="att-upload-content">
          <span class="material-icons att-upload-icon">{{ activeAttTab === 'XRAY' ? 'radiology' : activeAttTab === 'LAB' ? 'science' : 'document_scanner' }}</span>
          <p class="att-upload-text">
            {{ 'PATIENT.DROP_TO_UPLOAD' | translate }}
            <span class="att-upload-browse">{{ 'PATIENT.BROWSE' | translate }}</span>
          </p>
          <p class="att-upload-hint">{{ attHint | translate }}</p>
        </div>
        <div class="att-upload-progress" *ngIf="uploading">
          <div class="att-progress-bar" [style.width.%]="uploadProgress"></div>
        </div>
      </label>

      <!-- Files list -->
      <div class="att-list" *ngIf="filteredAttachments.length > 0">
        <div class="att-item" *ngFor="let a of filteredAttachments">
          <div class="att-item-icon" [ngClass]="attIconClass(a.type)">
            <span class="material-icons">{{ attIcon(a.type) }}</span>
          </div>
          <div class="att-item-info">
            <span class="att-item-name">{{ a.titleAr || fileNameFromUrl(a.fileUrl) }}</span>
            <span class="att-item-date">{{ formatDate(a.uploadedAt) }}</span>
          </div>
          <div class="att-item-actions">
            <a [href]="resolveUrl(a.fileUrl)" target="_blank" rel="noopener" class="att-action-btn view">
              <span class="material-icons">open_in_new</span>
            </a>
            <button class="att-action-btn delete" (click)="deleteAttachment(a)">
              <span class="material-icons">delete</span>
            </button>
          </div>
        </div>
      </div>

      <div class="att-empty" *ngIf="filteredAttachments.length === 0 && !attLoading">
        <span class="material-icons">folder_open</span>
        <p>{{ 'PATIENT.NO_ATTACHMENTS' | translate }}</p>
      </div>
      <div class="att-loading" *ngIf="attLoading"><mat-spinner diameter="32"></mat-spinner></div>
    </section>

  </div>
</div>
  `,
})
export class PatientProfileComponent implements OnInit {
  form: FormGroup;
  loading = true;
  saving = false;
  avatarUrl = '';
  attachments: PatientAttachment[] = [];
  attLoading = false;
  uploading = false;
  uploadProgress = 0;
  isDragOver = false;
  activeAttTab: AttachmentType = 'XRAY';

  readonly bloodTypes: { value: BloodType; label: string }[] = [
    { value: 'A_POS', label: 'A+' }, { value: 'A_NEG', label: 'A−' },
    { value: 'B_POS', label: 'B+' }, { value: 'B_NEG', label: 'B−' },
    { value: 'AB_POS', label: 'AB+' }, { value: 'AB_NEG', label: 'AB−' },
    { value: 'O_POS', label: 'O+' }, { value: 'O_NEG', label: 'O−' },
  ];

  readonly attTabs: { type: AttachmentType; label: string; icon: string }[] = [
    { type: 'XRAY', label: 'PATIENT.XRAYS', icon: 'radiology' },
    { type: 'LAB',  label: 'PATIENT.LAB_TESTS', icon: 'science' },
    { type: 'SCAN', label: 'PATIENT.SCANS', icon: 'document_scanner' },
    { type: 'OTHER',label: 'PATIENT.OTHER_DOCS', icon: 'attach_file' },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly patientService: PatientService,
    private readonly apiService: ApiService,
    private readonly auth: AuthService,
    private readonly snack: SnackService,
    readonly i18n: I18nService
  ) {
    this.form = this.fb.group({
      fullNameAr: [''], fullNameEn: [''], phone: [''], nationalId: [''],
      dateOfBirth: [''], gender: [''], bloodType: [''],
      chiefComplaint: [''], chronicDiseases: [''], allergies: [''], medicalHistory: [''],
    });
  }

  ngOnInit(): void {
    this.patientService.getProfile().subscribe({
      next: (p) => { this.patchForm(p); this.loading = false; },
      error: () => {
        const u = this.auth.getCurrentUser();
        if (u) this.patchForm({ fullNameAr: u.fullNameAr, fullNameEn: u.fullNameEn, phone: u.phone });
        this.loading = false;
      }
    });
    this.loadAttachments();
  }

  get currentUser() { return this.auth.getCurrentUser(); }

  get displayName(): string {
    const v = this.form.value;
    return this.i18n.currentLang === 'ar'
      ? (v.fullNameAr || v.fullNameEn || '')
      : (v.fullNameEn || v.fullNameAr || '');
  }

  get filteredAttachments(): PatientAttachment[] {
    return this.attachments.filter(a => a.type === this.activeAttTab);
  }

  get attHint(): string {
    const map: Record<AttachmentType, string> = {
      XRAY: 'PATIENT.XRAY_HINT', LAB: 'PATIENT.LAB_HINT',
      SCAN: 'PATIENT.SCAN_HINT', OTHER: 'PATIENT.OTHER_HINT'
    };
    return map[this.activeAttTab];
  }

  countOf(type: AttachmentType): number {
    return this.attachments.filter(a => a.type === type).length;
  }

  switchAttTab(t: AttachmentType): void { this.activeAttTab = t; }

  private patchForm(p: PatientProfile): void {
    this.form.patchValue({
      fullNameAr: p.fullNameAr ?? '', fullNameEn: p.fullNameEn ?? '',
      phone: p.phone ?? '', nationalId: p.nationalId ?? '',
      dateOfBirth: p.dateOfBirth ?? '', gender: p.gender ?? '', bloodType: p.bloodType ?? '',
      chiefComplaint: p.chiefComplaint ?? '', chronicDiseases: p.chronicDiseases ?? '',
      allergies: p.allergies ?? '', medicalHistory: p.medicalHistory ?? '',
    });
    if (p.profileImageUrl) this.avatarUrl = this.resolveUrl(p.profileImageUrl);
  }

  saveProfile(): void {
    if (this.saving) return;
    this.saving = true;
    const v = this.form.value as PatientProfile;
    this.patientService.updateProfile(v).subscribe({
      next: () => { this.saving = false; this.snack.success(this.i18n.instant('PATIENT.PROFILE_SAVED')); },
      error: (e: Error) => { this.saving = false; this.snack.error(e.message); }
    });
  }

  onAvatarChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.apiService.uploadFile(file).subscribe({
      next: (res) => {
        this.avatarUrl = this.resolveUrl(res.url);
        this.patientService.updateProfile({ profileImageUrl: res.url }).subscribe();
      },
      error: (e: Error) => this.snack.error(e.message)
    });
  }

  private loadAttachments(): void {
    this.attLoading = true;
    this.patientService.getAttachments().subscribe({
      next: (list) => { this.attachments = list; this.attLoading = false; },
      error: () => { this.attLoading = false; }
    });
  }

  onAttFileChange(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    this.uploadFiles(files);
    (event.target as HTMLInputElement).value = '';
  }

  onAttDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const files = Array.from(event.dataTransfer?.files ?? []);
    this.uploadFiles(files);
  }

  private uploadFiles(files: File[]): void {
    if (!files.length) return;
    this.uploading = true;
    this.uploadProgress = 0;
    const step = 100 / files.length;
    let done = 0;

    files.forEach(file => {
      this.apiService.uploadFile(file).subscribe({
        next: (res) => {
          const payload = { type: this.activeAttTab, fileUrl: res.url, titleAr: file.name };
          this.patientService.addAttachment(payload).subscribe({
            next: (att) => {
              this.attachments = [...this.attachments, att];
              done++;
              this.uploadProgress = done * step;
              if (done === files.length) { this.uploading = false; this.snack.success(this.i18n.instant('PATIENT.UPLOAD_SUCCESS')); }
            },
            error: () => { done++; if (done === files.length) this.uploading = false; }
          });
        },
        error: (e: Error) => {
          done++;
          this.snack.error(e.message);
          if (done === files.length) this.uploading = false;
        }
      });
    });
  }

  deleteAttachment(a: PatientAttachment): void {
    this.patientService.deleteAttachment(a.id).subscribe({
      next: () => {
        this.attachments = this.attachments.filter(x => x.id !== a.id);
        this.snack.success(this.i18n.instant('PATIENT.ATTACHMENT_DELETED'));
      },
      error: (e: Error) => this.snack.error(e.message)
    });
  }

  attIcon(type: AttachmentType): string {
    return { XRAY: 'radiology', LAB: 'science', SCAN: 'document_scanner', OTHER: 'attach_file' }[type] ?? 'attach_file';
  }

  attIconClass(type: AttachmentType): string {
    return { XRAY: 'xray', LAB: 'lab', SCAN: 'scan', OTHER: 'other' }[type] ?? 'other';
  }

  fileNameFromUrl(url: string): string {
    return url?.split('/').pop()?.split('?')[0] ?? url;
  }

  formatDate(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
  }

  resolveUrl(raw: string): string {
    if (!raw?.trim()) return '';
    if (raw.startsWith('http')) return raw;
    const base = (typeof window !== 'undefined' && (window as RuntimeWindow).__TB_FILE_URL__) || environment.fileUrl;
    return raw.startsWith('/') ? `${base.replace(/\/$/,'')}${raw}` : `${base.replace(/\/$/,'')}/${raw}`;
  }
}
