import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  HttpClient
} from '@angular/common/http';


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


interface ReservasAdminResponse {
  ok: boolean;
  reservas: ReservaAdmin[];
}


@Component({
  selector: 'app-admin',

  imports: [
    CommonModule
  ],

  templateUrl: './admin.html',

  styleUrl: './admin.scss'
})
export class Admin implements OnInit {


  reservas:
    ReservaAdmin[] = [];


  cargando = false;

  error = '';


  constructor(
    private http:
    HttpClient
  ) {}


  ngOnInit(): void {

    this.cargarReservas();

  }


  cargarReservas(): void {


    this.cargando = true;

    this.error = '';


    this.http
      .get<ReservasAdminResponse>(
        '/api/admin/reservas'
      )
      .subscribe({


        next: response => {


          this.reservas =
            response.reservas;


          this.cargando =
            false;

        },


        error: () => {


          this.cargando =
            false;


          this.error =
            'No fue posible cargar las reservas.';

        }

      });

  }


  formatearFecha(
    fecha: string
  ): string {


    const [
      anio,
      mes,
      dia
    ] =
      fecha
        .split('-')
        .map(Number);


    const fechaLocal =
      new Date(
        anio,
        mes - 1,
        dia
      );


    return fechaLocal
      .toLocaleDateString(
        'es-CL',
        {
          weekday: 'short',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }
      );

  }

}
