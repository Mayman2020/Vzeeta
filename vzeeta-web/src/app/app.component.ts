import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { ThemeService } from './core/services/theme.service';
import { BackgroundMusicService } from './core/services/background-music.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingSpinnerComponent],
  template: `
    <app-loading-spinner></app-loading-spinner>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  constructor(
    private readonly _theme: ThemeService,
    private readonly _music: BackgroundMusicService
  ) {}
}
