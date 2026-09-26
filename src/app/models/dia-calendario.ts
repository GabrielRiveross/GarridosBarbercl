export interface DiaCalendario {
  fecha: Date;
  numero: number;

  esMesActual: boolean;
  esHoy: boolean;
  disponible: boolean;
  seleccionado: boolean;
}
