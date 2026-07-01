import {
  ChangeDetectorRef, Component, ElementRef, EventEmitter,
  inject, Input, OnChanges, Output, SimpleChanges, ViewChild
} from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';
import { SnackService } from '../../../core/services/snack.service';

export interface UploadedFile {
  file: File;
  preview?: string;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
}

@Component({
  selector: 'app-upload-zone',
  standalone: true,
  imports: [NgClass, NgFor, NgIf, TranslateModule, MatProgressSpinnerModule],
  template: `
    <div class="upload-zone-host" [ngClass]="{ 'host--identity': useIdentityLayout }">
      <ng-container *ngIf="useIdentityLayout; else cloudLayoutTmpl">
        <div
          class="identity-strip"
          [class.identity-strip--drag]="isDragOver"
          (dragover)="onDragOver($event)"
          (dragleave)="isDragOver = false"
          (drop)="onDrop($event)"
        >
          <div
            class="identity-tile"
            *ngFor="let url of workingUrls; let i = index; trackBy: trackByUrl"
            [class.identity-tile--round]="tileRound"
          >
            <a class="identity-thumb" [href]="url" target="_blank" rel="noopener" (click)="$event.stopPropagation()">
              <img *ngIf="urlKind(url) === 'IMAGE'" [src]="url" alt="" />
              <span class="material-icons identity-doc-ico" *ngIf="urlKind(url) === 'VIDEO'">videocam</span>
              <span class="material-icons identity-doc-ico" *ngIf="urlKind(url) === 'DOCUMENT'">description</span>
            </a>
            <span class="identity-fname">{{ fileNameFromUrl(url) }}</span>
            <div class="identity-toolbar" *ngIf="!readOnly">
              <a class="tb-btn" [href]="url" target="_blank" rel="noopener" [attr.title]="'COMMON.VIEW_FILE' | translate">
                <span class="material-icons">open_in_new</span>
              </a>
              <a class="tb-btn" [href]="url" download target="_blank" rel="noopener" [attr.title]="'ACTIONS.DOWNLOAD' | translate">
                <span class="material-icons">download</span>
              </a>
              <button type="button" class="tb-btn tb-btn--danger" (click)="removeBound($event, i)" [attr.aria-label]="'ACTIONS.DELETE' | translate">
                <span class="material-icons">delete_outline</span>
              </button>
              <button type="button" class="tb-btn tb-btn--accent" (click)="triggerPick()" [disabled]="uploading" [attr.aria-label]="'UPLOAD.REPLACE_FILE' | translate">
                <span class="material-icons">drive_folder_upload</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            class="identity-add"
            *ngIf="!readOnly && (multiple || workingUrls.length === 0)"
            (click)="triggerPick()"
            [disabled]="uploading"
          >
            <mat-spinner *ngIf="uploading" diameter="22" class="identity-add-spinner"></mat-spinner>
            <ng-container *ngIf="!uploading">
              <span class="material-icons identity-add-ico">{{ multiple ? 'drive_folder_upload' : 'add_a_photo' }}</span>
              <span class="identity-add-text">{{ label }}</span>
            </ng-container>
          </button>
        </div>
        <p class="identity-hint" *ngIf="!readOnly">{{ uploadHintKey | translate }}</p>

        <div class="upload-hero" *ngIf="showHeroPreview && heroImageUrl">
          <img [src]="heroImageUrl" alt="" />
        </div>
      </ng-container>

      <ng-template #cloudLayoutTmpl>
        <div
          *ngIf="!readOnly"
          class="upload-zone"
          [class.drag-over]="isDragOver"
          [class.upload-zone--busy]="uploading"
          (dragover)="onDragOver($event)"
          (dragleave)="isDragOver = false"
          (drop)="onDrop($event)"
          (click)="triggerPick()"
        >
          <mat-spinner *ngIf="uploading" class="zone-spinner" diameter="36"></mat-spinner>
          <ng-container *ngIf="!uploading">
            <span class="material-icons upload-icon">cloud_upload</span>
            <p class="upload-text">{{ label }}</p>
            <p class="upload-hint">{{ uploadHintKey | translate }}</p>
          </ng-container>
        </div>

        <div class="file-previews" *ngIf="isControlled && workingUrls.length">
          <div class="file-preview-item" *ngFor="let url of workingUrls; let i = index; trackBy: trackByUrl">
            <a class="thumb-link" [href]="url" target="_blank" rel="noopener" (click)="$event.stopPropagation()">
              <img *ngIf="urlKind(url) === 'IMAGE'" [src]="url" alt="" />
              <span class="material-icons file-icon" *ngIf="urlKind(url) === 'VIDEO'">videocam</span>
              <span class="material-icons file-icon" *ngIf="urlKind(url) === 'DOCUMENT'">insert_drive_file</span>
            </a>
            <a class="file-name" [href]="url" target="_blank" rel="noopener" (click)="$event.stopPropagation()">{{ fileNameFromUrl(url) }}</a>
            <button *ngIf="!readOnly" type="button" class="remove-btn" (click)="removeBound($event, i)" [attr.aria-label]="'ACTIONS.DELETE' | translate">
              <span class="material-icons">close</span>
            </button>
          </div>
        </div>

        <div class="upload-hero" *ngIf="isControlled && showHeroPreview && heroImageUrl">
          <img [src]="heroImageUrl" alt="" />
        </div>

        <div class="file-previews" *ngIf="!isControlled && files.length">
          <div class="file-preview-item" *ngFor="let f of files; let i = index; trackBy: trackByFile">
            <span class="thumb-link">
              <img *ngIf="f.type === 'IMAGE' && f.preview" [src]="f.preview" alt="" />
              <span class="material-icons file-icon" *ngIf="f.type === 'VIDEO'">videocam</span>
              <span class="material-icons file-icon" *ngIf="f.type === 'DOCUMENT'">insert_drive_file</span>
            </span>
            <span class="file-name">{{ f.file.name }}</span>
            <button type="button" class="remove-btn" (click)="removeLegacy($event, i)" [attr.aria-label]="'ACTIONS.DELETE' | translate">
              <span class="material-icons">close</span>
            </button>
          </div>
        </div>

        <div class="upload-hero" *ngIf="!isControlled && showHeroPreview && legacyHeroImageUrl">
          <img [src]="legacyHeroImageUrl" alt="" />
        </div>
      </ng-template>

      <input #fileInput type="file" [multiple]="multiple" [accept]="accept" hidden (change)="onFileChange($event)" />
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    .upload-zone-host { display: grid; gap: 12px; }

    .upload-zone {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 32px 20px;
      border: 2px dashed var(--gray-300, #d1d5db);
      border-radius: 12px;
      background: var(--gray-50, #f9fafb);
      cursor: pointer;
      transition: border-color 160ms, background 160ms;
      min-height: 130px;
    }
    .upload-zone:hover:not(.upload-zone--busy) {
      border-color: var(--blue-500, #3b82f6);
      background: rgba(59, 130, 246, 0.04);
    }
    .upload-zone.drag-over {
      border-color: var(--blue-500, #3b82f6);
      background: rgba(59, 130, 246, 0.08);
    }
    .upload-zone--busy { pointer-events: none; opacity: 0.72; }
    .zone-spinner { position: absolute; inset: 0; margin: auto; }
    .upload-icon { font-size: 40px; color: var(--blue-400, #60a5fa); }
    .upload-text { margin: 0; font-size: 14px; font-weight: 600; color: var(--gray-700, #374151); }
    .upload-hint { margin: 0; font-size: 12px; color: var(--gray-500, #6b7280); }

    .file-previews { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 4px; }
    .file-preview-item {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 96px;
      gap: 4px;
    }
    .thumb-link {
      display: flex;
      width: 80px;
      height: 60px;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--gray-200, #e5e7eb);
      background: var(--gray-100, #f3f4f6);
      text-decoration: none;
      color: inherit;
      align-items: center;
      justify-content: center;
    }
    .thumb-link img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .file-icon { font-size: 36px; color: var(--gray-500, #6b7280); }
    .file-name {
      font-size: 0.7rem;
      color: var(--gray-500, #6b7280);
      word-break: break-word;
      text-align: center;
      max-width: 96px;
      text-decoration: none;
      line-height: 1.25;
    }
    .file-name:hover { text-decoration: underline; color: var(--gray-800, #1f2937); }
    .remove-btn {
      position: absolute;
      inset-block-start: -6px;
      inset-inline-end: -6px;
      width: 22px;
      height: 22px;
      padding: 0;
      border-radius: 50%;
      border: none;
      background: #dc2626;
      color: #fff;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .remove-btn .material-icons { font-size: 14px; }
    .upload-hero {
      overflow: hidden;
      border-radius: 12px;
      border: 1px solid var(--gray-200, #e5e7eb);
      background: var(--gray-100, #f3f4f6);
      min-height: 200px;
      max-height: 320px;
    }
    .upload-hero img { display: block; width: 100%; height: 100%; max-height: 320px; object-fit: cover; }

    /* Identity layout */
    .host--identity { gap: 10px; }
    .identity-strip { display: flex; flex-wrap: wrap; gap: 12px; align-items: stretch; padding: 4px 0; }
    .identity-strip--drag {
      outline: 2px dashed var(--blue-500, #3b82f6);
      outline-offset: 4px;
      border-radius: 12px;
    }
    .identity-tile {
      width: 148px;
      border: 1px solid var(--gray-200, #e5e7eb);
      border-radius: 12px;
      background: var(--gray-50, #f9fafb);
      padding: 10px 10px 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      box-sizing: border-box;
    }
    .identity-tile--round .identity-thumb { width: 72px; height: 72px; border-radius: 50%; }
    .identity-thumb {
      display: flex;
      width: 100%;
      max-width: 120px;
      height: 72px;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid var(--gray-200, #e5e7eb);
      background: var(--white, #fff);
      align-items: center;
      justify-content: center;
      text-decoration: none;
      color: inherit;
    }
    .identity-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .identity-doc-ico { font-size: 36px; color: var(--blue-600, #2563eb); opacity: 0.85; }
    .identity-fname {
      font-size: 0.68rem;
      color: var(--gray-500, #6b7280);
      text-align: center;
      line-height: 1.25;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .identity-toolbar {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      justify-content: center;
      gap: 2px;
      padding: 2px 4px;
      border-radius: 8px;
      border: 1px solid var(--gray-200, #e5e7eb);
      background: var(--white, #fff);
      width: 100%;
      max-width: 132px;
    }
    .tb-btn {
      flex: 0 0 32px;
      width: 32px;
      height: 32px;
      padding: 0;
      border: none;
      background: transparent;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--gray-500, #6b7280);
      text-decoration: none;
    }
    .tb-btn:hover { background: var(--gray-100, #f3f4f6); }
    .tb-btn .material-icons { font-size: 18px; }
    .tb-btn--danger .material-icons { color: #dc2626; }
    .tb-btn--accent .material-icons { color: var(--blue-600, #2563eb); }
    .tb-btn[disabled] { opacity: 0.45; cursor: not-allowed; }
    .identity-add {
      width: 148px;
      min-height: 118px;
      border: 1px dashed var(--gray-300, #d1d5db);
      border-radius: 12px;
      background: var(--gray-50, #f9fafb);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      cursor: pointer;
      color: var(--gray-500, #6b7280);
      transition: border-color 0.15s, background 0.15s;
    }
    .identity-add:hover:not(:disabled) {
      border-color: var(--blue-500, #3b82f6);
      background: rgba(59, 130, 246, 0.04);
    }
    .identity-add:disabled { cursor: wait; opacity: 0.75; }
    .identity-add-ico { font-size: 30px; color: var(--blue-500, #3b82f6); }
    .identity-add-text {
      font-size: 0.72rem;
      font-weight: 600;
      text-align: center;
      line-height: 1.35;
      padding: 0 6px;
      color: var(--gray-600, #4b5563);
    }
    .identity-add-spinner { margin: 4px auto; }
    .identity-hint { margin: 0; font-size: 0.72rem; color: var(--gray-500, #6b7280); }
  `]
})
export class UploadZoneComponent implements OnChanges {
  private static readonly MAX_IMAGE_BYTES = 20 * 1024 * 1024;
  private static readonly MAX_OTHER_BYTES = 50 * 1024 * 1024;

