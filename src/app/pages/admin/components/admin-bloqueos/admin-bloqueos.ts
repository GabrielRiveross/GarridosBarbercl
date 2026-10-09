import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  BloqueoAdmin,
  CrearBloqueoRequest
} from '../../models/admin.models';

import {
  AdminBloqueosService
} from '../../services/admin-bloqueos.service';


@Component({
  selector: 'app-admin-bloqueos',

  imports: [
    FormsModule
  ],

  templateUrl:
    './admin-bloqueos.html',

  styleUrl:
    './admin-bloqueos.scss'
})
export class AdminBloqueos
  implements OnInit {


  @Output()
  sesionExpirada =
    new EventEmitter<void>();


  bloqueos:
    BloqueoAdmin[] = [];


  fechaBloqueo = '';

  horaBloqueo = '';

  motivoBloqueo = '';


  cargando = false;

  creando = false;


  eliminandoId:
    number | null = null;


  mensaje = '';

  error = '';


  readonly horariosSemana = [
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00'
  ];


  readonly horariosDomingo = [
    '20:00',
    '21:00',
    '22:00'
  ];


  constructor(
    private bloqueosService:
    AdminBloqueosService,

    private cdr:
    ChangeDetectorRef
  ) {}


  ngOnInit(): void {

    this.cargarBloqueos();

  }


  cargarBloqueos(): void {


    this.cargando = true;


    this.bloqueosService

      .obtenerBloqueos()

      .subscribe({


        next: response => {


          this.bloqueos =
            response.bloqueos ?? [];


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
            'No fue posible cargar los bloqueos.';


          this.cdr
            .detectChanges();

        }

      });

  }


  crearBloqueo(): void {


    if (
      !this.fechaBloqueo ||
      !this.horaBloqueo
    ) {

      this.error =
        'Debes seleccionar fecha y hora.';

      return;

    }


    const bloqueo:
      CrearBloqueoRequest = {

      fecha:
      this.fechaBloqueo,

      hora:
      this.horaBloqueo,

      motivo:
        this.motivoBloqueo.trim()

    };


    this.creando = true;

    this.error = '';

    this.mensaje = '';


    this.bloqueosService

      .crearBloqueo(
        bloqueo
      )

      .subscribe({


        next: response => {


          this.creando =
            false;


          this.horaBloqueo = '';

          this.motivoBloqueo = '';


          this.mensaje =
            response.mensaje;


          this.cargarBloqueos();


          this.cdr
            .detectChanges();

        },


        error: error => {


          this.creando =
            false;


          if (
            error.status === 401
          ) {

            this.sesionExpirada
              .emit();

            return;

          }


          this.error =
            error.error?.mensaje ??
            'No fue posible bloquear el horario.';


          this.cdr
            .detectChanges();

        }

      });

  }


  eliminarBloqueo(
    bloqueo: BloqueoAdmin
  ): void {


    const confirmar =
      window.confirm(
        `¿Deseas liberar ${bloqueo.fecha} a las ${bloqueo.hora}?`
      );


    if (!confirmar) {

      return;

    }


    this.eliminandoId =
      bloqueo.id;


    this.bloqueosService

      .eliminarBloqueo(
        bloqueo.id
      )

      .subscribe({


        next: response => {


          this.eliminandoId =
            null;


          this.bloqueos =
            this.bloqueos.filter(
              item =>
                item.id !==
                bloqueo.id
            );


          this.mensaje =
            response.mensaje;


          this.cdr
            .detectChanges();

        },


        error: error => {


          this.eliminandoId =
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
            'No fue posible liberar el horario.';


          this.cdr
            .detectChanges();

        }

      });

  }


  cambiarFechaBloqueo(): void {

    this.horaBloqueo = '';

  }


  get horariosParaBloqueo():
    string[] {


    if (!this.fechaBloqueo) {

      return [];

    }


    const [
      anio,
      mes,
      dia
    ] =
      this.fechaBloqueo
        .split('-')
        .map(Number);


    const fecha =
      new Date(
        anio,
        mes - 1,
        dia
      );


    return fecha.getDay() === 0
      ? this.horariosDomingo
      : this.horariosSemana;

  }


  get fechaMinima(): string {

    return this.formatearFechaInput(
      new Date()
    );

  }


  get fechaMaxima(): string {


    const fecha =
      new Date();


    fecha.setDate(
      fecha.getDate() + 7
    );


    return this.formatearFechaInput(
      fecha
    );

  }


  private formatearFechaInput(
    fecha: Date
  ): string {


    const anio =
      fecha.getFullYear();


    const mes =
      String(
        fecha.getMonth() + 1
      ).padStart(
        2,
        '0'
      );


    const dia =
      String(
        fecha.getDate()
      ).padStart(
        2,
        '0'
      );


    return `${anio}-${mes}-${dia}`;

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
        'es-CL'
      );

  }

}
