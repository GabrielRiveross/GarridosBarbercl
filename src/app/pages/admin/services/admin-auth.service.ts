import {
  Injectable
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  RespuestaGeneral,
  SessionResponse
} from '../models/admin.models';


@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {


  private readonly apiUrl =
    '/api/admin';


  constructor(
    private http: HttpClient
  ) {}


  comprobarSesion():
    Observable<SessionResponse> {

    return this.http
      .get<SessionResponse>(
        `${this.apiUrl}/session`
      );

  }


  iniciarSesion(
    password: string
  ): Observable<RespuestaGeneral> {

    return this.http
      .post<RespuestaGeneral>(
        `${this.apiUrl}/login`,
        {
          password
        }
      );

  }


  cerrarSesion():
    Observable<RespuestaGeneral> {

    return this.http
      .post<RespuestaGeneral>(
        `${this.apiUrl}/logout`,
        {}
      );

  }

}
