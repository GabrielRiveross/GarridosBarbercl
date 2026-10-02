export default {

  async fetch(
    request: Request,
    env: {
      DB: any;
    }
  ) {

    const url = new URL(request.url);

    // Permite comprobar qué versión
    // del Worker está desplegada
    if (url.pathname === '/api/test') {

      return Response.json({
        ok: true,
        version: 2,
        mensaje:
          'Worker actualizado funcionando'
      });
    }

    // Prueba de D1
    if (url.pathname === '/api/test-db') {

      try {

        const resultado =
          await env.DB
            .prepare(
              'SELECT * FROM reservas'
            )
            .all();

        return Response.json({
          ok: true,
          mensaje:
            'Conexion con D1 funcionando',
          reservas:
          resultado.results
        });

      } catch (error) {

        return Response.json(
          {
            ok: false,
            mensaje:
              'Error al conectar con D1',
            error:
              error instanceof Error
                ? error.message
                : String(error)
          },
          {
            status: 500
          }
        );
      }
    }

    // Nos muestra qué ruta recibió realmente
    return Response.json(
      {
        ok: false,
        mensaje:
          'Ruta API no encontrada',
        rutaRecibida:
        url.pathname
      },
      {
        status: 404
      }
    );
  }

};
