/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable curly */
import { LocationStrategy } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { GeneralService } from 'app/services/general.service';
import { HelperService } from 'app/services/helper.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  @ViewChild('forgotPasswordNgForm') forgotPasswordNgForm: NgForm;
  forgotPasswordForm: FormGroup;
  listHospitales: any[];
  constructor(
    private _formBuilder: FormBuilder,
    private _activatedRoute: ActivatedRoute,
    private _authService: AuthService,
    private _router: Router,
    public _helperService: HelperService,
    private _notify: GeneralService.Notify,
    private locationStrategy: LocationStrategy
  ) {
    this.forgotPasswordForm = this._formBuilder.group({
      IdHospital: new FormControl(null, {
        validators: Validators.required,
      }),
      Email: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.getHospitales();
  }

  getHospitales(): void {
    const { hospitales } = this._activatedRoute.snapshot.data;
    if (hospitales) this.listHospitales = hospitales;
  }

  recoveryPassword(): void {
    // Return if the form is invalid
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    // Disable the form
    this.forgotPasswordForm.disable();
    const valuesControls = this.forgotPasswordForm.value;
    this._authService
      .recoveryPassword(Object.assign(valuesControls, { PathName: this.locationStrategy.getBaseHref() }))
      .subscribe({
        next: (res) => {
          this._notify.Success(res.mensaje);
          this.forgotPasswordForm.enable();
          setTimeout(() => {
            this._router.navigateByUrl('sign-in');
          }, 2000);
        },
        error: (err) => {
          this._notify.Error(err.error);
          this.forgotPasswordForm.enable();
        },
      });
  }

  irALogin() {
    this._router.navigateByUrl('sign-in');
  }
}
