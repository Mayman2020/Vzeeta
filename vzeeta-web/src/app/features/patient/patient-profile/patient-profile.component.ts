import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  PatientService, PatientProfile, PatientAttachment, AttachmentType, BloodType, Gender
} from '../../../core/services/patient.service';
import { AuthService } from '../../../core/services/auth.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { DeleteConfirmService } from '../../../core/services/delete-confirm.service';
import { DateFieldComponent } from '../../../shared/components/date-field/date-field.component';
import { normalizeFileUrl } from '../../../core/utils/file-url-utils';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, ReactiveFormsModule, TranslateModule, MatProgressSpinnerModule, DateFieldComponent],
  templateUrl: './patient-profile.component.html',
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
    private readonly auth: AuthService,
    private readonly snack: SnackService,
    readonly i18n: I18nService,
    private readonly deleteConfirm: DeleteConfirmService
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
    this.patientService.uploadProfileImage(file).subscribe({
      next: (url) => {
        this.avatarUrl = this.resolveUrl(url);
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
    this.patientService.uploadAttachments(this.activeAttTab, files).subscribe({
      next: (items) => {
        this.attachments = [...this.attachments, ...items];
        this.uploadProgress = 100;
        this.uploading = false;
        this.snack.success(this.i18n.instant('PATIENT.UPLOAD_SUCCESS'));
      },
      error: (e: Error) => {
        this.uploading = false;
        this.snack.error(e.message);
      }
    });
  }

  deleteAttachment(a: PatientAttachment): void {
    this.deleteConfirm.openDeleteConfirm({ messageKey: 'PATIENT.DELETE_ATTACHMENT_CONFIRM' }).subscribe((ok) => {
      if (!ok) return;
      this.patientService.deleteAttachment(a.id).subscribe({
        next: () => {
          this.attachments = this.attachments.filter(x => x.id !== a.id);
          this.snack.success(this.i18n.instant('PATIENT.ATTACHMENT_DELETED'));
        },
        error: (e: Error) => this.snack.error(e.message)
      });
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
    return normalizeFileUrl(raw);
  }
}
