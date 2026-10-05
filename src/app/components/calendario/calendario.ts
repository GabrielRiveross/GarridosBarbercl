import {
  Component,
  OnInit
} from '@angular/core';

import {
  DiaCalendario
} from '../../models/dia-calendario';

import {
  Reserva
} from '../../models/reserva';

import {
  ReservaForm
} from '../reserva-form/reserva-form';

import {
  ReservasService
} from '../../services/reservas.service';


@Component({
  selector: 'app-calendario',

  imports: [
    ReservaForm
  ],

  templateUrl: './calendario.html',

  styleUrl: './calendario.scss'
})
export class Calendario implements OnInit {


  /*
   * FECHA ACTUAL
   */

  fechaActual = new Date();


  /*
   * MES MOSTRADO
   */

  mesMostrado =
    this.fechaActual.getMonth();

  anioMostrado =
    this.fechaActual.getFullYear();


  /*
   * DÍAS DEL CALENDARIO
   */

  dias: DiaCalendario[] = [];


  /*
   * SELECCIÓN DEL USUARIO
   */

  fechaSeleccionada:
    Date | null = null;

  horaSeleccionada:
    string | null = null;


  /*
   * FORMULARIO
   */

  mostrarFormulario = false;


  /*
   * ESTADO DE LA RESERVA
   */

  guardandoReserva = false;

  mensajeReserva = '';

  errorReserva = '';


  /*
   * CONTROL DE PETICIONES
   *
   * Permite ignorar respuestas antiguas
   * cuando el usuario cambia de fecha
   * rápidamente.
   */

  private solicitudDisponibilidadId = 0;


  /*
   * HORARIOS
   *
   * Lunes a sábado:
   *
   * 10:00 - 13:00
   * 15:00 - 19:00
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


  /*
   * DOMINGOS
   *
   * 20:00 - 22:00
   */

  horariosDomingo: string[] = [

    '20:00',
    '21:00',
    '22:00'

  ];


  /*
   * HORARIOS DISPONIBLES
   */

  horariosDisponibles:
    string[] = [];


  /*
   * NOMBRES DE LOS MESES
   */

  nombresMeses: string[] = [

    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'

  ];


  /*
   * SERVICIO
   */

  constructor(
    private reservasService:
    ReservasService
  ) {}


  /*
   * INICIO
   */

  ngOnInit(): void {

    this.generarCalendario();

  }


  /*
   * GENERAR CALENDARIO
   */

  generarCalendario(): void {

    this.dias = [];


    const primerDiaMes =
      new Date(
        this.anioMostrado,
        this.mesMostrado,
        1
      );


    const ultimoDiaMes =
      new Date(
        this.anioMostrado,
        this.mesMostrado + 1,
        0
      );


    /*
     * JavaScript:
     *
     * Domingo = 0
     * Lunes = 1
     * ...
     *
     * Nuestro calendario
     * comienza en lunes.
     */

    let diaSemanaInicio =
      primerDiaMes.getDay();


    diaSemanaInicio =
      diaSemanaInicio === 0
        ? 6
        : diaSemanaInicio - 1;


    /*
     * DÍAS DEL MES ANTERIOR
     */

    for (
      let i = diaSemanaInicio;
      i > 0;
      i--
    ) {

      const fecha =
        new Date(
          this.anioMostrado,
          this.mesMostrado,
          1 - i
        );


      this.agregarDia(
        fecha,
        false
      );

    }


    /*
     * DÍAS DEL MES ACTUAL
     */

    for (
      let dia = 1;
      dia <= ultimoDiaMes.getDate();
      dia++
    ) {

      const fecha =
        new Date(
          this.anioMostrado,
          this.mesMostrado,
          dia
        );


      this.agregarDia(
        fecha,
        true
      );

    }


    /*
     * COMPLETAR HASTA
     * 42 CASILLAS
     */

    while (
      this.dias.length < 42
      ) {

      const ultimoDia =
        this.dias[
        this.dias.length - 1
          ].fecha;


      const fecha =
        new Date(
          ultimoDia
        );


      fecha.setDate(
        fecha.getDate() + 1
      );


      this.agregarDia(
        fecha,
        false
      );

    }

  }


  /*
   * AGREGAR DÍA
   */

