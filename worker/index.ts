/*
 * ========================================
 * HORARIOS DE GARRIDOS BARBER
 * ========================================
 */

const HORARIOS_SEMANA: string[] = [
  '10:00',
  '11:00',
  '12:00',
  '13:00',

  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00'
];


const HORARIOS_DOMINGO: string[] = [
  '20:00',
  '21:00',
  '22:00'
];


/*
 * ========================================
 * CONFIGURACIÓN GENERAL
 * ========================================
 */

const MAX_DIAS_ANTICIPACION = 7;

const MINUTOS_ANTICIPACION = 30;

const ZONA_HORARIA =
  'America/Santiago';


/*
 * ========================================
 * INTERFACES
 * ========================================
 */

interface ReservaRequest {

  nombre: string;

  apellido: string;

  telefono: string;

  fecha: string;

  hora: string;

}


interface FechaPartes {

  anio: number;

  mes: number;

  dia: number;

}


interface FechaHoraChile
  extends FechaPartes {

  hora: number;

  minuto: number;

}


interface ReservaAdmin {

  id: number;

  nombre: string;

  apellido: string;

  telefono: string;

  fecha: string;

  hora: string;

  estado: string;

  created_at: string;

}


interface BloqueoAdmin {

  id: number;

  fecha: string;

  hora: string;

  motivo: string | null;

  created_at: string;

}


interface BloqueoRequest {

  fecha: string;

  hora: string;

  motivo?: string;

}


/*
 * ========================================
 * OBTENER FECHA Y HORA DE CHILE
 * ========================================
 */

function obtenerFechaHoraChile():
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
 * VALIDAR Y CONVERTIR FECHA
 *
 * YYYY-MM-DD
 * ========================================
 */

