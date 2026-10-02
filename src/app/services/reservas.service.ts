import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Reserva } from '../models/reserva';

export interface ReservaResponse {
  ok: boolean;
  mensaje: string;
  id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReservasService {

  private readonly apiUrl =
    '/api/reservas';

  constructor(
    private http: HttpClient
  ) {}

  crearReserva(
    reserva: Reserva
  ): Observable<ReservaResponse> {

    return this.http.post<ReservaResponse>(
      this.apiUrl,
      reserva
    );
  }
}
