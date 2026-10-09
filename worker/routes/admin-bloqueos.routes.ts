import {
  BloqueoRequest
} from '../types/bloqueo';

import {
  BloqueosService
} from '../services/bloqueos.service';

import {
  ReservasService
} from '../services/reservas.service';

import {
  horaValida,
  obtenerHorariosPermitidos,
  parsearFecha,
  validarRangoFecha
} from '../utils/fecha';

import {
  esErrorUnique,
  obtenerIdDesdeRuta
} from '../utils/validators';

import {
  respuestaError,
  respuestaOk
} from '../utils/response';


export async function handleAdminBloqueosRoutes(
  request: Request,
  url: URL,
  bloqueosService: BloqueosService,
  reservasService: ReservasService
): Promise<Response | null> {


  /*
   * ========================================
   * LISTAR
   * ========================================
   */

  if (
    url.pathname ===
    '/api/admin/bloqueos' &&
    request.method ===
    'GET'
  ) {

    try {

      const bloqueos =
        await bloqueosService
          .listar();


      return respuestaOk({
        bloqueos
      });

    } catch (error) {

      console.error(
        'Error al obtener bloqueos:',
        error
      );


      return respuestaError(
        'No se pudieron obtener los bloqueos.',
        500
      );

    }

  }


  /*
   * ========================================
   * CREAR
   * ========================================
   */

  if (
    url.pathname ===
    '/api/admin/bloqueos' &&
    request.method ===
    'POST'
  ) {

    try {

      const body =
        await request
          .json<BloqueoRequest>();


      const {
        fecha,
        hora,
        motivo
      } = body;


      if (
        !fecha ||
        !hora
      ) {

        return respuestaError(
          'Debe indicar fecha y hora.'
        );

      }


      const fechaParseada =
        parsearFecha(
          fecha
        );


      if (!fechaParseada) {

        return respuestaError(
          'La fecha no es válida.'
        );

      }


      if (
        !validarRangoFecha(
          fechaParseada
        )
      ) {

        return respuestaError(
          'Solo puedes bloquear horarios dentro del período disponible.'
        );

      }


      if (
        !horaValida(
          hora
        )
      ) {

        return respuestaError(
          'La hora no es válida.'
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
          'Ese horario no corresponde al horario de atención de ese día.'
        );

      }


      const reservaExistente =
        await reservasService
          .existeReservaConfirmada(
            fecha,
            hora
          );


      if (
        reservaExistente
      ) {

        return respuestaError(
          'No puedes bloquear una hora que ya tiene una reserva confirmada.',
          409
        );

      }


      const id =
        await bloqueosService
          .crear({
            fecha,
            hora,
            motivo
          });


      return respuestaOk(
        {
          mensaje:
            'Horario bloqueado correctamente.',
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
          'Ese horario ya está bloqueado.',
          409
        );

      }


      console.error(
        'Error al crear bloqueo:',
        error
      );


      return respuestaError(
        'No se pudo bloquear el horario.',
        500
      );

    }

  }


  /*
   * ========================================
   * ELIMINAR
   * ========================================
   */

  if (
    url.pathname.startsWith(
      '/api/admin/bloqueos/'
    ) &&
    request.method ===
    'DELETE'
  ) {

    try {

      const id =
        obtenerIdDesdeRuta(
          url.pathname
        );


      if (!id) {

        return respuestaError(
          'El identificador del bloqueo no es válido.'
        );

      }


      const bloqueo =
        await bloqueosService
          .buscarPorId(
            id
          );


      if (!bloqueo) {

        return respuestaError(
          'El bloqueo no existe.',
          404
        );

      }


      await bloqueosService
        .eliminar(
          id
        );


      return respuestaOk({
        mensaje:
          'Bloqueo eliminado correctamente.'
      });

    } catch (error) {

      console.error(
        'Error al eliminar bloqueo:',
        error
      );


      return respuestaError(
        'No se pudo eliminar el bloqueo.',
        500
      );

    }

  }


  return null;

}
