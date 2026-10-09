import {
  ReservaAdmin,
  ReservaRequest
} from '../types/reserva';


export class ReservasService {


  constructor(
    private readonly db:
    D1Database
  ) {}


  /*
   * ========================================
   * LISTAR TODAS LAS RESERVAS
   * ========================================
   */

  async listar():
    Promise<ReservaAdmin[]> {


    const resultado =

      await this.db

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


    return resultado.results;

  }


  /*
   * ========================================
   * HORAS RESERVADAS DE UNA FECHA
   * ========================================
   */

  async obtenerHorasConfirmadas(
    fecha: string
  ): Promise<string[]> {


    const resultado =

      await this.db

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


    return resultado.results
      .map(
        reserva =>
          reserva.hora
      );

  }


  /*
   * ========================================
   * BUSCAR RESERVA POR ID
   * ========================================
   */

  async buscarPorId(
    id: number
  ): Promise<{
    id: number;
    estado: string;
  } | null> {


    return this.db

      .prepare(
        `
        SELECT
          id,
          estado

        FROM reservas

        WHERE id = ?
        `
      )

      .bind(
        id
      )

      .first<{
        id: number;
        estado: string;
      }>();

  }


  /*
   * ========================================
   * COMPROBAR RESERVA CONFIRMADA
   * ========================================
   */

  async existeReservaConfirmada(
    fecha: string,
    hora: string
  ): Promise<boolean> {


    const reserva =

      await this.db

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


    return reserva !== null;

  }


  /*
   * ========================================
   * CREAR RESERVA
   * ========================================
   */

  async crear(
    reserva: ReservaRequest
  ): Promise<number> {


    const resultado =

      await this.db

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
          reserva.nombre,
          reserva.apellido,
          reserva.telefono,
          reserva.fecha,
          reserva.hora
        )

        .run();


    return Number(
      resultado.meta
        .last_row_id
    );

  }


  /*
   * ========================================
   * CANCELAR RESERVA
   * ========================================
   */

  async cancelar(
    id: number
  ): Promise<void> {


    await this.db

      .prepare(
        `
        UPDATE reservas

        SET estado = 'cancelada'

        WHERE id = ?
        `
      )

      .bind(
        id
      )

      .run();

  }

}
