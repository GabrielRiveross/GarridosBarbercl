import {
  ReservaRequest
} from '../types/reserva';

import {
  ReservasService
} from '../services/reservas.service';

import {
  BloqueosService
} from '../services/bloqueos.service';

import {
  horaValida,
  obtenerHorariosPermitidos,
  parsearFecha,
  validarAnticipacion,
  validarRangoFecha
} from '../utils/fecha';

import {
  esErrorUnique
} from '../utils/validators';

import {
  respuestaError,
  respuestaOk
} from '../utils/response';


export async function handleReservasRoutes(
  request: Request,
  url: URL,
  reservasService: ReservasService,
  bloqueosService: BloqueosService
): Promise<Response | null> {


  if (
    url.pathname !==
    '/api/reservas' ||
    request.method !==
    'POST'
  ) {

    return null;

  }


  try {

    const body =
      await request
        .json<ReservaRequest>();


    const {
      nombre,
      apellido,
      telefono,
      fecha,
      hora
    } = body;


    if (
      !nombre ||
      !apellido ||
      !telefono ||
      !fecha ||
      !hora
    ) {

      return respuestaError(
        'Faltan datos para realizar la reserva.'
      );

    }


    const nombreLimpio =
      nombre.trim();


    const apellidoLimpio =
      apellido.trim();


    const telefonoLimpio =
      telefono
        .trim()
        .replace(
          /\s/g,
          ''
        )
        .replace(
          /-/g,
          ''
        );


    if (
      nombreLimpio.length < 2 ||
      apellidoLimpio.length < 2
    ) {

      return respuestaError(
        'El nombre y el apellido no son válidos.'
      );

    }


    const fechaParseada =
      parsearFecha(
        fecha
      );


    if (!fechaParseada) {

      return respuestaError(
        'La fecha seleccionada no es válida.'
      );

    }


    if (
      !validarRangoFecha(
        fechaParseada
      )
    ) {

      return respuestaError(
        'Solo puedes reservar desde hoy hasta los próximos 7 días.'
      );

    }


    if (
      !horaValida(
        hora
      )
    ) {

      return respuestaError(
        'La hora seleccionada no es válida.'
      );

    }


    const horariosPermitidos =
      obtenerHorariosPermitidos(
        fechaParseada
      );


    if (
      !horariosPermitidos
        .includes(
          hora
        )
    ) {

      return respuestaError(
        'El horario seleccionado no corresponde al horario de atención de ese día.'
      );

    }


    if (
      !validarAnticipacion(
        fechaParseada,
        hora
      )
    ) {

      return respuestaError(
        'La reserva debe realizarse con al menos 30 minutos de anticipación.'
      );

    }


    const bloqueoExistente =
      await bloqueosService
        .existeBloqueo(
          fecha,
          hora
        );


    if (
      bloqueoExistente
    ) {

      return respuestaError(
        'Este horario no está disponible.',
        409
      );

    }


    const id =
      await reservasService
        .crear({

          nombre:
          nombreLimpio,

          apellido:
          apellidoLimpio,

          telefono:
          telefonoLimpio,

          fecha,

          hora

        });


    return respuestaOk(
      {
        mensaje:
          'Reserva creada correctamente.',
        id
      },
      201
    );

  } catch (error) {

    if (
      esErrorUnique(
        error
      )
    ) {

      return respuestaError(
        'Este horario ya fue reservado.',
        409
      );

    }


    console.error(
      'Error al crear reserva:',
      error
    );


    return respuestaError(
      'No se pudo crear la reserva.',
      500
    );

  }

}
