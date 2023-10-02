
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable curly */
/* eslint-disable no-trailing-spaces */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/naming-convention */

import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { GeneralService } from 'app/services/general.service';
import { TokenService } from 'app/services/token.service';
import { AuthService } from 'app/services/auth.service';
import { FuseAlertType } from '@fuse/components/alert';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from 'app/services/http.service';
import { HelperService } from 'app/services/helper.service';
import { LocationStrategy } from '@angular/common';

@Component({
    selector: 'app-new-account',
    templateUrl: './new-account.component.html',
    styleUrls: ['./new-account.component.scss'],
    encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class NewAccountComponent implements AfterViewInit {
    @ViewChild('signInNgForm')  signInNgForm: NgForm;

    arrayImages: any = [ '1.jpg','2.jpg', '3.jpg',''];
    imageSelected: string = 'assets/images/login/1.jpg';
    index: number = 1;
    alert: { type: FuseAlertType; message: string } = {
    type: 'success',
    message: '',
    };
    formLogin: FormGroup;
    showAlert: boolean = false;

    hospitales = [];

    constructor(
        private _authService: AuthService,
        private _httpService: HttpService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _notify: GeneralService.Notify,
        private _loading: GeneralService.Loading,
        private _changeDetectorRef: ChangeDetectorRef,
        public _helperService: HelperService,
        private _tokenService: TokenService,
        private location: LocationStrategy
      ) {
        this.formLogin = this._formBuilder.group({
            Usuario: ['', [Validators.required]],
            Password: ['', [Validators.required,Validators.minLength(3),Validators.maxLength(10)]],
            IdHospital: [2]
          });
      }

  /**
   * On init
   */
  async ngAfterViewInit() {
    await  this.getHospitales();
  }

  async getHospitales() {
    this._httpService.getFromQuery('Catalogos', 'ListHospitales', {}).subscribe({
      next: (res: any) => {
        this.hospitales = res;
      },
      error: (err) => {
        this._notify.Error('Error al cargar lista de hospitales...');
      },
    });
  }

  /**
   * Sign in
   */
  SignIn(): void {
    // Return if the form is invalid
    if (this.formLogin.invalid)
      return;
      this._loading.Show('Iniciando Sesión');
      // Disable the form
      this.formLogin.disable();

      // Hide the alert
      this.showAlert = false;

      // Sign in
      this._authService.signIn(
        Object.assign(this.formLogin.value,
            this.hospitales.find( x=>x.Id=this.formLogin.controls.IdHospital.value))
      ).subscribe({
        next: (data: any) => {
          this._authService.setLocalstorage(data);
          this._tokenService.initCheckStatusToken();
          this._loading.Stop();
          this._router.navigateByUrl('/Home');
        },
        error: (err) => {
          // Re-enable the form
          this.formLogin.enable();

          // Reset the Login form
          this.formLogin.controls.Usuario.patchValue('');
          this.formLogin.controls.Password.patchValue('');
          this.formLogin.controls.Usuario.reset();
          this.formLogin.controls.Password.reset();

          // Set the alert
          this.alert = {
            type: 'error',
            message: err.error.Error,
          };

          // Show the alert
          this.showAlert = true;
          this._loading.Stop();
        },
      });
    }

/**
 * Funciones para manejo de imagenes en el Inicio de sesion
 */
 nextImageSelected(): void {
    const image = this.doesFileExist('assets/images/login/' + (this.index + 1) + '.jpg');
    if (image) {
      this.index++;
      this.imageSelected = image;
    } else {
      this.index = 0;
      this.imageSelected = '';
    }
    this._changeDetectorRef.markForCheck();
  }
  doesFileExist(image: any): any {
    try {
      let _image = null;

      if (image) {
        const req = new XMLHttpRequest();
        req.open('GET', image, false);
        req.send();
        if (req.status === 200) {
            _image = image;
        }
      }
      return _image;
    } catch (e) {
      return null;
    }
  }
}
