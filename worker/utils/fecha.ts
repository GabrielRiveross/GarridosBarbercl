import {
  HORARIOS_DOMINGO,
  HORARIOS_SEMANA,
  MAX_DIAS_ANTICIPACION,
  MINUTOS_ANTICIPACION,
  ZONA_HORARIA
} from '../config/horarios';


export interface FechaPartes {

  anio: number;

  mes: number;

  dia: number;

}


export interface FechaHoraChile
  extends FechaPartes {

  hora: number;

  minuto: number;

}


/*
 * ========================================
 * FECHA Y HORA ACTUAL EN CHILE
 * ========================================
 */

export function obtenerFechaHoraChile():
  FechaHoraChile {


  const formateador =
    new Intl.DateTimeFormat(
      'en-CA',
      {

        timeZone:
        ZONA_HORARIA,

        year:
          'numeric',

        month:
          '2-digit',

        day:
          '2-digit',

        hour:
          '2-digit',

        minute:
          '2-digit',

        hourCycle:
          'h23'

      }
    );


  const partes =
    formateador.formatToParts(
      new Date()
    );


  const obtener =
    (
      tipo:
      Intl.DateTimeFormatPartTypes
    ): number => {


      const valor =
        partes.find(
          parte =>
            parte.type === tipo
        )?.value;


      return Number(
        valor ?? 0
      );

    };


  return {

    anio:
      obtener('year'),

    mes:
      obtener('month'),

    dia:
      obtener('day'),

    hora:
      obtener('hour'),

    minuto:
      obtener('minute')

  };

}


/*
 * ========================================
 * PARSEAR FECHA
 * ========================================
 */

export function parsearFecha(
  fecha: string
): FechaPartes | null {


  const coincidencia =
    /^(\d{4})-(\d{2})-(\d{2})$/
      .exec(fecha);


  if (!coincidencia) {

    return null;

  }


  const anio =
    Number(
      coincidencia[1]
    );


  const mes =
    Number(
      coincidencia[2]
    );


  const dia =
    Number(
      coincidencia[3]
    );


  const fechaComprobacion =
    new Date(
      Date.UTC(
        anio,
        mes - 1,
        dia,
        12
      )
    );


  if (
    fechaComprobacion
      .getUTCFullYear()
    !== anio ||

    fechaComprobacion
      .getUTCMonth()
    !== mes - 1 ||

    fechaComprobacion
      .getUTCDate()
    !== dia
  ) {

    return null;

  }


  return {

    anio,

    mes,

    dia

  };

}


/*
 * ========================================
 * NÚMERO DE DÍA
 * ========================================
 */

export function obtenerNumeroDia(
  fecha: FechaPartes
): number {


  return Math.floor(

    Date.UTC(
      fecha.anio,
      fecha.mes - 1,
      fecha.dia
    )

    /

    86400000

  );

}


/*
 * ========================================
 * DÍA DE LA SEMANA
 * ========================================
 */

export function obtenerDiaSemana(
  fecha: FechaPartes
): number {


  const fechaUTC =
    new Date(
      Date.UTC(
        fecha.anio,
        fecha.mes - 1,
        fecha.dia,
        12
      )
    );


  return fechaUTC
    .getUTCDay();

}


/*
 * ========================================
 * VALIDAR FORMATO DE HORA
 * ========================================
 */

export function horaValida(
  hora: string
): boolean {


  return (
    /^\d{2}:\d{2}$/
      .test(hora)
  );

}


/*
 * ========================================
 * HORARIOS PERMITIDOS
 * ========================================
 */

export function obtenerHorariosPermitidos(
  fecha: FechaPartes
): string[] {


  const diaSemana =
    obtenerDiaSemana(
      fecha
    );


  if (
    diaSemana === 0
  ) {

    return HORARIOS_DOMINGO;

  }


  return HORARIOS_SEMANA;

}


/*
 * ========================================
 * VALIDAR RANGO
 * ========================================
 */

export function validarRangoFecha(
  fechaReserva: FechaPartes
): boolean {


  const ahoraChile =
    obtenerFechaHoraChile();


  const hoy: FechaPartes = {

    anio:
    ahoraChile.anio,

    mes:
    ahoraChile.mes,

    dia:
    ahoraChile.dia

  };


  const numeroHoy =
    obtenerNumeroDia(
      hoy
    );


  const numeroReserva =
    obtenerNumeroDia(
      fechaReserva
    );


  const diferenciaDias =
    numeroReserva -
    numeroHoy;


  return (
    diferenciaDias >= 0 &&
    diferenciaDias <=
    MAX_DIAS_ANTICIPACION
  );

}


/*
 * ========================================
 * VALIDAR ANTICIPACIÓN
 * ========================================
 */

export function validarAnticipacion(
  fechaReserva: FechaPartes,
  horaReserva: string
): boolean {


  const ahoraChile =
    obtenerFechaHoraChile();


  const hoy: FechaPartes = {

    anio:
    ahoraChile.anio,

    mes:
    ahoraChile.mes,

    dia:
    ahoraChile.dia

  };


  const numeroHoy =
    obtenerNumeroDia(
      hoy
    );


  const numeroReserva =
    obtenerNumeroDia(
      fechaReserva
    );


  if (
    numeroReserva >
    numeroHoy
  ) {

    return true;

  }


  if (
    numeroReserva <
    numeroHoy
  ) {

    return false;

  }


  const [
    horas,
    minutos
  ] =
    horaReserva
      .split(':')
      .map(Number);


  const minutosActuales =

    ahoraChile.hora *
    60

    +

    ahoraChile.minuto;


  const minutosReserva =

    horas *
    60

    +

    minutos;


  return (

    minutosReserva -
    minutosActuales

    >=

    MINUTOS_ANTICIPACION

  );

}
