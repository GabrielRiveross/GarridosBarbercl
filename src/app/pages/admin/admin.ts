import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  HttpClient
} from '@angular/common/http';


interface ReservaAdmin {

  id: number;

  nombre: string;

  apellido: string;

  telefono: string;

  fecha: string;

  hora: string;

  estado: string;

  created_at: string;

}


interface ReservasAdminResponse {

  ok: boolean;

  reservas: ReservaAdmin[];

}


interface BloqueoAdmin {

  id: number;

  fecha: string;

  hora: string;

  motivo: string | null;

  created_at: string;

}


interface BloqueosAdminResponse {

  ok: boolean;

  bloqueos: BloqueoAdmin[];

}


interface RespuestaGeneral {

  ok: boolean;

  mensaje: string;

}


@Component({

  selector: 'app-admin',

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './admin.html',

  styleUrl: './admin.scss'

})
export class Admin
  implements OnInit {


  /*
   * ========================================
   * RESERVAS
   * ========================================
   */

  reservas:
    ReservaAdmin[] = [];


  cargando = false;


  cancelandoId:
    number | null = null;


  /*
   * ========================================
   * BLOQUEOS
   * ========================================
   */

  bloqueos:
    BloqueoAdmin[] = [];


  cargandoBloqueos = false;


  creandoBloqueo = false;


  eliminandoBloqueoId:
    number | null = null;


  /*
   * ========================================
   * FORMULARIO DE BLOQUEO
   * ========================================
   */

  fechaBloqueo = '';

  horaBloqueo = '';

  motivoBloqueo = '';


  /*
   * ========================================
   * MENSAJES
   * ========================================
   */

  mensaje = '';

  error = '';


  /*
   * ========================================
   * HORARIOS
   * ========================================
   */

  horariosSemana: string[] = [

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


  horariosDomingo: string[] = [

    '20:00',
    '21:00',
    '22:00'

  ];


  /*
   * ========================================
   * CONSTRUCTOR
   * ========================================
   */

  constructor(

    private http:
    HttpClient,

    private cdr:
    ChangeDetectorRef

  ) {}


  /*
   * ========================================
   * INICIO
   * ========================================
   */

  ngOnInit(): void {

    this.cargarReservas();

    this.cargarBloqueos();

  }


  /*
   * ========================================
   * CARGAR RESERVAS
   * ========================================
   */

  cargarReservas(): void {


    this.cargando = true;

    this.error = '';


    this.http

      .get<ReservasAdminResponse>(
        '/api/admin/reservas'
      )

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


          console.error(
            'Error al cargar reservas:',
            error
          );


          this.cargando =
            false;


          this.reservas = [];


          this.error =
            'No fue posible cargar las reservas.';


          this.cdr
            .detectChanges();

        }

      });

  }


  /*
   * ========================================
   * CANCELAR RESERVA
   * ========================================
   */

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


    this.http

      .delete<RespuestaGeneral>(
        `/api/admin/reservas/${reserva.id}`
      )

      .subscribe({


        next: response => {


          this.cancelandoId =
            null;


          this.mensaje =
            response.mensaje;


          reserva.estado =
            'cancelada';


          this.cdr
            .detectChanges();

        },


        error: error => {


          this.cancelandoId =
            null;


          this.error =
            error.error?.mensaje ??
            'No fue posible cancelar la reserva.';


          this.cdr
            .detectChanges();

        }

      });

  }


  /*
   * ========================================
   * CARGAR BLOQUEOS
   * ========================================
   */

  cargarBloqueos(): void {


    this.cargandoBloqueos =
      true;


    this.http

      .get<BloqueosAdminResponse>(
        '/api/admin/bloqueos'
      )

      .subscribe({


        next: response => {


          this.bloqueos =
            response.bloqueos ?? [];


          this.cargandoBloqueos =
            false;


          this.cdr
            .detectChanges();

        },


        error: error => {


          console.error(
            'Error al cargar bloqueos:',
            error
          );


          this.cargandoBloqueos =
            false;


          this.error =
            'No fue posible cargar los horarios bloqueados.';


          this.cdr
            .detectChanges();

        }

      });

  }


  /*
   * ========================================
   * CREAR BLOQUEO
   * ========================================
   */

  crearBloqueo(): void {


    if (
      !this.fechaBloqueo ||
      !this.horaBloqueo
    ) {


      this.error =
        'Debes seleccionar una fecha y una hora.';


      return;

    }


    this.creandoBloqueo =
      true;


    this.mensaje = '';

    this.error = '';


    const body = {

      fecha:
      this.fechaBloqueo,

      hora:
      this.horaBloqueo,

      motivo:
        this.motivoBloqueo.trim()

    };


    this.http

      .post<RespuestaGeneral>(
        '/api/admin/bloqueos',
        body
      )

      .subscribe({


        next: response => {


          this.creandoBloqueo =
            false;


          this.mensaje =
            response.mensaje;


          this.horaBloqueo = '';

          this.motivoBloqueo = '';


          this.cargarBloqueos();


          this.cdr
            .detectChanges();

        },


        error: error => {


          this.creandoBloqueo =
            false;


          this.error =
            error.error?.mensaje ??
            'No fue posible bloquear el horario.';


          this.cdr
            .detectChanges();

        }

      });

  }


  /*
   * ========================================
   * ELIMINAR BLOQUEO
   * ========================================
   */

  eliminarBloqueo(
    bloqueo: BloqueoAdmin
  ): void {


    const confirmar =
      window.confirm(
        `¿Deseas liberar el horario ${bloqueo.hora} del ${this.formatearFecha(bloqueo.fecha)}?`
      );


    if (!confirmar) {

      return;

    }


    this.eliminandoBloqueoId =
      bloqueo.id;


    this.mensaje = '';

    this.error = '';


    this.http

      .delete<RespuestaGeneral>(
        `/api/admin/bloqueos/${bloqueo.id}`
      )

      .subscribe({


        next: response => {


          this.eliminandoBloqueoId =
            null;


          this.mensaje =
            response.mensaje;


          this.bloqueos =
            this.bloqueos.filter(
              item =>
                item.id !==
                bloqueo.id
            );


          this.cdr
            .detectChanges();

        },


        error: error => {


          this.eliminandoBloqueoId =
            null;


          this.error =
            error.error?.mensaje ??
            'No fue posible eliminar el bloqueo.';


          this.cdr
            .detectChanges();

        }

      });

  }


  /*
   * ========================================
   * HORARIOS PARA BLOQUEO
   * ========================================
   */

  get horariosParaBloqueo():
    string[] {


    if (
      !this.fechaBloqueo
    ) {

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


    if (
      fecha.getDay() === 0
    ) {

      return this.horariosDomingo;

    }


    return this.horariosSemana;

  }


  /*
   * ========================================
   * CAMBIAR FECHA DE BLOQUEO
   * ========================================
   */

  cambiarFechaBloqueo(): void {

    this.horaBloqueo = '';

  }


  /*
   * ========================================
   * FECHA MÍNIMA
   * ========================================
   */

  get fechaMinima(): string {


    return this
      .formatearFechaInput(
        new Date()
      );

  }


  /*
   * ========================================
   * FECHA MÁXIMA
   * ========================================
   */

  get fechaMaxima(): string {


    const fecha =
      new Date();


    fecha.setDate(
      fecha.getDate() + 7
    );


    return this
      .formatearFechaInput(
        fecha
      );

  }


  /*
   * ========================================
   * FORMATEAR PARA INPUT
   *
   * YYYY-MM-DD
   * ========================================
   */

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


    return (
      `${anio}-${mes}-${dia}`
    );

  }


  /*
   * ========================================
   * FORMATEAR FECHA VISUAL
   * ========================================
   */

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


    const fechaLocal =
      new Date(

        anio,

        mes - 1,

        dia

      );


    return fechaLocal
      .toLocaleDateString(

        'es-CL',

        {

          weekday:
            'short',

          day:
            '2-digit',

          month:
            '2-digit',

          year:
            'numeric'

        }

      );

  }

}
