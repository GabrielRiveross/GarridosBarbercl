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
  BloqueosAdminResponse,
  CrearBloqueoRequest,
  RespuestaGeneral
} from '../models/admin.models';


@Injectable({
  providedIn: 'root'
})
export class AdminBloqueosService {


  private readonly apiUrl =
    '/api/admin/bloqueos';


  constructor(
    private http: HttpClient
  ) {}


  obtenerBloqueos():
    Observable<BloqueosAdminResponse> {

    return this.http
      .get<BloqueosAdminResponse>(
        this.apiUrl
      );

  }


  crearBloqueo(
    bloqueo: CrearBloqueoRequest
  ): Observable<RespuestaGeneral> {

    return this.http
      .post<RespuestaGeneral>(
        this.apiUrl,
        bloqueo
      );

  }


  eliminarBloqueo(
    id: number
  ): Observable<RespuestaGeneral> {

    return this.http
      .delete<RespuestaGeneral>(
        `${this.apiUrl}/${id}`
      );

  }

}
