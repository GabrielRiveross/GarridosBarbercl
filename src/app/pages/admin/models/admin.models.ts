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


export interface BloqueoAdmin {
  id: number;
  fecha: string;
  hora: string;
  motivo: string | null;
  created_at: string;
}


export interface ReservasAdminResponse {
  ok: boolean;
  reservas: ReservaAdmin[];
}


export interface BloqueosAdminResponse {
  ok: boolean;
  bloqueos: BloqueoAdmin[];
}


export interface RespuestaGeneral {
  ok: boolean;
  mensaje: string;
}


export interface SessionResponse {
  ok: boolean;
  autenticado: boolean;
}


export interface CrearBloqueoRequest {
  fecha: string;
  hora: string;
  motivo: string;
}
