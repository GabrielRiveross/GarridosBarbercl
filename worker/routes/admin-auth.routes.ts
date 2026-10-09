import {
  AdminAuthService
} from '../services/admin-auth.service';

import {
  respuestaError,
  respuestaOk
} from '../utils/response';


export async function handleAdminAuthRoutes(
  request: Request,
  url: URL,
  authService: AdminAuthService
): Promise<Response | null> {


  /*
   * ========================================
   * LOGIN
   * ========================================
   */

  if (
    url.pathname ===
    '/api/admin/login' &&
    request.method ===
    'POST'
  ) {

    try {

      const body =
        await request.json<{
          password?: string;
        }>();


      const password =
        body.password ?? '';


      if (
        !authService
          .validarPassword(
            password
          )
      ) {

        return respuestaError(
          'Contraseña incorrecta.',
          401
        );

      }


      const cookie =
        await authService
          .crearCookieSesion();


      return Response.json(
        {
          ok: true,
          mensaje:
            'Sesión iniciada correctamente.'
        },
        {
          headers: {
            'Set-Cookie':
            cookie
          }
        }
      );

    } catch {

      return respuestaError(
        'Solicitud no válida.'
      );

    }

  }


  /*
   * ========================================
   * SESSION
   * ========================================
   */

  if (
    url.pathname ===
    '/api/admin/session' &&
    request.method ===
    'GET'
  ) {

    const autenticado =
      await authService
        .estaAutenticado(
          request
        );


    return respuestaOk({
      autenticado
    });

  }


  /*
   * ========================================
   * LOGOUT
   * ========================================
   */

  if (
    url.pathname ===
    '/api/admin/logout' &&
    request.method ===
    'POST'
  ) {

    return Response.json(
      {
        ok: true,
        mensaje:
          'Sesión cerrada correctamente.'
      },
      {
        headers: {
          'Set-Cookie':
            authService
              .crearCookieLogout()
        }
      }
    );

  }


  return null;

}
