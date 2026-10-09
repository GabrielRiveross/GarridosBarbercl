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
  ReservasAdminResponse,
  RespuestaGeneral
} from '../models/admin.models';


@Injectable({
  providedIn: 'root'
})
export class AdminReservasService {


  private readonly apiUrl =
    '/api/admin/reservas';


  constructor(
    private http: HttpClient
  ) {}


  obtenerReservas():
    Observable<ReservasAdminResponse> {

    return this.http
      .get<ReservasAdminResponse>(
        this.apiUrl
      );

  }


  cancelarReserva(
    id: number
  ): Observable<RespuestaGeneral> {

    return this.http
      .delete<RespuestaGeneral>(
        `${this.apiUrl}/${id}`
      );

  }

}
