import {
  AppEnv
} from '../types/env';


export class AdminAuthService {


  private readonly cookieName =
    'garridos_admin_session';


  private readonly sessionDuration =
    60 * 60 * 12;


  constructor(
    private readonly env:
    AppEnv
  ) {}


  /*
   * ========================================
   * VALIDAR CONTRASEÑA
   * ========================================
   */

  validarPassword(
    password: string
  ): boolean {


    return (
      password ===
      this.env.ADMIN_PASSWORD
    );

  }


  /*
   * ========================================
   * CREAR COOKIE DE SESIÓN
   * ========================================
   */

  async crearCookieSesion():
    Promise<string> {


    const ahora =
      Math.floor(
        Date.now() /
        1000
      );


    const expiracion =
      ahora +
      this.sessionDuration;


    const token =
      await this.firmarSesion(
        expiracion
      );


    return (
      `${this.cookieName}=${token}; ` +
      `HttpOnly; ` +
      `Secure; ` +
      `SameSite=Strict; ` +
      `Path=/; ` +
      `Max-Age=${this.sessionDuration}`
    );

  }


  /*
   * ========================================
   * CREAR COOKIE PARA LOGOUT
   * ========================================
   */

  crearCookieLogout():
    string {


    return (
      `${this.cookieName}=; ` +
      `HttpOnly; ` +
      `Secure; ` +
      `SameSite=Strict; ` +
      `Path=/; ` +
      `Max-Age=0`
    );

  }


  /*
   * ========================================
   * COMPROBAR SESIÓN
   * ========================================
   */

  async estaAutenticado(
    request: Request
  ): Promise<boolean> {


    const token =
      this.obtenerCookie(
        request,
        this.cookieName
      );


    return this.verificarSesion(
      token
    );

  }


  /*
   * ========================================
   * FIRMAR SESIÓN
   * ========================================
   */

  private async firmarSesion(
    expiracion: number
  ): Promise<string> {


    const encoder =
      new TextEncoder();


    const clave =
      await crypto.subtle
        .importKey(
          'raw',
          encoder.encode(
            this.env
              .ADMIN_SESSION_SECRET
          ),
          {
            name: 'HMAC',
            hash: 'SHA-256'
          },
          false,
          [
            'sign'
          ]
        );


    const firma =
      await crypto.subtle
        .sign(
          'HMAC',
          clave,
          encoder.encode(
            String(
              expiracion
            )
          )
        );


    const firmaTexto =
      this.convertirBase64Url(
        firma
      );


    return (
      `${expiracion}.${firmaTexto}`
    );

  }


  /*
   * ========================================
   * VERIFICAR SESIÓN
   * ========================================
   */

  private async verificarSesion(
    token: string | null
  ): Promise<boolean> {


    if (!token) {

      return false;

    }


    const partes =
      token.split('.');


    if (
      partes.length !== 2
    ) {

      return false;

    }


    const expiracion =
      Number(
        partes[0]
      );


    if (
      !Number.isFinite(
        expiracion
      )
    ) {

      return false;

    }


    const ahora =
      Math.floor(
        Date.now() /
        1000
      );


    if (
      expiracion <= ahora
    ) {

      return false;

    }


    const esperado =
      await this.firmarSesion(
        expiracion
      );


    return (
      esperado === token
    );

  }


  /*
   * ========================================
   * LEER COOKIE
   * ========================================
   */

  private obtenerCookie(
    request: Request,
    nombre: string
  ): string | null {


    const encabezado =
      request.headers
        .get(
          'Cookie'
        );


    if (!encabezado) {

      return null;

    }


    const cookies =
      encabezado
        .split(';');


    for (
      const cookie of cookies
      ) {


      const [
        clave,
        ...valor
      ] =
        cookie
          .trim()
          .split('=');


      if (
        clave === nombre
      ) {

        return valor
          .join('=');

      }

    }


    return null;

  }


  /*
   * ========================================
   * BASE64 URL
   * ========================================
   */

  private convertirBase64Url(
    buffer: ArrayBuffer
  ): string {


    const bytes =
      new Uint8Array(
        buffer
      );


    let texto = '';


    for (
      const byte of bytes
      ) {

      texto +=
        String.fromCharCode(
          byte
        );

    }


    return btoa(
      texto
    )
      .replace(
        /\+/g,
        '-'
      )
      .replace(
        /\//g,
        '_'
      )
      .replace(
        /=+$/g,
        ''
      );

  }

}