  private readonly api = inject(ApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly snack = inject(SnackService);
  private readonly translate = inject(TranslateService);

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  @Input() multiple = true;
  @Input() accept = 'image/*,video/*,.pdf,.doc,.docx';
  @Input() label = 'Click or drag files here to upload';
  @Input() urlList?: string[];
  @Input() readOnly = false;
  @Input() showHeroPreview = false;
  @Input() uploadHintKey = 'COMMON.UPLOAD_MAX_HINT';
  @Input() layout: 'cloud' | 'identity' = 'cloud';
  @Input() tileRound = false;

  @Output() filesChanged = new EventEmitter<UploadedFile[]>();
  @Output() filesUploaded = new EventEmitter<string[]>();
  @Output() urlListChange = new EventEmitter<string[]>();

  files: UploadedFile[] = [];
  uploadedUrls: string[] = [];
  workingUrls: string[] = [];
  uploading = false;
  isDragOver = false;

  get isControlled(): boolean { return this.urlList !== undefined; }
  get useIdentityLayout(): boolean { return this.layout === 'identity' && this.isControlled; }

  get heroImageUrl(): string | null {
    if (!this.showHeroPreview || !this.workingUrls.length) return null;
    const first = this.workingUrls[0];
    return this.urlKind(first) === 'IMAGE' ? first : null;
  }

  get legacyHeroImageUrl(): string | null {
    if (!this.showHeroPreview || !this.uploadedUrls.length) return null;
    const u = this.uploadedUrls[0];
    return this.urlKind(u) === 'IMAGE' ? u : null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['urlList'] || !this.isControlled) return;
    const next = this.urlList ?? [];
    if (!this.urlsEqual(this.workingUrls, next)) this.workingUrls = [...next];
  }

