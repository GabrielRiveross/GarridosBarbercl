import {
  BloqueosService
} from '../services/bloqueos.service';

import {
  ReservasService
} from '../services/reservas.service';

import {
  parsearFecha,
  validarRangoFecha
} from '../utils/fecha';

import {
  respuestaError,
  respuestaOk
} from '../utils/response';


export async function handleDisponibilidadRoutes(
  request: Request,
  url: URL,
  reservasService: ReservasService,
  bloqueosService: BloqueosService
): Promise<Response | null> {


  if (
    url.pathname !==
    '/api/disponibilidad' ||
    request.method !==
    'GET'
  ) {

    return null;

  }


  try {

    const fecha =
      url.searchParams
        .get(
          'fecha'
        );


    if (!fecha) {

      return respuestaError(
        'Debe indicar una fecha.'
      );

    }


    const fechaParseada =
      parsearFecha(
        fecha
      );


    if (!fechaParseada) {

      return respuestaError(
        'La fecha indicada no es válida.'
      );

    }


    if (
      !validarRangoFecha(
        fechaParseada
      )
    ) {

      return respuestaError(
        'La fecha está fuera del período disponible para reservas.'
      );

    }


    const [
      horasReservadas,
      horasBloqueadas
    ] =
      await Promise.all([

        reservasService
          .obtenerHorasConfirmadas(
            fecha
          ),

        bloqueosService
          .obtenerHorasBloqueadas(
            fecha
          )

      ]);


    const horasOcupadas =
      [
        ...new Set([
          ...horasReservadas,
          ...horasBloqueadas
        ])
      ];


    return respuestaOk({
      fecha,
      horasOcupadas
    });

  } catch (error) {

    console.error(
      'Error al consultar disponibilidad:',
      error
    );


    return respuestaError(
      'No fue posible consultar la disponibilidad.',
      500
    );

  }

}
