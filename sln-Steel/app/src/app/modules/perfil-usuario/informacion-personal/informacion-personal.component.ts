import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { GeneralService } from 'app/services/general.service';
import { SystemService } from 'app/services/system.service';
import { PerfilUsuarioService } from '../perfil-usuario.service';
@Component({
  selector: 'app-informacion-personal',
  templateUrl: './informacion-personal.component.html',
  styleUrls: ['./informacion-personal.component.scss'],
})
export class InformacionPersonalComponent implements OnInit {
  @ViewChild('profileInNgForm') profileInNgForm: NgForm;
  profileForm: FormGroup;

  showAlert: boolean = false;
  Themes: any;

  constructor(
    private _formBuilder: FormBuilder,
    private _perfilUsuarioService: PerfilUsuarioService,
    private _loading: GeneralService.Loading,
    private _activedRoute: ActivatedRoute,
    private _notify: SystemService.Notify
  ) {
    this.profileForm = this._formBuilder.group({
      NombreCompleto: new FormControl('', { validators: Validators.required }),
      Email: new FormControl('', { validators: Validators.required }),
      Image: new FormControl(null),
      Modo: new FormControl('theme-steeel'),
      Theme: new FormControl(1),
    });
    this.Themes = [
      { IdTheme: 1, Theme: 'theme-steeel' },
      { IdTheme: 2, Theme: 'theme-niclab' },
    ];
    this.profileForm.disable();

    this._perfilUsuarioService.listener().subscribe((data: any) => {
      if (data?.Type === 'UpdateProfile') this.getProfileUser();
    });
  }

  ngOnInit(): void {
    this.getProfileUser();
  }

  getProfileUser() {
    try {
      this._loading.Show('Consultando perfil..');
      const { IdUsuario } = this._activedRoute.snapshot.data.user;
      this._perfilUsuarioService.getProfile({ IdUsuario: IdUsuario }).subscribe({
        next: (respProfile: any) => {
          this.profileForm.patchValue(respProfile);
          this._loading.Stop();
        },
        error: (err) => {
          // Set the alert
          this.showAlert = true;
          this._loading.Stop();
        },
      });
    } catch (error) {
      this._loading.Stop();
    }
  }

  UpdateProfile(value) {
    this._loading.Show('Actualizando perfil');
    const dataUpdate = {
      IdUsuario: this._activedRoute.snapshot.data.user.IdUsuario,
      Modo: this.profileForm.get('Modo').value,
      Theme: this.profileForm.get('Theme').value,
      Image: this.profileForm.get('Image').value,
    };
    this._perfilUsuarioService.updateProfile(dataUpdate).subscribe({
      next: (respProfile: any) => {
        // Fill Form
        this._notify.notifySuccess('Perfil actualizado');
        this._perfilUsuarioService.emmiter(this.profileForm.get('Image').value, 'UpdateAvatar');
        this.getProfileUser();
        this._loading.Stop();
      },
      error: (err) => {
        // Set the alert
        this.showAlert = true;
        this._loading.Stop();
      },
    });
  }
}
