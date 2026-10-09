import {
  ReservasService
} from '../services/reservas.service';

import {
  obtenerIdDesdeRuta
} from '../utils/validators';

import {
  respuestaError,
  respuestaOk
} from '../utils/response';


export async function handleAdminReservasRoutes(
  request: Request,
  url: URL,
  reservasService: ReservasService
): Promise<Response | null> {


  /*
   * ========================================
   * LISTAR
   * ========================================
   */

  if (
    url.pathname ===
    '/api/admin/reservas' &&
    request.method ===
    'GET'
  ) {

    try {

      const reservas =
        await reservasService
          .listar();


      return respuestaOk({
        reservas
      });

    } catch (error) {

      console.error(
        'Error al obtener reservas:',
        error
      );


      return respuestaError(
        'No se pudieron obtener las reservas.',
        500
      );

    }

  }


  /*
   * ========================================
   * CANCELAR
   * ========================================
   */

  if (
    url.pathname.startsWith(
      '/api/admin/reservas/'
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
          'El identificador de la reserva no es válido.',
          400
        );

      }


      const reserva =
        await reservasService
          .buscarPorId(
            id
          );


      if (!reserva) {

        return respuestaError(
          'La reserva no existe.',
          404
        );

      }


      if (
        reserva.estado ===
        'cancelada'
      ) {

        return respuestaError(
          'La reserva ya está cancelada.',
          409
        );

      }


      await reservasService
        .cancelar(
          id
        );


      return respuestaOk({
        mensaje:
          'Reserva cancelada correctamente.'
      });

    } catch (error) {

      console.error(
        'Error al cancelar reserva:',
        error
      );


      return respuestaError(
        'No se pudo cancelar la reserva.',
        500
      );

    }

  }


  return null;

}
