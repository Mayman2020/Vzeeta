import { MatDialogModule } from '@angular/material/dialog';
import { DialogTitleCloseDirective } from './directives/dialog-title-close.directive';

/** Import alongside dialog templates so every mat-dialog-title gets the unified header close button. */
export const APP_DIALOG_IMPORTS = [MatDialogModule, DialogTitleCloseDirective] as const;
