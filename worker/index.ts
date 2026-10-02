export default {

  async fetch(
    request: Request,
    env: {
      DB: any;
    }
  ) {

    const url =
      new URL(request.url);

    if (
      url.pathname === '/api/test'
    ) {

      return Response.json({
        ok: true,
        mensaje:
          'API de Garridos Barber funcionando'
      });
    }

    if (
      url.pathname === '/api/test-db'
    ) {

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
            'Conexión con D1 funcionando',
          reservas:
          resultado.results
        });

      } catch (error) {

        return Response.json(
          {
            ok: false,
            mensaje:
              'Error al conectar con D1'
          },
          {
            status: 500
          }
        );
      }
    }

    return new Response(
      'Ruta API no encontrada',
      {
        status: 404
      }
    );
  }

};
