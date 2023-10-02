import { ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FuseAlertType } from '@fuse/components/alert';
import { FuseConfirmationConfig } from '@fuse/services/confirmation/confirmation.types';
import { AuthService } from 'app/services/auth.service';
import { GeneralService } from 'app/services/general.service';

@Component({
  selector: 'fuse-confirmation-dialog',
  templateUrl: './dialog.component.html',
  styles: [
    /* language=SCSS */
    `
      .fuse-confirmation-dialog-panel {
        @screen md {
          @apply w-128;
        }

        .mat-dialog-container {
          padding: 0 !important;
        }
      }
    `,
  ],
})
export class FuseConfirmationDialogComponent implements OnInit {
  hide = true;
  password: string;
  InputfileName: boolean = false;
  FileName: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: FuseConfirmationConfig,
    public matDialogRef: MatDialogRef<FuseConfirmationDialogComponent>,
    private _authService: AuthService,
    private _notify: GeneralService.Notify,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  async close(action: string = 'confirmed') {
    if (this.data.autorization) {
      let params = {
        Password: this.password,
      };

      //Se valida el usuario y contraseña
      this._authService.ConfirmedDelete(params).subscribe({
        next: async (data_: any) => {
          this.matDialogRef.close(action);
        },
        error: (err) => {
          this._notify.Error(err.error.Error);
        },
      });
    } else if (this.data.InputfileName && this.FileName) this.matDialogRef.close(this.FileName);
    else this.matDialogRef.close(action);
  }
}
