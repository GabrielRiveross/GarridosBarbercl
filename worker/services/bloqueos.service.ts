import {
  BloqueoAdmin,
  BloqueoRequest
} from '../types/bloqueo';


export class BloqueosService {


  constructor(
    private readonly db:
    D1Database
  ) {}


  /*
   * ========================================
   * LISTAR BLOQUEOS
   * ========================================
   */

  async listar():
    Promise<BloqueoAdmin[]> {


    const resultado =

      await this.db

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


    return resultado.results;

  }


  /*
   * ========================================
   * HORAS BLOQUEADAS DE UNA FECHA
   * ========================================
   */

  async obtenerHorasBloqueadas(
    fecha: string
  ): Promise<string[]> {


    const resultado =

      await this.db

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


    return resultado.results
      .map(
        bloqueo =>
          bloqueo.hora
      );

  }


  /*
   * ========================================
   * COMPROBAR BLOQUEO
   * ========================================
   */

  async existeBloqueo(
    fecha: string,
    hora: string
  ): Promise<boolean> {


    const bloqueo =

      await this.db

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


    return bloqueo !== null;

  }


  /*
   * ========================================
   * BUSCAR BLOQUEO POR ID
   * ========================================
   */

  async buscarPorId(
    id: number
  ): Promise<{
    id: number;
  } | null> {


    return this.db

      .prepare(
        `
        SELECT id

        FROM bloqueos

        WHERE id = ?
        `
      )

      .bind(
        id
      )

      .first<{
        id: number;
      }>();

  }


  /*
   * ========================================
   * CREAR BLOQUEO
   * ========================================
   */

  async crear(
    bloqueo: BloqueoRequest
  ): Promise<number> {


    const resultado =

      await this.db

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
          bloqueo.fecha,
          bloqueo.hora,
          bloqueo.motivo?.trim() ||
          null
        )

        .run();


    return Number(
      resultado.meta
        .last_row_id
    );

  }


  /*
   * ========================================
   * ELIMINAR BLOQUEO
   * ========================================
   */

  async eliminar(
    id: number
  ): Promise<void> {


    await this.db

      .prepare(
        `
        DELETE FROM bloqueos

        WHERE id = ?
        `
      )

      .bind(
        id
      )

      .run();

  }

}
