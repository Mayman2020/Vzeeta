import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { TablePagerComponent } from '../../../shared/components/table-pager/table-pager.component';
import { DateFieldComponent } from '../../../shared/components/date-field/date-field.component';
import { ListLoadController } from '../../../shared/utils/list-load.util';
import { DEFAULT_TABLE_PAGE_SIZE, withPageParams } from '../../../core/utils/pagination.util';
import { PatientService } from '../../../core/services/patient.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../core/models/appointment.model';
import { Doctor } from '../../../core/models/doctor.model';
import { LabResult, MedicalRecord, NotificationItem, Prescription } from '../../../core/services/patient.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { RmsDatePipe } from '../../../shared/pipes/rms-date.pipe';
import { formatApiDate } from '../../../core/utils/date-value.utils';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-patient-video-consultation',
  standalone: true,
  imports: [NgIf, TranslateModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './patient-video-consultation.component.html',
  styleUrls: ['./patient-video-consultation.component.scss']
})
export class PatientVideoConsultationComponent implements OnInit, OnDestroy {
  jitsiReady = false;
  doctorName = '';
  doctorInitial = 'D';
  roomName = '';
  private jitsiApi: unknown = null;

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    const appointmentId = this.route.snapshot.paramMap.get('appointmentId') ?? 'guest';
    this.roomName = `vzeeta-appt-${appointmentId}`;
    this.loadJitsi();
  }

  private loadJitsi(): void {
    const scriptId = 'jitsi-external-api';
    if (document.getElementById(scriptId)) {
      this.initJitsi();
      return;
    }
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://meet.jit.si/external_api.js';
    script.onload = () => this.initJitsi();
    document.head.appendChild(script);
  }

  private initJitsi(): void {
    const JitsiMeetExternalAPI = (window as unknown as Record<string, unknown>)['JitsiMeetExternalAPI'] as new (domain: string, options: Record<string, unknown>) => Record<string, unknown>;
    if (!JitsiMeetExternalAPI) return;

    const container = document.getElementById('jitsi-container');
    if (!container) return;

    this.jitsiApi = new JitsiMeetExternalAPI('meet.jit.si', {
      roomName: this.roomName,
      parentNode: container,
      width: '100%',
      height: '100%',
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        disableDeepLinking: true,
        prejoinPageEnabled: false
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        TOOLBAR_BUTTONS: ['microphone', 'camera', 'desktop', 'chat', 'raisehand', 'videoquality', 'fullscreen', 'hangup']
      }
    }) as Record<string, unknown>;

    const api = this.jitsiApi as Record<string, (event: string, handler: () => void) => void>;
    api['addEventListener']('videoConferenceJoined', () => { this.jitsiReady = true; });
    api['addEventListener']('readyToClose', () => { this.endCall(); });
  }

  endCall(): void {
    if (this.jitsiApi) {
      const api = this.jitsiApi as Record<string, () => void>;
      try { api['dispose'](); } catch { /* ignore */ }
    }
    window.history.back();
  }

  ngOnDestroy(): void {
    this.endCall();
  }
}
