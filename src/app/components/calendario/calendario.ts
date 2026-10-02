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
   * Controla si mostramos:
   *
   * horarios
   *
   * o
   *
   * formulario
   */

  mostrarFormulario = false;


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
   * Esta lista cambia automáticamente
   * dependiendo del día seleccionado.
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
   * Al cargar el componente
   * generamos el calendario.
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
     * Agregamos días del mes anterior
     * para completar la primera semana.
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
     * Completamos el calendario
     * hasta llegar a 42 casillas.
     *
     * 7 días × 6 semanas.
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
   * AGREGA UN DÍA AL CALENDARIO
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
     * Fecha máxima para reservar.
     *
     * Hoy + 7 días.
     */

    const fechaLimite =
      new Date(
        hoy
      );


    fechaLimite.setDate(
      fechaLimite.getDate() + 7
    );


    /*
     * Para reservar:
     *
     * - Debe pertenecer al mes mostrado.
     * - No puede ser anterior a hoy.
     * - No puede superar hoy + 7 días.
     */

    const disponible =

      esMesActual &&

      fechaComparar >= hoy &&

      fechaComparar <= fechaLimite;


    /*
     * Creamos el objeto
     * DiaCalendario.
     */

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
     * Guardamos una copia
     * de la fecha.
     */

    this.fechaSeleccionada =
      new Date(
        dia.fecha
      );


    /*
     * Si seleccionamos otra fecha,
     * eliminamos la hora anterior.
     */

    this.horaSeleccionada =
      null;


    /*
     * También regresamos al panel
     * de horarios.
     */

    this.mostrarFormulario =
      false;


    /*
     * Cargamos horarios según
     * el día seleccionado.
     */

    this.cargarHorarios();


    /*
     * Regeneramos para mostrar
     * visualmente el día seleccionado.
     */

    this.generarCalendario();

  }


  /*
   * HORARIOS SEGÚN DÍA
   */

  private cargarHorarios(): void {

    if (!this.fechaSeleccionada) {
      this.horariosDisponibles = [];
      return;
    }

    const diaSemana =
      this.fechaSeleccionada.getDay();

    let horariosBase: string[];

    // Domingo
    if (diaSemana === 0) {

      horariosBase = [
        ...this.horariosDomingo
      ];

    } else {

      // Lunes a sábado
      horariosBase = [
        ...this.horariosSemana
      ];

    }


    /*
     * Comprobamos si la fecha seleccionada
     * corresponde a hoy.
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
     * Si NO es hoy, mostramos todos
     * los horarios correspondientes.
     */

    if (!esHoy) {

      this.horariosDisponibles =
        horariosBase;

      return;

    }


    /*
     * Si ES HOY, eliminamos horarios
     * que ya pasaron.
     *
     * Además exigimos reservar con
     * mínimo 30 minutos de anticipación.
     */

    const ahora = new Date();

    const anticipacionMinutos = 30;


    this.horariosDisponibles =
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
   * VOLVER DESDE EL FORMULARIO
   * A LOS HORARIOS
   */

  volverAHorarios(): void {

    this.mostrarFormulario =
      false;

  }


  /*
   * RECIBIR RESERVA DESDE
   * reserva-form
   */

  recibirReserva(
    reserva: Reserva
  ): void {


    /*
     * Por ahora solamente comprobamos
     * que Angular está construyendo
     * correctamente la reserva.
     *
     * Más adelante aquí llamaremos
     * al servicio HTTP.
     */

    console.log(
      'Reserva preparada:',
      reserva
    );

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
   * NORMALIZAR FECHA
   *
   * Elimina hora, minutos y segundos.
   *
   * Así podemos comparar únicamente
   * las fechas.
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
