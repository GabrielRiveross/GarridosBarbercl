/*
 * ========================================
 * TYPES
 * ========================================
 */

import {
  AppEnv
} from './types/env';


/*
 * ========================================
 * SERVICES
 * ========================================
 */

import {
  ReservasService
} from './services/reservas.service';

import {
  BloqueosService
} from './services/bloqueos.service';

import {
  AdminAuthService
} from './services/admin-auth.service';


/*
 * ========================================
 * ROUTES
 * ========================================
 */

import {
  handleAdminAuthRoutes
} from './routes/admin-auth.routes';

import {
  handleAdminReservasRoutes
} from './routes/admin-reservas.routes';

import {
  handleAdminBloqueosRoutes
} from './routes/admin-bloqueos.routes';

import {
  handleDisponibilidadRoutes
} from './routes/disponibilidad.routes';

import {
  handleReservasRoutes
} from './routes/reservas.routes';


/*
 * ========================================
 * WORKER
 * ========================================
 */

export default {

  async fetch(
    request: Request,
    env: AppEnv
  ): Promise<Response> {


    const url =
      new URL(
        request.url
      );


    /*
     * ========================================
     * CREAR SERVICIOS
     * ========================================
     */

    const reservasService =
      new ReservasService(
        env.DB
      );


    const bloqueosService =
      new BloqueosService(
        env.DB
      );


    const authService =
      new AdminAuthService(
        env
      );


    /*
     * ========================================
     * RUTAS DE AUTENTICACIÓN
     *
     * Deben ejecutarse ANTES
     * de proteger /api/admin/*
     * ========================================
     */

    const authResponse =
      await handleAdminAuthRoutes(
        request,
        url,
        authService
      );


    if (
      authResponse
    ) {

      return authResponse;

    }


    /*
     * ========================================
     * PROTEGER RUTAS ADMIN
     * ========================================
     */

    if (
      url.pathname.startsWith(
        '/api/admin/'
      )
    ) {


      const autenticado =
        await authService
          .estaAutenticado(
            request
          );


      if (!autenticado) {

        return Response.json(
          {
            ok: false,
            mensaje:
              'No autorizado.'
          },
          {
            status: 401
          }
        );

      }

    }


    /*
     * ========================================
     * ADMIN - RESERVAS
     * ========================================
     */

    const adminReservasResponse =
      await handleAdminReservasRoutes(
        request,
        url,
        reservasService
      );


    if (
      adminReservasResponse
    ) {

      return adminReservasResponse;

    }


    /*
     * ========================================
     * ADMIN - BLOQUEOS
     * ========================================
     */

    const adminBloqueosResponse =
      await handleAdminBloqueosRoutes(
        request,
        url,
        bloqueosService,
        reservasService
      );


    if (
      adminBloqueosResponse
    ) {

      return adminBloqueosResponse;

    }


    /*
     * ========================================
     * DISPONIBILIDAD
     * ========================================
     */

    const disponibilidadResponse =
      await handleDisponibilidadRoutes(
        request,
        url,
        reservasService,
        bloqueosService
      );


    if (
      disponibilidadResponse
    ) {

      return disponibilidadResponse;

    }


    /*
     * ========================================
     * RESERVAS PÚBLICAS
     * ========================================
     */

    const reservasResponse =
      await handleReservasRoutes(
        request,
        url,
        reservasService,
        bloqueosService
      );


    if (
      reservasResponse
    ) {

      return reservasResponse;

    }


    /*
     * ========================================
     * TEST API
     * ========================================
     */

    if (
      url.pathname ===
      '/api/test' &&
      request.method ===
      'GET'
    ) {

      return Response.json({
        ok: true,
        mensaje:
          'API de Garridos Barber funcionando'
      });

    }


    /*
     * ========================================
     * TEST D1
     * ========================================
     */

    if (
      url.pathname ===
      '/api/test-db' &&
      request.method ===
      'GET'
    ) {

      try {

        const reservas =
          await reservasService
            .listar();


        return Response.json({
          ok: true,
          reservas
        });

      } catch (error) {

        console.error(
          'Error en test D1:',
          error
        );


        return Response.json(
          {
            ok: false,
            mensaje:
              'No fue posible consultar D1.'
          },
          {
            status: 500
          }
        );

      }

    }


    /*
     * ========================================
     * 404
     * ========================================
     */

    return Response.json(
      {
        ok: false,
        mensaje:
          'Ruta API no encontrada.'
      },
      {
        status: 404
      }
    );

  }

};
