export interface ReservaRequest {

  nombre: string;

  apellido: string;

  telefono: string;

  fecha: string;

  hora: string;

}


export interface ReservaAdmin {

  id: number;

  nombre: string;

  apellido: string;

  telefono: string;

  fecha: string;

  hora: string;

  estado: string;

  created_at: string;

}
