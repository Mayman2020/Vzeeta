import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

export type StatCounterTone = 'navy' | 'teal' | 'gold' | 'danger';

@Component({
  selector: 'app-stat-counter',
  standalone: true,
  template: `
    <span
      class="estate-stat-value stat-counter"
      [class.stat-counter--active]="animating"
      [attr.data-tone]="tone"
      [attr.aria-label]="value.toString()">
      {{ display }}
    </span>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .stat-counter {
      display: block;
      text-align: center;
      font-variant-numeric: tabular-nums lining-nums;
      font-feature-settings: 'tnum' 1, 'lnum' 1;
      transform: scale(0.92);
      opacity: 0.4;
      transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease;
    }

    .stat-counter--active {
      transform: scale(1);
      opacity: 1;
    }
  `]
})
export class StatCounterComponent implements OnInit, OnChanges {
  @Input() value = 0;
  @Input() tone: StatCounterTone = 'navy';
  @Input() durationMs = 1100;

  display = 0;
  animating = false;

  private frameId = 0;

  ngOnInit(): void {
    this.animateTo(this.value);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && !changes['value'].firstChange) {
      this.animateTo(this.value);
    }
  }

  private animateTo(target: number): void {
    cancelAnimationFrame(this.frameId);
    const safeTarget = Math.max(0, Math.round(target));
    const start = performance.now();
    const from = 0;
    this.animating = true;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / this.durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.display = Math.round(from + (safeTarget - from) * eased);
      if (progress < 1) {
        this.frameId = requestAnimationFrame(tick);
      } else {
        this.display = safeTarget;
        this.animating = false;
      }
    };

    this.frameId = requestAnimationFrame(tick);
  }
}