  private agregarDia(
    fecha: Date,
    esMesActual: boolean
  ): void {


    const hoy =
      this.normalizarFecha(
        new Date()
      );


    const fechaComparar =
      this.normalizarFecha(
        fecha
      );


    const fechaLimite =
      new Date(
        hoy
      );


    fechaLimite.setDate(
      fechaLimite.getDate() + 7
    );


    const disponible =

      esMesActual &&

      fechaComparar >= hoy &&

      fechaComparar <= fechaLimite;


    this.dias.push({

      fecha,

      numero:
        fecha.getDate(),

      esMesActual,

      esHoy:
        fechaComparar.getTime()
        ===
        hoy.getTime(),

      disponible,

      seleccionado:

        this.fechaSeleccionada !== null

        &&

        fechaComparar.getTime()
        ===
        this.normalizarFecha(
          this.fechaSeleccionada
        ).getTime()

    });

  }


  /*
   * SELECCIONAR DÍA
   */

  seleccionarDia(
    dia: DiaCalendario
  ): void {


    if (!dia.disponible) {

      return;

    }


    /*
     * Al cambiar de fecha,
     * limpiamos mensajes anteriores.
     */

    this.mensajeReserva = '';

    this.errorReserva = '';


    this.fechaSeleccionada =
      new Date(
        dia.fecha
      );


    this.horaSeleccionada =
      null;


    this.mostrarFormulario =
      false;


    /*
     * Consultar horarios disponibles.
     */

    this.cargarHorarios();


    /*
     * Actualizar selección visual.
     */

    this.generarCalendario();

  }


  /*
   * CARGAR HORARIOS
   */

  private cargarHorarios(): void {


    if (!this.fechaSeleccionada) {

      this.horariosDisponibles = [];

      return;

    }


    /*
     * ID único para esta consulta.
     *
     * Si el usuario cambia de día,
     * una respuesta anterior no podrá
     * sobrescribir los horarios actuales.
     */

    const solicitudId =
      ++this.solicitudDisponibilidadId;


    /*
     * COPIA DE LA FECHA
     *
     * Importante para que esta petición
     * no dependa de cambios posteriores
     * en fechaSeleccionada.
     */

    const fechaConsulta =
      new Date(
        this.fechaSeleccionada
      );


    /*
     * HORARIOS DEL DÍA
     */

    let horariosBase =
      this.obtenerHorariosBase(
        fechaConsulta
      );


    /*
     * SI ES HOY:
     *
     * quitar horarios pasados
     * y exigir 30 minutos
     * de anticipación.
     */

    if (
      this.esHoy(
        fechaConsulta
      )
    ) {


      const ahora =
        new Date();


      const anticipacionMinutos =
        30;


      const limiteReserva =
        new Date(
          ahora.getTime() +
          anticipacionMinutos *
          60 *
          1000
        );


      horariosBase =
        horariosBase.filter(
          hora => {


            const [
              horas,
              minutos
            ] = hora
              .split(':')
              .map(Number);


            const fechaHoraReserva =
              new Date(
                fechaConsulta
              );


            fechaHoraReserva.setHours(
              horas,
              minutos,
              0,
              0
            );


            return (
              fechaHoraReserva >
              limiteReserva
            );

          }
        );

    }


    /*
     * Limpiamos visualmente
     * los horarios anteriores.
     *
     * Esto evita que se vean por
     * un instante los del domingo
     * al cambiar a otro día.
     */

    this.horariosDisponibles = [];


    /*
     * Convertir fecha a:
     *
     * YYYY-MM-DD
     */

    const fecha =
      this.formatearFecha(
        fechaConsulta
      );


    /*
     * CONSULTAR D1
     */

    this.reservasService
      .obtenerDisponibilidad(fecha)
      .subscribe({


        next: response => {


          /*
           * Si existe una consulta
           * más nueva, ignoramos ésta.
           */

          if (
            solicitudId !==
            this.solicitudDisponibilidadId
          ) {

            return;

          }


          /*
           * También verificamos que
           * seguimos en la misma fecha.
           */

          if (
            !this.fechaSeleccionada
          ) {

            return;

          }


          const fechaActualSeleccionada =
            this.formatearFecha(
              this.fechaSeleccionada
            );


          if (
            fechaActualSeleccionada !==
            fecha
          ) {

            return;

          }


          /*
           * QUITAR HORAS OCUPADAS
           */

          this.horariosDisponibles =
            horariosBase.filter(
              hora =>
                !response
                  .horasOcupadas
                  .includes(hora)
            );

        },


        error: () => {


          /*
           * No mostramos el error
           * si esta petición ya es antigua.
           */

          if (
            solicitudId !==
            this.solicitudDisponibilidadId
          ) {

            return;

          }


          this.horariosDisponibles = [];


          this.errorReserva =
            'No fue posible cargar los horarios disponibles.';

        }

      });

  }


