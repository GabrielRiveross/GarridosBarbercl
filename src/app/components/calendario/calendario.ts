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
   * MES QUE ESTAMOS MOSTRANDO
   */

  mesMostrado =
    this.fechaActual.getMonth();

  anioMostrado =
    this.fechaActual.getFullYear();


  /*
   * DÍAS QUE APARECERÁN
   * EN EL CALENDARIO
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
   * MOSTRAR FORMULARIO
   */

  mostrarFormulario = false;


  /*
   * ESTADO DE LA RESERVA
   */

  guardandoReserva = false;

  mensajeReserva = '';

  errorReserva = '';


  /*
   * HORARIOS
   *
   * Lunes a sábado:
   *
   * 10:00 - 13:00
   *
   * descanso
   *
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
   * SERVICIO DE RESERVAS
   */

  constructor(
    private reservasService:
    ReservasService
  ) {}


  /*
   * AL INICIAR
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
     * Martes = 2
     * ...
     *
     * Nuestro calendario comienza
     * en lunes.
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


    /*
     * HOY + 7 DÍAS
     */

    const fechaLimite =
      new Date(
        hoy
      );


    fechaLimite.setDate(
      fechaLimite.getDate() + 7
    );


    /*
     * DISPONIBILIDAD DEL DÍA
     */

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
     * Al seleccionar otro día
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
     * Consulta horarios locales
     * + disponibilidad de D1.
     */

    this.cargarHorarios();


    this.generarCalendario();

  }


  /*
   * CARGAR HORARIOS
   *
   * 1. Determina horarios del día.
   * 2. Elimina horas pasadas si es hoy.
   * 3. Consulta D1.
   * 4. Elimina horas ya reservadas.
   */

  private cargarHorarios(): void {

    if (!this.fechaSeleccionada) {

      this.horariosDisponibles = [];

      return;

    }


    const diaSemana =
      this.fechaSeleccionada.getDay();


    let horariosBase: string[];


    /*
     * Domingo
     */

    if (diaSemana === 0) {

      horariosBase = [
        ...this.horariosDomingo
      ];

    } else {

      /*
       * Lunes a sábado
       */

      horariosBase = [
        ...this.horariosSemana
      ];

    }


    /*
     * COMPROBAR SI ES HOY
     */

    const hoy =
      this.normalizarFecha(
        new Date()
      );


    const fechaSeleccionadaNormalizada =
      this.normalizarFecha(
        this.fechaSeleccionada
      );


    const esHoy =
      hoy.getTime() ===
      fechaSeleccionadaNormalizada.getTime();


    /*
     * SI ES HOY:
     *
     * Eliminamos horas pasadas
     * y exigimos 30 minutos
     * de anticipación.
     */

    if (esHoy) {

      const ahora =
        new Date();


      const anticipacionMinutos =
        30;


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
                this.fechaSeleccionada!
              );


            fechaHoraReserva.setHours(
              horas,
              minutos,
              0,
              0
            );


            const limiteReserva =
              new Date(
                ahora.getTime() +
                anticipacionMinutos *
                60 *
                1000
              );


            return (
              fechaHoraReserva >
              limiteReserva
            );

          }
        );

    }


    /*
     * FORMATEAR FECHA PARA LA API
     *
     * Ejemplo:
     * 2026-10-05
     */

    const fecha =
      this.formatearFecha(
        this.fechaSeleccionada
      );


    /*
     * CONSULTAR D1
     */

    this.reservasService
      .obtenerDisponibilidad(fecha)
      .subscribe({

        next: response => {


          /*
           * Eliminamos de los horarios
           * las horas ocupadas.
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
           * Si no podemos consultar D1,
           * no mostramos horarios para
           * evitar reservas incorrectas.
           */

          this.horariosDisponibles = [];


          this.errorReserva =
            'No fue posible cargar los horarios disponibles.';

        }

      });

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
   * VOLVER DESDE FORMULARIO
   */

  volverAHorarios(): void {

    this.mostrarFormulario =
      false;

  }


  /*
   * RECIBIR RESERVA
   * DESDE reserva-form
   */

  recibirReserva(
    reserva: Reserva
  ): void {


    /*
     * Evita doble clic
     * o doble envío.
     */

    if (this.guardandoReserva) {

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
         * RESERVA CREADA
         */

        next: response => {


          this.guardandoReserva =
            false;


          /*
           * IMPORTANTE:
           *
           * Este mensaje NO se limpia
           * en cargarHorarios().
           */

          this.mensajeReserva =
            response.mensaje;


          this.mostrarFormulario =
            false;


          this.horaSeleccionada =
            null;


          /*
           * Volvemos a consultar D1.
           *
           * La hora recién reservada
           * debería desaparecer.
           */

          this.cargarHorarios();

        },


        /*
         * ERROR
         */

        error: error => {


          this.guardandoReserva =
            false;


          /*
           * 409:
           *
           * Otra persona reservó
           * esa hora primero.
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
