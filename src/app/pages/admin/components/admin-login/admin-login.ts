import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  AdminAuthService
} from '../../services/admin-auth.service';


@Component({
  selector: 'app-admin-login',

  imports: [
    FormsModule
  ],

  templateUrl:
    './admin-login.html',

  styleUrl:
    './admin-login.scss'
})
export class AdminLogin {


  @Output()
  loginCorrecto =
    new EventEmitter<string>();


  password = '';

  cargando = false;

  error = '';


  constructor(
    private authService:
    AdminAuthService,

    private cdr:
    ChangeDetectorRef
  ) {}


  iniciarSesion(): void {


    if (
      !this.password.trim()
    ) {

      this.error =
        'Debes ingresar la contraseña.';

      return;

    }


    this.cargando = true;

    this.error = '';


    this.authService

      .iniciarSesion(
        this.password
      )

      .subscribe({


        next: response => {


          this.cargando =
            false;


          this.password = '';


          this.loginCorrecto.emit(
            response.mensaje
          );


          this.cdr
            .detectChanges();

        },


        error: error => {


          this.cargando =
            false;


          this.error =
            error.error?.mensaje ??
            'No fue posible iniciar sesión.';


          this.cdr
            .detectChanges();

        }

      });

  }

}