  trackByUrl(_index: number, url: string): string { return url; }
  trackByFile(_index: number, f: UploadedFile): string { return f.file.name + f.file.size; }

  onDragOver(e: DragEvent): void {
    if (this.readOnly) return;
    e.preventDefault();
    this.isDragOver = true;
  }

  onDrop(e: DragEvent): void {
    if (this.readOnly) return;
    e.preventDefault();
    this.isDragOver = false;
    if (e.dataTransfer?.files) void this.processFiles(Array.from(e.dataTransfer.files));
  }

  onFileChange(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files) void this.processFiles(Array.from(input.files));
    input.value = '';
  }

  triggerPick(): void {
    if (this.readOnly || this.uploading) return;
    this.fileInput?.nativeElement.click();
  }

  removeBound(ev: Event, index: number): void {
    ev.preventDefault(); ev.stopPropagation();
    if (this.readOnly) return;
    this.workingUrls = this.workingUrls.filter((_, i) => i !== index);
    this.urlListChange.emit([...this.workingUrls]);
  }

  removeLegacy(ev: Event, index: number): void {
    ev.preventDefault(); ev.stopPropagation();
    this.files.splice(index, 1);
    if (this.uploadedUrls[index] !== undefined) this.uploadedUrls.splice(index, 1);
    this.filesChanged.emit([...this.files]);
    this.filesUploaded.emit([...this.uploadedUrls]);
  }

  fileNameFromUrl(url: string): string {
    return url.split('?')[0].split('/').pop() || url;
  }

  urlKind(url: string): 'IMAGE' | 'VIDEO' | 'DOCUMENT' {
    const u = url.split('?')[0].toLowerCase();
    if (url.startsWith('data:image')) return 'IMAGE';
    if (/\.(jpe?g|jfif|pjpeg|png|gif|webp|avif|bmp|tiff?|heic|heif|svg)$/.test(u)) return 'IMAGE';
    if (/\.(mp4|webm|ogg|mov|m4v)$/.test(u)) return 'VIDEO';
    return 'DOCUMENT';
  }

  private async processFiles(rawFiles: File[]): Promise<void> {
    if (this.readOnly) return;
    const batch = this.filterBySize(this.multiple ? rawFiles : rawFiles.slice(0, 1));
    if (!batch.length) return;

    this.uploading = true;
    this.cdr.markForCheck();

    try {
      if (this.isControlled) {
        const settled = await Promise.allSettled(batch.map(f => firstValueFrom(this.api.uploadFile(f))));
        const newUrls: string[] = [];
        let failures = 0;
        settled.forEach(r => {
          if (r.status === 'fulfilled' && r.value.url) newUrls.push(r.value.url);
          else failures++;
        });
        if (newUrls.length) {
          if (!this.multiple) this.workingUrls = [];
          this.workingUrls = [...this.workingUrls, ...newUrls];
          this.urlListChange.emit([...this.workingUrls]);
        }
        if (failures > 0) this.snack.error(this.translate.instant('COMMON.UPLOAD_SOME_FAILED'));
      } else {
        batch.forEach(file => {
          const type = this.detectType(file);
          const uf: UploadedFile = { file, type };
          if (type === 'IMAGE') {
            const reader = new FileReader();
            reader.onload = e => { uf.preview = e.target?.result as string; };
            reader.readAsDataURL(file);
          }
          if (!this.multiple) this.files = [];
          this.files.push(uf);
        });
        const settled = await Promise.allSettled(batch.map(f => firstValueFrom(this.api.uploadFile(f))));
        let failures = 0;
        settled.forEach(r => {
          if (r.status === 'fulfilled' && r.value.url) {
            if (!this.multiple) this.uploadedUrls = [];
            this.uploadedUrls.push(r.value.url);
          } else failures++;
        });
        this.filesChanged.emit([...this.files]);
        this.filesUploaded.emit([...this.uploadedUrls]);
        if (failures > 0) this.snack.error(this.translate.instant('COMMON.UPLOAD_SOME_FAILED'));
      }
    } finally {
      this.uploading = false;
      this.cdr.markForCheck();
    }
  }

  private detectType(file: File): 'IMAGE' | 'VIDEO' | 'DOCUMENT' {
    if (file.type.startsWith('image/')) return 'IMAGE';
    if (file.type.startsWith('video/')) return 'VIDEO';
    const n = file.name.toLowerCase();
    if (/\.(jpe?g|jfif|pjpeg|png|gif|webp|avif|bmp|tiff?|heic|heif|svg)$/.test(n)) return 'IMAGE';
    if (/\.(mp4|webm|ogg|mov|m4v)$/.test(n)) return 'VIDEO';
    return 'DOCUMENT';
  }

  private filterBySize(files: File[]): File[] {
    let rejected = 0;
    const ok = files.filter(f => {
      const max = this.detectType(f) === 'IMAGE'
        ? UploadZoneComponent.MAX_IMAGE_BYTES
        : UploadZoneComponent.MAX_OTHER_BYTES;
      if (f.size > max) { rejected++; return false; }
      return true;
    });
    if (rejected > 0) this.snack.error(this.translate.instant('COMMON.UPLOAD_REJECTED_TOO_LARGE'));
    return ok;
  }

  private urlsEqual(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }
}
