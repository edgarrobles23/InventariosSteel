/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable curly */
/* eslint-disable no-trailing-spaces */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/naming-convention */

import { AfterViewInit, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { GeneralService } from 'app/services/general.service';
import { TokenService } from 'app/services/token.service';
import { AuthService } from 'app/services/auth.service';
import { FuseAlertType } from '@fuse/components/alert';
import { fuseAnimations } from '@fuse/animations';
import { Router } from '@angular/router';
import { HelperService } from 'app/services/helper.service';
import { DataUserModel } from 'app/store/models/DataUser.model';
import { ActionsModel } from 'app/store/models/Actions.model';
import JWTDecode from 'jwt-decode';
import { HttpService } from 'app/services/http.service';

@Component({
  selector: 'auth-login',
  templateUrl: './login.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./login.scss'],
  animations: fuseAnimations,
})
export class AuthLoginInComponent implements AfterViewInit {
  @ViewChild('signInNgForm') signInNgForm: NgForm;

  imageSelected: string = 'assets/images/login/principal.png';
  alert: { type: FuseAlertType; message: string } = {
    type: 'success',
    message: '',
  };
  formLogin: FormGroup;
  showAlert: boolean = false;

  empresas = [];

  constructor(
    private _authService: AuthService,
    private _formBuilder: FormBuilder,
    private _httpService: HttpService,
    private _router: Router,
    private _notify: GeneralService.Notify,
    private _loading: GeneralService.Loading,
    public _helperService: HelperService,
    private _tokenService: TokenService
  ) {
    this.formLogin = this._formBuilder.group({
      Usuario: ['', [Validators.required]],
      Password: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
      IdHospital: ['', [Validators.required]],
    });
  }

  async ngAfterViewInit() {
    await this.getEmpresas();
  }
  async getEmpresas() {
    this._httpService.getFromQuery('Catalogo', 'ListEmpresas', {}).subscribe({
      next: (res: any) => {
        this.empresas = res;
      },
      error: (err) => {
        this._notify.Error('Error al cargar lista de empresas...');
      },
    });
  }

  SignIn(): void {
    // Return if the form is invalid
    if (this.formLogin.invalid) return;
    this._loading.Show('Iniciando Sesión');
    // Disable the form
    this.formLogin.disable();

    // Hide the alert
    this.showAlert = false;

    // Sign in
    this._authService.signIn(this.formLogin.value).subscribe({
      next: async (data: any) => {
        this._authService.setLocalstorage(data);
        this._tokenService.initCheckStatusToken();
        this._loading.Stop();
        let Token: DataUserModel = JWTDecode(data.Token);
        let Acciones: Array<ActionsModel> = data.Opciones;

        this._tokenService.SETStore_User(Token);
        this._tokenService.SETStore_UserActions(Acciones);
        //redireccionamiento a la primer opcion del menu que tiene asignada
        let firstRoute = await this._authService.FirstRoute();
        localStorage['firstRoute'] = firstRoute;
        if (firstRoute) this._router.navigateByUrl(firstRoute);
        else this._authService.cleanLocalStorage();
      },
      error: (err) => {
        // Re-enable the form
        this.formLogin.enable();

        // Reset the Login form
        try {
          if (err.error.Error.indexOf('Contraseña incorrecta') == -1) {
            this.formLogin.controls.Usuario.patchValue('');
            this.formLogin.controls.Usuario.reset();
          }
        } catch (error) {
          this.formLogin.controls.Usuario.patchValue('');
          this.formLogin.controls.Usuario.reset();
        }

        this.formLogin.controls.Password.patchValue('');

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
}