  /*
   * OBTENER HORARIOS BASE
   */

  private obtenerHorariosBase(
    fecha: Date
  ): string[] {


    const diaSemana =
      fecha.getDay();


    /*
     * Domingo
     */

    if (
      diaSemana === 0
    ) {

      return [
        ...this.horariosDomingo
      ];

    }


    /*
     * Lunes a sábado
     */

    return [
      ...this.horariosSemana
    ];

  }


  /*
   * COMPROBAR SI UNA FECHA
   * CORRESPONDE A HOY
   */

  private esHoy(
    fecha: Date
  ): boolean {


    const hoy =
      this.normalizarFecha(
        new Date()
      );


    const fechaComparar =
      this.normalizarFecha(
        fecha
      );


    return (
      hoy.getTime()
      ===
      fechaComparar.getTime()
    );

  }


  /*
   * SELECCIONAR HORA
   */

  seleccionarHora(
    hora: string
  ): void {

    this.horaSeleccionada =
      hora;

  }


  /*
   * CONTINUAR AL FORMULARIO
   */

  continuarReserva(): void {


    if (
      !this.fechaSeleccionada ||
      !this.horaSeleccionada
    ) {

      return;

    }


    this.mostrarFormulario =
      true;

  }


  /*
   * VOLVER DESDE
   * EL FORMULARIO
   */

  volverAHorarios(): void {

    this.mostrarFormulario =
      false;

  }


  /*
   * CREAR RESERVA
   */

  recibirReserva(
    reserva: Reserva
  ): void {


    /*
     * Evita doble envío.
     */

    if (
      this.guardandoReserva
    ) {

      return;

    }


    this.guardandoReserva =
      true;


    this.mensajeReserva = '';

    this.errorReserva = '';


    this.reservasService
      .crearReserva(reserva)
      .subscribe({


        /*
         * RESERVA EXITOSA
         */

        next: response => {


          this.guardandoReserva =
            false;


          /*
           * Mostrar confirmación
           * inmediatamente.
           */

          this.mensajeReserva =
            response.mensaje;


          /*
           * Cerrar formulario.
           */

          this.mostrarFormulario =
            false;


          /*
           * Mantener fecha,
           * quitar hora seleccionada.
           */

          this.horaSeleccionada =
            null;


          /*
           * Volver a consultar D1
           * para eliminar inmediatamente
           * la hora recién reservada.
           */

          this.cargarHorarios();


          /*
           * Mantener correctamente
           * marcado el día.
           */

          this.generarCalendario();

        },


        /*
         * ERROR
         */

        error: error => {


          this.guardandoReserva =
            false;


          /*
           * HORARIO OCUPADO
           */

          if (
            error.status === 409
          ) {


            this.errorReserva =
              'Este horario acaba de ser reservado. Selecciona otra hora.';


            this.mostrarFormulario =
              false;


            this.horaSeleccionada =
              null;


            this.cargarHorarios();


            return;

          }


          /*
           * HORARIO NO VÁLIDO
           * O PETICIÓN INCORRECTA
           */

          if (
            error.status === 400
          ) {


            this.errorReserva =
              error.error?.mensaje ??
              'El horario seleccionado no es válido.';


            this.mostrarFormulario =
              false;


            this.horaSeleccionada =
              null;


            this.cargarHorarios();


            return;

          }


          /*
           * ERROR GENERAL
           */

          this.errorReserva =
            'No se pudo realizar la reserva. Inténtalo nuevamente.';

        }

      });

  }


  /*
   * MES ANTERIOR
   */

  mesAnterior(): void {


    this.mesMostrado--;


    if (
      this.mesMostrado < 0
    ) {

      this.mesMostrado = 11;

      this.anioMostrado--;

    }


    this.generarCalendario();

  }


  /*
   * MES SIGUIENTE
   */

  mesSiguiente(): void {


    this.mesMostrado++;


    if (
      this.mesMostrado > 11
    ) {

      this.mesMostrado = 0;

      this.anioMostrado++;

    }


    this.generarCalendario();

  }


  /*
   * FORMATEAR FECHA
   *
   * Date
   * ↓
   * YYYY-MM-DD
   */

  private formatearFecha(
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
   * NORMALIZAR FECHA
   *
   * Elimina hora,
   * minutos y segundos.
   */

  private normalizarFecha(
    fecha: Date
  ): Date {


    return new Date(

      fecha.getFullYear(),

      fecha.getMonth(),

      fecha.getDate()

    );

  }

}
