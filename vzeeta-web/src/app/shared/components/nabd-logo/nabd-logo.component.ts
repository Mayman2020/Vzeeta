import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-nabd-logo',
  standalone: true,
  imports: [NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 64 64" fill="none"
         xmlns="http://www.w3.org/2000/svg" [style.display]="'block'">
      <defs>
        <linearGradient [id]="gradId" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop stop-color="#1251a3"/>
          <stop offset="1" stop-color="#061e40"/>
        </linearGradient>
        <filter [id]="filtId" x="5" y="17" width="55" height="34"
                filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feDropShadow dx="0" dy="0" stdDeviation="2.5" flood-color="#18C2C0" flood-opacity="0.95"/>
        </filter>
      </defs>

      <!-- Background rounded rect -->
      <rect *ngIf="bg" width="64" height="64" rx="16" [attr.fill]="'url(#'+gradId+')'"/>

      <!-- Heart shape -->
      <path class="nb-heart"
        d="M17 24.5c0-5 4-9 9-9 3.1 0 5.9 1.6 7.5 4 1.6-2.4 4.4-4 7.5-4 5 0 9 4 9 9 0 11.4-16.5 22.7-16.5 22.7S17 35.9 17 24.5Z"
        fill="#ffffff"/>

      <!-- ECG base (faint) -->
      <path class="nb-ecg-base"
        d="M14 34h9l3.5-7 5 13 4-9h14"
        stroke="#18C2C0" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- ECG animated line -->
      <path class="nb-ecg-live"
        d="M14 34h9l3.5-7 5 13 4-9h14"
        stroke="#18C2C0" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"
        [attr.filter]="'url(#'+filtId+')'"/>

      <!-- Spark dot -->
      <circle class="nb-spark" cx="49" cy="19" r="4.5" fill="#18C2C0"/>
    </svg>
  `,
  styles: [`
    :host { display: inline-block; line-height: 0; }

    .nb-heart {
      transform-box: fill-box;
      transform-origin: center;
      animation: nb-heartbeat 2.2s ease-in-out infinite;
    }
    .nb-ecg-base { opacity: 0.3; }
    .nb-ecg-live {
      stroke-dasharray: 14 72;
      stroke-dashoffset: 84;
      animation: nb-ecg 2.2s cubic-bezier(.4,0,.2,1) infinite;
    }
    .nb-spark {
      transform-box: fill-box;
      transform-origin: center;
      animation: nb-spark 2.2s ease-in-out infinite;
    }

    @keyframes nb-ecg {
      0%   { stroke-dashoffset: 84; opacity: .12; }
      10%  { opacity: 1; }
      45%  { stroke-dashoffset: 0; opacity: 1; }
      68%  { stroke-dashoffset: -20; opacity: .1; }
      100% { stroke-dashoffset: -20; opacity: .12; }
    }
    @keyframes nb-heartbeat {
      0%,18%,44%,100% { transform: scale(1); }
      24% { transform: scale(1.055); }
      31% { transform: scale(.978); }
      37% { transform: scale(1.028); }
    }
    @keyframes nb-spark {
      0%,18%,44%,100% { transform: scale(1); opacity: .82; }
      24% { transform: scale(1.22); opacity: 1; }
      31% { transform: scale(.92); }
      37% { transform: scale(1.12); }
    }
  `]
})
export class NabdLogoComponent {
  @Input() size: number | string = 64;
  @Input() bg = true;

  get gradId(): string { return 'nb-grad-' + this.size; }
  get filtId(): string { return 'nb-filt-' + this.size; }
}
