/* eslint-disable quote-props */
/* eslint-disable no-debugger */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable curly */
import { Component, OnInit, ViewChild, ViewEncapsulation, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { GeneralService } from 'app/services/general.service';
import { HelperService } from 'app/services/helper.service';
import { finalize, takeUntil, tap, takeWhile, timer, Subject } from 'rxjs';
import { APP_BASE_HREF } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ResetPasswordComponent implements OnInit {
  @ViewChild('resetPasswordNgForm') resetPasswordNgForm: NgForm;
  resetPasswordForm: FormGroup;
  listHospitales: any[];
  Token: string = null;
  countdown: number = 3;
  countdownMapping: any = {
    '=1': '# second',
    other: '# seconds',
  };
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _formBuilder: FormBuilder,
    private _activatedRoute: ActivatedRoute,
    private _authService: AuthService,
    private _router: Router,
    public _helperService: HelperService,
    private _notify: GeneralService.Notify
  ) {
    this.resetPasswordForm = this._formBuilder.group(
      {
        Password: new FormControl(null, {
          validators: Validators.required,
        }),
        ConfirmPassword: ['', [Validators.required]],
      },
      { validator: this.passwordMatchValidator }
    );

    this._activatedRoute.params.subscribe((params) => {
      this.Token = params.Token;
      this.validateToken();
    });
  }

  passwordMatchValidator(frm: FormGroup) {
    return frm.controls['Password'].value === frm.controls['ConfirmPassword'].value ? null : { mismatch: true };
  }

  ngOnInit(): void {}

  validateToken() {
    // this._authService.validateToken(this.Token)
    // .subscribe({
    //     next:(data)=>{
    //         debugger;
    //     },
    //     error:(error)=>{
    //     }
    // })
  }
  resetPassword(): void {
    // Return if the form is invalid
    if (this.resetPasswordForm.invalid) {
      return;
    }

    // Disable the form
    this.resetPasswordForm.disable();
    const valuesControls = this.resetPasswordForm.value;
    this._authService.resetPassword(Object.assign(valuesControls, { Token: this.Token })).subscribe({
      next: (res) => {
        this._notify.Success(res.mensaje);
        //redireccionando alogin
        timer(1000, 1000)
          .pipe(
            finalize(() => {
              this._router.navigate(['sign-in']);
            }),
            takeWhile(() => this.countdown > 0),
            takeUntil(this._unsubscribeAll),
            tap(() => this.countdown--)
          )
          .subscribe();
      },
      error: (err) => {
        this._notify.Error(err.error);
        this.resetPasswordForm.enable();
      },
    });
  }

  irALogin() {
    this._router.navigateByUrl('sign-in');
  }
}
