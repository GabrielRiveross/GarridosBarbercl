export interface BloqueoRequest {

  fecha: string;

  hora: string;

  motivo?: string;

}


export interface BloqueoAdmin {

  id: number;

  fecha: string;

  hora: string;

  motivo: string | null;

  created_at: string;

}