function parsearFecha(
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


  /*
   * Evita fechas imposibles
   * como 2026-02-31.
   */

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
 * CONVERTIR FECHA A NÚMERO DE DÍA
 * ========================================
 */

function obtenerNumeroDia(
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
 * OBTENER DÍA DE LA SEMANA
 *
 * Domingo = 0
 * Lunes = 1
 * ...
 * Sábado = 6
 * ========================================
 */

function obtenerDiaSemana(
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

function horaValida(
  hora: string
): boolean {


  return (
    /^\d{2}:\d{2}$/
      .test(hora)
  );

}


/*
 * ========================================
 * HORARIOS PERMITIDOS SEGÚN DÍA
 * ========================================
 */

function obtenerHorariosPermitidos(
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
 * VALIDAR RANGO DE FECHA
 *
 * Hoy hasta hoy + 7 días.
 * ========================================
 */

function validarRangoFecha(
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
 * VALIDAR 30 MINUTOS DE ANTICIPACIÓN
 * ========================================
 */

function validarAnticipacion(
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


  /*
   * Fechas futuras.
   */

  if (
    numeroReserva >
    numeroHoy
  ) {

    return true;

  }


  /*
   * Fechas pasadas.
   */

  if (
    numeroReserva <
    numeroHoy
  ) {

    return false;

  }


  /*
   * Reserva para hoy.
   */

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


/*
 * ========================================
 * WORKER
 * ========================================
 */

export default {

  async fetch(
    request: Request,
    env: Env
  ) {


    const url =
      new URL(
        request.url
      );


    /*
     * ========================================
     * TEST API
     *
     * GET /api/test
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
     *
     * GET /api/test-db
     * ========================================
     */

    if (
      url.pathname ===
      '/api/test-db' &&

      request.method ===
      'GET'
    ) {


      const resultado =

        await env.DB

          .prepare(
            `
            SELECT *
            FROM reservas
            ORDER BY id DESC
            `
          )

          .all();


      return Response.json({

        ok: true,

        reservas:
        resultado.results

      });

    }


    /*
     * ========================================
     * DISPONIBILIDAD
     *
     * GET
     * /api/disponibilidad?fecha=YYYY-MM-DD
     * ========================================
     */

    if (
      url.pathname ===
      '/api/disponibilidad' &&

      request.method ===
      'GET'
    ) {


      const fecha =
        url.searchParams
          .get('fecha');


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


      const fechaParseada =
        parsearFecha(
          fecha
        );


      if (!fechaParseada) {


        return Response.json(
          {

            ok: false,

            mensaje:
              'La fecha indicada no es válida.'

          },
          {
            status: 400
          }
        );

      }


      if (
        !validarRangoFecha(
          fechaParseada
        )
      ) {


        return Response.json(
          {

            ok: false,

            mensaje:
              'La fecha está fuera del período disponible para reservas.'

          },
          {
            status: 400
          }
        );

      }


      /*
       * Reservas confirmadas.
       */

      const reservasResultado =

        await env.DB

          .prepare(
            `
            SELECT hora
            FROM reservas
            WHERE fecha = ?
            AND estado = 'confirmada'
            `
          )

          .bind(
            fecha
          )

          .all<{
            hora: string;
          }>();


      /*
       * Bloqueos administrativos.
       */

      const bloqueosResultado =

        await env.DB

          .prepare(
            `
            SELECT hora
            FROM bloqueos
            WHERE fecha = ?
            `
          )

          .bind(
            fecha
          )

          .all<{
            hora: string;
          }>();


      /*
       * Unir reservas y bloqueos.
       */

      const horasOcupadas = [

        ...reservasResultado
          .results
          .map(
            reserva =>
              reserva.hora
          ),

        ...bloqueosResultado
          .results
          .map(
            bloqueo =>
              bloqueo.hora
          )

      ];


      /*
       * Eliminar duplicados.
       */

      const horasUnicas =
        [
          ...new Set(
            horasOcupadas
          )
        ];


      return Response.json({

        ok: true,

        fecha,

        horasOcupadas:
        horasUnicas

      });

    }


    /*
     * ========================================
     * ADMIN - LISTAR RESERVAS
     *
     * GET /api/admin/reservas
     * ========================================
     */

    if (
      url.pathname ===
      '/api/admin/reservas' &&

      request.method ===
      'GET'
    ) {


      try {


        const resultado =

          await env.DB

            .prepare(
              `
              SELECT
                id,
                nombre,
                apellido,
                telefono,
                fecha,
                hora,
                estado,
                created_at

              FROM reservas

              ORDER BY
                fecha ASC,
                hora ASC
              `
            )

            .all<ReservaAdmin>();


        return Response.json({

          ok: true,

          reservas:
          resultado.results

        });


      } catch (error) {


        console.error(
          'Error al obtener reservas:',
          error
        );


        return Response.json(
          {

            ok: false,

            mensaje:
              'No se pudieron obtener las reservas.'

          },
          {
            status: 500
          }
        );

      }

    }


    /*
     * ========================================
     * ADMIN - CANCELAR RESERVA
     *
     * DELETE /api/admin/reservas/:id
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


        const partes =
          url.pathname
            .split('/');


        const idTexto =
          partes[
          partes.length - 1
            ];


        const id =
          Number(
            idTexto
          );


        if (
          !Number.isInteger(id) ||
          id <= 0
        ) {


          return Response.json(
            {

              ok: false,

              mensaje:
                'El identificador de la reserva no es válido.'

            },
            {
              status: 400
            }
          );

        }


        const reserva =

          await env.DB

            .prepare(
              `
              SELECT
                id,
                estado
              FROM reservas
              WHERE id = ?
              `
            )

            .bind(id)

            .first<{
              id: number;
              estado: string;
            }>();


        if (!reserva) {


          return Response.json(
            {

              ok: false,

              mensaje:
                'La reserva no existe.'

            },
            {
              status: 404
            }
          );

        }


        if (
          reserva.estado ===
          'cancelada'
        ) {


          return Response.json(
            {

              ok: false,

              mensaje:
                'La reserva ya está cancelada.'

            },
            {
              status: 409
            }
          );

        }


        await env.DB

          .prepare(
            `
            UPDATE reservas
            SET estado = 'cancelada'
            WHERE id = ?
            `
          )

          .bind(id)

          .run();


        return Response.json({

          ok: true,

          mensaje:
            'Reserva cancelada correctamente.'

        });


      } catch (error) {


        console.error(
          'Error al cancelar reserva:',
          error
        );


        return Response.json(
          {

            ok: false,

            mensaje:
              'No se pudo cancelar la reserva.'

          },
          {
            status: 500
          }
        );

      }

    }


    /*
     * ========================================
     * ADMIN - LISTAR BLOQUEOS
     *
     * GET /api/admin/bloqueos
     * ========================================
     */

    if (
      url.pathname ===
      '/api/admin/bloqueos' &&

      request.method ===
      'GET'
    ) {


      try {


        const resultado =

          await env.DB

            .prepare(
              `
              SELECT
                id,
                fecha,
                hora,
                motivo,
                created_at

              FROM bloqueos

              ORDER BY
                fecha ASC,
                hora ASC
              `
            )

            .all<BloqueoAdmin>();


        return Response.json({

          ok: true,

          bloqueos:
          resultado.results

        });


      } catch (error) {


        console.error(
          'Error al obtener bloqueos:',
          error
        );


        return Response.json(
          {

            ok: false,

            mensaje:
              'No se pudieron obtener los bloqueos.'

          },
          {
            status: 500
          }
        );

      }

    }


    /*
     * ========================================
     * ADMIN - CREAR BLOQUEO
     *
     * POST /api/admin/bloqueos
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


        /*
         * Campos obligatorios.
         */

        if (
          !fecha ||
          !hora
        ) {


          return Response.json(
            {

              ok: false,

              mensaje:
                'Debe indicar fecha y hora.'

            },
            {
              status: 400
            }
          );

        }


        /*
         * Fecha válida.
         */

        const fechaParseada =
          parsearFecha(
            fecha
          );


        if (!fechaParseada) {


          return Response.json(
            {

              ok: false,

              mensaje:
                'La fecha no es válida.'

            },
            {
              status: 400
            }
          );

        }


        /*
         * Solo dentro de los
         * próximos siete días.
         */

        if (
          !validarRangoFecha(
            fechaParseada
          )
        ) {


          return Response.json(
            {

              ok: false,

              mensaje:
                'Solo puedes bloquear horarios dentro del período disponible.'

            },
            {
              status: 400
            }
          );

        }


        /*
         * Formato de hora.
         */

        if (
          !horaValida(
            hora
          )
        ) {


          return Response.json(
            {

              ok: false,

              mensaje:
                'La hora no es válida.'

            },
            {
              status: 400
            }
          );

        }


        /*
         * Hora permitida
         * según el día.
         */

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


          return Response.json(
            {

              ok: false,

              mensaje:
                'Ese horario no corresponde al horario de atención de ese día.'

            },
            {
              status: 400
            }
          );

        }


        /*
         * No permitir bloquear una hora
         * con reserva confirmada.
         */

        const reservaExistente =

          await env.DB

            .prepare(
              `
              SELECT id
              FROM reservas
              WHERE fecha = ?
              AND hora = ?
              AND estado = 'confirmada'
              LIMIT 1
              `
            )

            .bind(
              fecha,
              hora
            )

            .first<{
              id: number;
            }>();


        if (
          reservaExistente
        ) {


          return Response.json(
            {

              ok: false,

              mensaje:
                'No puedes bloquear una hora que ya tiene una reserva confirmada.'

            },
            {
              status: 409
            }
          );

        }


        /*
         * Crear bloqueo.
         */

        const resultado =

          await env.DB

            .prepare(
              `
              INSERT INTO bloqueos
              (
                fecha,
                hora,
                motivo
              )
              VALUES (?, ?, ?)
              `
            )

            .bind(
              fecha,
              hora,
              motivo?.trim() || null
            )

            .run();


        return Response.json(
          {

            ok: true,

            mensaje:
              'Horario bloqueado correctamente.',

            id:
            resultado.meta
              .last_row_id

          },
          {
            status: 201
          }
        );


      } catch (error) {


        const mensajeError =

          error instanceof Error

            ? error.message

            : String(
              error
            );


        /*
         * UNIQUE(fecha, hora)
         */

        if (
          mensajeError.includes(
            'UNIQUE constraint failed'
          )
        ) {


          return Response.json(
            {

              ok: false,

              mensaje:
                'Ese horario ya está bloqueado.'

            },
            {
              status: 409
            }
          );

        }


        console.error(
          'Error al crear bloqueo:',
          error
        );


        return Response.json(
          {

            ok: false,

            mensaje:
              'No se pudo bloquear el horario.'

          },
          {
            status: 500
          }
        );

      }

    }


    /*
     * ========================================
     * ADMIN - ELIMINAR BLOQUEO
     *
     * DELETE /api/admin/bloqueos/:id
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


        const partes =
          url.pathname
            .split('/');


        const idTexto =
          partes[
          partes.length - 1
            ];


        const id =
          Number(
            idTexto
          );


        if (
          !Number.isInteger(id) ||
          id <= 0
        ) {


          return Response.json(
            {

              ok: false,

              mensaje:
                'El identificador del bloqueo no es válido.'

            },
            {
              status: 400
            }
          );

        }


        const bloqueo =

          await env.DB

            .prepare(
              `
              SELECT id
              FROM bloqueos
              WHERE id = ?
              `
            )

            .bind(id)

            .first<{
              id: number;
            }>();


        if (!bloqueo) {


          return Response.json(
            {

              ok: false,

              mensaje:
                'El bloqueo no existe.'

            },
            {
              status: 404
            }
          );

        }


        await env.DB

          .prepare(
            `
            DELETE FROM bloqueos
            WHERE id = ?
            `
          )

          .bind(id)

          .run();


        return Response.json({

          ok: true,

          mensaje:
            'Bloqueo eliminado correctamente.'

        });


      } catch (error) {


        console.error(
          'Error al eliminar bloqueo:',
          error
        );


        return Response.json(
          {

            ok: false,

            mensaje:
              'No se pudo eliminar el bloqueo.'

          },
          {
            status: 500
          }
        );

      }

    }


    /*
     * ========================================
     * CREAR RESERVA
     *
     * POST /api/reservas
     * ========================================
     */

    if (
      url.pathname ===
      '/api/reservas' &&

      request.method ===
      'POST'
    ) {


      try {


        /*
         * Leer JSON.
         */

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


        /*
         * ========================================
         * CAMPOS OBLIGATORIOS
         * ========================================
         */

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


        /*
         * ========================================
         * LIMPIAR DATOS
         * ========================================
         */

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


          return Response.json(
            {

              ok: false,

              mensaje:
                'El nombre y el apellido no son válidos.'

            },
            {
              status: 400
            }
          );

        }


        /*
         * ========================================
         * VALIDAR FECHA
         * ========================================
         */

        const fechaParseada =
          parsearFecha(
            fecha
          );


        if (!fechaParseada) {


          return Response.json(
            {

              ok: false,

              mensaje:
                'La fecha seleccionada no es válida.'

            },
            {
              status: 400
            }
          );

        }


        /*
         * ========================================
         * HOY → HOY + 7
         * ========================================
         */

        if (
          !validarRangoFecha(
            fechaParseada
          )
        ) {


          return Response.json(
            {

              ok: false,

              mensaje:
                'Solo puedes reservar desde hoy hasta los próximos 7 días.'

            },
            {
              status: 400
            }
          );

        }


        /*
         * ========================================
         * VALIDAR FORMATO DE HORA
         * ========================================
         */

        if (
          !horaValida(
            hora
          )
        ) {


          return Response.json(
            {

              ok: false,

              mensaje:
                'La hora seleccionada no es válida.'

            },
            {
              status: 400
            }
          );

        }


        /*
         * ========================================
         * VALIDAR HORARIO SEGÚN DÍA
         * ========================================
         */

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


          return Response.json(
            {

              ok: false,

              mensaje:
                'El horario seleccionado no corresponde al horario de atención de ese día.'

            },
            {
              status: 400
            }
          );

        }


        /*
         * ========================================
         * 30 MINUTOS DE ANTICIPACIÓN
         * ========================================
         */

        if (
          !validarAnticipacion(
            fechaParseada,
            hora
          )
        ) {


          return Response.json(
            {

              ok: false,

              mensaje:
                'La reserva debe realizarse con al menos 30 minutos de anticipación.'

            },
            {
              status: 400
            }
          );

        }


        /*
         * ========================================
         * COMPROBAR BLOQUEO MANUAL
         * ========================================
         */

        const bloqueoExistente =

          await env.DB

            .prepare(
              `
              SELECT id
              FROM bloqueos
              WHERE fecha = ?
              AND hora = ?
              LIMIT 1
              `
            )

            .bind(
              fecha,
              hora
            )

            .first<{
              id: number;
            }>();


        if (
          bloqueoExistente
        ) {


          return Response.json(
            {

              ok: false,

              mensaje:
                'Este horario no está disponible.'

            },
            {
              status: 409
            }
          );

        }


        /*
         * ========================================
         * INSERTAR RESERVA
         * ========================================
         */

        const resultado =

          await env.DB

            .prepare(
              `
              INSERT INTO reservas
              (
                nombre,
                apellido,
                telefono,
                fecha,
                hora
              )
              VALUES (?, ?, ?, ?, ?)
              `
            )

            .bind(

              nombreLimpio,

              apellidoLimpio,

              telefonoLimpio,

              fecha,

              hora

            )

            .run();


        /*
         * ========================================
         * RESERVA EXITOSA
         * ========================================
         */

        return Response.json(
          {

            ok: true,

            mensaje:
              'Reserva creada correctamente.',

            id:
            resultado.meta
              .last_row_id

          },
          {
            status: 201
          }
        );


      } catch (error) {


        const mensajeError =

          error instanceof Error

            ? error.message

            : String(
              error
            );


        /*
         * ========================================
         * FECHA + HORA DUPLICADA
         * ========================================
         */

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


        /*
         * ========================================
         * ERROR GENERAL
         * ========================================
         */

        console.error(
          'Error al crear reserva:',
          error
        );


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


    /*
     * ========================================
     * RUTA NO ENCONTRADA
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
