import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  AdminAuthService
} from './services/admin-auth.service';

import {
  AdminLogin
} from './components/admin-login/admin-login';

import {
  AdminReservas
} from './components/admin-reservas/admin-reservas';

import {
  AdminBloqueos
} from './components/admin-bloqueos/admin-bloqueos';


@Component({

  selector: 'app-admin',

  imports: [
    AdminLogin,
    AdminReservas,
    AdminBloqueos
  ],

  templateUrl:
    './admin.html',

  styleUrl:
    './admin.scss'

})
export class Admin
  implements OnInit {


  comprobandoSesion = true;

  autenticado = false;

  mensaje = '';

  error = '';

  cerrandoSesion = false;


  constructor(
    private authService:
    AdminAuthService,

    private cdr:
    ChangeDetectorRef
  ) {}


  ngOnInit(): void {

    this.comprobarSesion();

  }


  comprobarSesion(): void {


    this.comprobandoSesion =
      true;


    this.authService

      .comprobarSesion()

      .subscribe({


        next: response => {


          this.autenticado =
            response.autenticado;


          this.comprobandoSesion =
            false;


          this.cdr
            .detectChanges();

        },


        error: () => {


          this.autenticado =
            false;


          this.comprobandoSesion =
            false;


          this.error =
            'No fue posible comprobar la sesión.';


          this.cdr
            .detectChanges();

        }

      });

  }


  loginCorrecto(
    mensaje: string
  ): void {


    this.autenticado = true;

    this.mensaje = mensaje;

    this.error = '';


    this.cdr
      .detectChanges();

  }


  sesionExpirada(): void {


    this.autenticado = false;

    this.mensaje = '';

    this.error =
      'La sesión ha expirado.';


    this.cdr
      .detectChanges();

  }


  cerrarSesion(): void {


    this.cerrandoSesion = true;


    this.authService

      .cerrarSesion()

      .subscribe({


        next: response => {


          this.cerrandoSesion =
            false;


          this.autenticado =
            false;


          this.mensaje =
            response.mensaje;


          this.cdr
            .detectChanges();

        },


        error: () => {


          this.cerrandoSesion =
            false;


          this.error =
            'No fue posible cerrar la sesión.';


          this.cdr
            .detectChanges();

        }

      });

  }

}
