export default {

  async fetch(
    request: Request,
    env: Env
  ) {

    const url = new URL(request.url);


    // =========================
    // TEST API
    // =========================

    if (
      url.pathname === '/api/test' &&
      request.method === 'GET'
    ) {
      return Response.json({
        ok: true,
        mensaje:
          'API de Garridos Barber funcionando'
      });
    }


    // =========================
    // TEST D1
    // =========================

    if (
      url.pathname === '/api/test-db' &&
      request.method === 'GET'
    ) {

      const resultado =
        await env.DB
          .prepare(
            'SELECT * FROM reservas'
          )
          .all();

      return Response.json({
        ok: true,
        reservas:
        resultado.results
      });
    }

    // =========================
// DISPONIBILIDAD
// =========================

    if (
      url.pathname === '/api/disponibilidad' &&
      request.method === 'GET'
    ) {

      const fecha =
        url.searchParams.get('fecha');

      if (!fecha) {
        return Response.json(
          {
            ok: false,
            mensaje:
              'Debe indicar una fecha.'
          },
          {
            status: 400
          }
        );
      }


      const resultado =
        await env.DB
          .prepare(`
        SELECT hora
        FROM reservas
        WHERE fecha = ?
        AND estado = 'confirmada'
        ORDER BY hora
      `)
          .bind(fecha)
          .all<{ hora: string }>();


      const horasOcupadas =
        resultado.results.map(
          reserva => reserva.hora
        );


      return Response.json({
        ok: true,
        fecha,
        horasOcupadas
      });
    }

    // =========================
    // CREAR RESERVA
    // =========================

    if (
      url.pathname === '/api/reservas' &&
      request.method === 'POST'
    ) {

      try {

        const body =
          await request.json<{
            nombre: string;
            apellido: string;
            telefono: string;
            fecha: string;
            hora: string;
          }>();

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

          return Response.json(
            {
              ok: false,
              mensaje:
                'Faltan datos para realizar la reserva.'
            },
            {
              status: 400
            }
          );
        }


        const resultado =
          await env.DB
            .prepare(`
              INSERT INTO reservas
              (
                nombre,
                apellido,
                telefono,
                fecha,
                hora
              )
              VALUES (?, ?, ?, ?, ?)
            `)
            .bind(
              nombre.trim(),
              apellido.trim(),
              telefono.trim(),
              fecha,
              hora
            )
            .run();


        return Response.json(
          {
            ok: true,
            mensaje:
              'Reserva creada correctamente.',
            id:
            resultado.meta.last_row_id
          },
          {
            status: 201
          }
        );

      } catch (error) {

        const mensajeError =
          error instanceof Error
            ? error.message
            : String(error);


        if (
          mensajeError.includes(
            'UNIQUE constraint failed'
          )
        ) {

          return Response.json(
            {
              ok: false,
              mensaje:
                'Este horario ya fue reservado.'
            },
            {
              status: 409
            }
          );
        }


        console.error(error);

        return Response.json(
          {
            ok: false,
            mensaje:
              'No se pudo crear la reserva.'
          },
          {
            status: 500
          }
        );
      }
    }


    // =========================
    // RUTA NO ENCONTRADA
    // =========================

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
