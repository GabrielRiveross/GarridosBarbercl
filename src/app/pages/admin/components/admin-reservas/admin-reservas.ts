import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output
} from '@angular/core';

import {
  ReservaAdmin
} from '../../models/admin.models';

import {
  AdminReservasService
} from '../../services/admin-reservas.service';


@Component({
  selector: 'app-admin-reservas',

  imports: [],

  templateUrl:
    './admin-reservas.html',

  styleUrl:
    './admin-reservas.scss'
})
export class AdminReservas
  implements OnInit {


  @Output()
  sesionExpirada =
    new EventEmitter<void>();


  reservas:
    ReservaAdmin[] = [];


  cargando = false;


  cancelandoId:
    number | null = null;


  mensaje = '';

  error = '';


  constructor(
    private reservasService:
    AdminReservasService,

    private cdr:
    ChangeDetectorRef
  ) {}


  ngOnInit(): void {

    this.cargarReservas();

  }


  cargarReservas(): void {


    this.cargando = true;

    this.error = '';


    this.reservasService

      .obtenerReservas()

      .subscribe({


        next: response => {


          this.reservas =
            response.reservas ?? [];


          this.cargando =
            false;


          this.cdr
            .detectChanges();

        },


        error: error => {


          this.cargando =
            false;


          if (
            error.status === 401
          ) {

            this.sesionExpirada
              .emit();

            return;

          }


          this.error =
            'No fue posible cargar las reservas.';


          this.cdr
            .detectChanges();

        }

      });

  }


  cancelarReserva(
    reserva: ReservaAdmin
  ): void {


    if (
      reserva.estado ===
      'cancelada'
    ) {

      return;

    }


    const confirmar =
      window.confirm(
        `¿Deseas cancelar la reserva de ${reserva.nombre} ${reserva.apellido} para el ${this.formatearFecha(reserva.fecha)} a las ${reserva.hora}?`
      );


    if (!confirmar) {

      return;

    }


    this.cancelandoId =
      reserva.id;


    this.mensaje = '';

    this.error = '';


    this.reservasService

      .cancelarReserva(
        reserva.id
      )

      .subscribe({


        next: response => {


          this.cancelandoId =
            null;


          reserva.estado =
            'cancelada';


          this.mensaje =
            response.mensaje;


          this.cdr
            .detectChanges();

        },


        error: error => {


          this.cancelandoId =
            null;


          if (
            error.status === 401
          ) {

            this.sesionExpirada
              .emit();

            return;

          }


          this.error =
            error.error?.mensaje ??
            'No fue posible cancelar la reserva.';


          this.cdr
            .detectChanges();

        }

      });

  }


  formatearFecha(
    fecha: string
  ): string {


    const [
      anio,
      mes,
      dia
    ] =
      fecha
        .split('-')
        .map(Number);


    return new Date(
      anio,
      mes - 1,
      dia
    )
      .toLocaleDateString(
        'es-CL',
        {

          weekday: 'short',

          day: '2-digit',

          month: '2-digit',

          year: 'numeric'

        }
      );

  }

}
